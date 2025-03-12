import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  Platform,
  Button
} from 'react-native';



const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
  },
  title: {
    fontSize: 20,
    marginBottom: 20,
  },
  board: {
    flexDirection: 'column',
    marginTop: 10,
  },
  row: {
    flexDirection: 'row',
  },
  pixel: {
    width: 50,
    height: 50,
    margin: 2,
    borderWidth: 1,
    borderColor: 'gray',
  },
  button:{
    backgroundColor: "#31572C",
    paddingVertical: 5,
    paddingHorizontal: 5,
    borderRadius: 15,
    alignItems: "center",
    width: "100%",
  },
  buttonText:{
    color:'white'
  }
});




const App = ({ navigation, route }) => {

  const [grid, setGrid] = useState([
    [0, 0],
    [0, 0],
    [0, 0],
  ]);

  useEffect(() => {
    if (route.params?.grid) {
      const newGrid = route.params?.grid
      setGrid(newGrid);
    }
  }, [route.params?.grid]);

  const sendDataToESP32 = async () => {
    try {
      const esp32IP = "http://192.168.2.153"; // Replace with your ESP32's IP
      const response = await fetch(`${esp32IP}/data`, {
        method: "POST",
        headers: {
          "Content-Type": "text/plain",
        },
        body: JSON.stringify(grid.flat()), // Change this to whatever data you need to send
      });
  
      const responseText = await response.text();
      console.log("Response from ESP32:", responseText);
    } catch (error) {
      console.error("Error sending data:", error);
    }
  };

  const clearDrawing =() => {
    const newGrid = [[0, 0],[0, 0],[0, 0]]
    setGrid(newGrid)
  }
  // Handle drawing (toggle between 'on' and 'off' state)
  const handlePress = (row: number, col: number) => {
    const newGrid = [...grid];
    newGrid[row][col] = newGrid[row][col] === 0 ? 1 : 0;
    setGrid(newGrid);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Draw on 3x2 Pixel Board</Text>
      <View style={styles.board}>
        {grid.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.row}>
            {row.map((cell, colIndex) => (
              <TouchableOpacity
                key={colIndex}
                style={[
                  styles.pixel,
                  { backgroundColor: cell === 0 ? 'white' : 'black' },
                ]}
                onPress={() => handlePress(rowIndex, colIndex)}
              />
            ))}
          </View>
        ))}
        <Button title='Send' onPress={sendDataToESP32}></Button>
        <TouchableOpacity style={styles.button} onPress={clearDrawing}>
          <Text style={styles.buttonText}>Clear</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};


export default App;

