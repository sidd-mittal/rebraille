import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { GestureHandlerRootView, PanGestureHandler } from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function App() {
  const [grid, setGrid] = useState(Array(3).fill(Array(2).fill('white')));
  const [tool, setTool] = useState('pencil');
  const [isDrawing, setIsDrawing] = useState(false);

  const handleCellPress = (row, col) => {
    const newGrid = grid.map((r, rIndex) =>
      rIndex === row
        ? r.map((c, cIndex) => (cIndex === col ? (tool === 'pencil' ? 'black' : 'white') : c))
        : r
    );
    setGrid(newGrid);
  };

  const handlePanGesture = ({ nativeEvent }) => {
    if (isDrawing) {
      const row = Math.floor(nativeEvent.y / 70);
      const col = Math.floor(nativeEvent.x / 70);
      if (row >= 0 && row < 3 && col >= 0 && col < 2) {
        handleCellPress(row, col);
      }
    }
  };

  const sendDataToESP32 = async () => {
    try {
      const esp32IP = "http://192.168.2.153";
      const response = await fetch(`${esp32IP}/data`, {
        method: "POST",
        headers: {
          "Content-Type": "text/plain",
        },
        body: JSON.stringify(grid.flat()),
      });
      const responseText = await response.text();
      console.log("Response from ESP32:", responseText);
    } catch (error) {
      console.error("Error sending data:", error);
    }
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <PanGestureHandler
        onGestureEvent={handlePanGesture}
        onHandlerStateChange={({ nativeEvent }) => {
          if (nativeEvent.state === 4) {
            setIsDrawing(true);
          } else if (nativeEvent.state === 5) {
            setIsDrawing(false);
          }
        }}
      >
        <View style={styles.canvas}>{renderGrid()}</View>
      </PanGestureHandler>
      <View style={styles.toolContainer}>
        <TouchableOpacity style={styles.toolButton} onPress={() => setTool('pencil')}>
          <Icon name="pencil" size={24} color={tool === 'pencil' ? 'blue' : 'black'} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.toolButton} onPress={() => setTool('eraser')}>
          <Icon name="eraser" size={24} color={tool === 'eraser' ? '#375f92' : 'black'} backgroundColor={tool === 'eraser' ? 'white' : 'black'} />
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.toolButton} onPress={() => setGrid(Array(3).fill(Array(2).fill('white')))}>
        <Text>Clear</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.toolButton} onPress={sendDataToESP32}>
        <Text>Send to ESP32</Text>
      </TouchableOpacity>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  toolContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  toolButton: {
    padding: 10,
    backgroundColor: '#ccc',
    margin: 5,
    borderRadius: 5,
  },
  canvas: {
    flexDirection: 'column',
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    width: 70,
    height: 70,
    margin: 1,
  },
});
