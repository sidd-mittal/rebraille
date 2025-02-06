import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  Platform
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

const App = () => {
  const [grid, setGrid] = useState(
    Array(3)
      .fill(null)
      .map(() => Array(2).fill(false)) // Creates a 3x2 grid (false means white pixel)
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [bluetoothDevice, setBluetoothDevice] = useState<BluetoothDevice | null>(null);
  const [bluetoothError, setBluetoothError] = useState<string | null>(null);
  const [sendStatus, setSendStatus] = useState<string | null>(null);

  const [tool, setTool] = useState<'pencil' | 'eraser'>('pencil');
  const touchRef = useRef<{ row: number; col: number } | null>(null);
  const testBluetooth = async (): Promise<void> => {
    if (Platform.OS !== 'web') {
      setBluetoothError('Bluetooth API is only supported on web browsers.');
      return;
    }

    try {
      setBluetoothError(null);
      const device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: ['battery_service'], // Adjust as needed for your device
      });

      setBluetoothDevice(device);
      console.log(`Connected to device: ${device.name}`);
    } catch (error: any) {
      setBluetoothError(error.message);
    }
  };

  // Function to update pixel state
  const updatePixel = (row: number, col: number) => {
    setGrid((prevGrid) => {
      const newGrid = prevGrid.map((rowArray, rowIndex) =>
        rowArray.map((pixel, colIndex) =>
          rowIndex === row && colIndex === col
            ? tool === 'pencil' // Set to black if pencil, white if eraser
            : pixel
        )
      );
      return newGrid;
    });
  };

  // Helper to calculate interpolated pixels (for skipped touches)
  const interpolatePixels = (prev, current) => {
    const interpolated = [];
    const rowDiff = current.row - prev.row;
    const colDiff = current.col - prev.col;
    const steps = Math.max(Math.abs(rowDiff), Math.abs(colDiff));
    for (let i = 1; i <= steps; i++) {
      interpolated.push({
        row: prev.row + Math.round((rowDiff * i) / steps),
        col: prev.col + Math.round((colDiff * i) / steps),
      });
    }
    return interpolated;
  };

  // Function to handle touch move
  const handleTouchMove = (e: any) => {
    const { locationX, locationY } = e.nativeEvent;
    const row = Math.floor(locationY / 100); // Y position determines row (100px for each pixel)
    const col = Math.floor(locationX / 100); // X position determines column (100px for each pixel)

    if (row < 3 && col < 2 && row >= 0 && col >= 0) {
      // Ensure we are inside grid bounds
      const current = { row, col };
      if (!touchRef.current) {
        updatePixel(row, col); // Update the first touched pixel
      } else {
        // Fill in skipped pixels
        const interpolatedPixels = interpolatePixels(touchRef.current, current);
        interpolatedPixels.forEach(({ row, col }) => updatePixel(row, col));
      }
      touchRef.current = current; // Update current pixel position
    }
  };

  // Function to handle touch start
  const handleTouchStart = (e: any) => {
    touchRef.current = null; // Reset the touch reference
    handleTouchMove(e); // Start drawing immediately
  };

  // Function to handle touch end
  const handleTouchEnd = () => {
    touchRef.current = null; // Reset after the touch gesture ends
  };

  const sendGridData = async (): Promise<void> => {
    setSendStatus(null);

    if (!bluetoothDevice) {
      setSendStatus('No device paired.');
      return;
    }

    try {
      const server = await bluetoothDevice.gatt?.connect();
      const service = await server?.getPrimaryService('battery_service'); // Adjust service UUID as needed
      const characteristic = await service?.getCharacteristic('battery_level'); // Adjust characteristic UUID as needed

      // Send the array [0, 1]
      // const data = new Uint8Array([[],[],[]]);
      const flattenedGrid = grid.flat().map((pixel) => (pixel ? 1 : 0));
      console.log('Grid Data to Send:', flattenedGrid);
      const flatData = new Uint8Array(
        flattenedGrid
      );
      await characteristic?.writeValue(flatData);
      setSendStatus('Data sent successfully.');
    } catch (error: any) {
      setSendStatus(`Error sending data: ${error.message}`);
    }
    Alert.alert('Send', 'Grid data has been sent via Bluetooth!');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View
        style={styles.gridContainer}
        onStartShouldSetResponder={() => true} // Always allow touch gestures
        onResponderMove={handleTouchMove} // Handle touch move for stroke drawing
        onResponderStart={handleTouchStart} // Handle touch start
        onResponderRelease={handleTouchEnd} // Handle touch release
      >
        {grid.map((row, rowIndex) =>
          row.map((pixel, colIndex) => (
            <View
              key={`${rowIndex}-${colIndex}`}
              style={[
                styles.pixel,
                { backgroundColor: pixel ? 'black' : 'white' },
              ]}
            />
          ))
        )}
      </View>

      <View style={styles.buttonsContainer}>
        <TouchableOpacity style={styles.button} onPress={() => setTool('pencil')}>
          <Text style={styles.buttonText}>Pencil</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => setTool('eraser')}>
          <Text style={styles.buttonText}>Eraser</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={sendGridData}>
          <Text style={styles.buttonText}>Send</Text>
          {sendStatus && {sendStatus}}
        </TouchableOpacity>
        
      </View>
      <Icon
        name="bluetooth"
        size={30}
        color="black"
        onPress={testBluetooth}
        style={styles.bluetoothButton}
      />
                  {bluetoothDevice && (
            <a>Connected to: {bluetoothDevice.name || 'Unknown Device'}</a>
          )}
          {bluetoothError && (
            <a style={styles.errorText}>Error: {bluetoothError}</a>
          )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 200, // 2 columns, each 100px wide
    height: 300, // 3 rows, each 100px tall
  },
  pixel: {
    width: 100,
    height: 100,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  buttonsContainer: {
    flexDirection: 'row',
    marginTop: 20,
  },
  button: {
    padding: 10,
    margin: 5,
    backgroundColor: '#ddd',
    borderRadius: 5,
  },
  buttonText: {
    fontSize: 16,
  },
  bluetoothButton: {
    marginTop: 20,

    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default App;

