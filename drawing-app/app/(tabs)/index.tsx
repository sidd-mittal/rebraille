import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
// You'd need to import a Bluetooth library like 'react-native-ble-plx' for real Bluetooth functionality

const App = () => {
  // State for the grid (2x3 matrix)
  const [grid, setGrid] = useState(
    Array(3).fill(null).map(() => Array(2).fill(false)) // Creates a 3x2 grid (false means white pixel)
  );

  // State for the current tool (pencil or eraser)
  const [tool, setTool] = useState<'pencil' | 'eraser'>('pencil');

  // Ref to track touch movements
  const touchRef = useRef<{ row: number; col: number } | null>(null);

  // Function to toggle pixel state
  const togglePixel = (row: number, col: number) => {
    setGrid((prevGrid) => {
      const newGrid = [...prevGrid];
      newGrid[row][col] = tool === 'pencil'; // Set the pixel to black if pencil is selected, white if eraser is selected
      return newGrid;
    });
  };

  // Function to handle touch move and update the grid while dragging
  const handleTouchMove = (e: any) => {
    const { locationX, locationY } = e.nativeEvent;
    const row = Math.floor(locationY / 100); // Y position determines row (100px for each pixel)
    const col = Math.floor(locationX / 100); // X position determines column (100px for each pixel)

    if (row < 3 && col < 2) {
      // Ensure we are inside grid bounds (3 rows, 2 columns)
      if (touchRef.current?.row !== row || touchRef.current?.col !== col) {
        togglePixel(row, col);
        touchRef.current = { row, col }; // Update the current pixel position to avoid redundant updates
      }
    }
  };

  // Function to handle touch start
  const handleTouchStart = (e: any) => {
    handleTouchMove(e); // Start drawing or erasing immediately
  };

  // Function to send the grid data as a 1D array via Bluetooth
  const sendGridData = () => {
    // Convert the grid to a 1D array of 1s (black) and 0s (white)
    const flattenedGrid = grid.flat().map((pixel) => (pixel ? 1 : 0));

    // Log the data to the console
    console.log('Grid Data to Send:', flattenedGrid);

    // Placeholder for Bluetooth functionality
    Alert.alert('Send', 'Grid data has been sent via Bluetooth!');
    // Here you'd add your Bluetooth send logic using a library like react-native-ble-plx
  };

  return (
    <SafeAreaView style={styles.container}>
      <View
        style={styles.gridContainer}
        onStartShouldSetResponder={() => true}
        onResponderMove={handleTouchMove} // Handle the touch move event for dragging
        onResponderStart={handleTouchStart} // Handle touch start
      >
        {grid.map((row, rowIndex) =>
          row.map((pixel, colIndex) => (
            <TouchableOpacity
              key={`${rowIndex}-${colIndex}`}
              style={[styles.pixel, { backgroundColor: pixel ? 'black' : 'white' }]}
              onPress={() => togglePixel(rowIndex, colIndex)} // Single click to toggle
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
        </TouchableOpacity>
      </View>
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
    width: 100, // Increased pixel size to 100px
    height: 100, // Increased pixel size to 100px
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
});

export default App;
