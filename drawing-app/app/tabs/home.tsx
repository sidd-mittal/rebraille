import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  Platform,
  Animated
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as Font from 'expo-font';

const App = ({ navigation, route }) => {
  const [grid, setGrid] = useState([
    [0, 0],
    [0, 0],
    [0, 0],
  ]);
  const [tool, setTool] = useState('pencil');
  const [message, setMessage] = useState("");
  const [messageVisible, setMessageVisible] = useState(false); 
  const [opacity] = useState(new Animated.Value(0)); // Initial opacity set to 0

  useEffect(() => {
    const loadFonts = async () => {
      await Font.loadAsync({
        'theSeasons': require('../../assets/fonts/Fontspring-DEMO-theseasons-lt.otf'),
      });
    };
    
    loadFonts();
  }, []);

  useEffect(() => {
    if (route.params?.grid) {
      const newGrid = route.params?.grid;
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
        body: JSON.stringify(grid.flat()), // Send the flattened grid data
      });

      const responseText = await response.text();
      console.log("Response from ESP32:", responseText);
    } catch (error) {
      console.error("Error sending data:", error);
    }
  };

  const clearDrawing = () => {
    const newGrid = [[0, 0], [0, 0], [0, 0]];
    setGrid(newGrid);
  };

  const saveDrawing = () => {
    setMessage('Successfully Saved Drawing');
    setMessageVisible(true);
  
    // Fade in the message
    Animated.timing(opacity, {
      toValue: 1,
      duration: 500, // Duration for fade-in
      useNativeDriver: true,
    }).start();
  
    setTimeout(() => {
      // Fade out the message after 3 seconds
      Animated.timing(opacity, {
        toValue: 0,
        duration: 500, // Duration for fade-out
        useNativeDriver: true,
      }).start();
  
      setTimeout(() => {
        setMessageVisible(false);
      }, 500); // Wait for fade-out to finish before hiding the message
    }, 3000); // Hide after 3 seconds
  };

  const handlePress = (row, col) => {
    const newGrid = [...grid];
    newGrid[row][col] = newGrid[row][col] === 0 ? 1 : 0;
    setGrid(newGrid);
  };

  return (
    <SafeAreaView style={styles.container}>
                      {messageVisible && (
  <Animated.View style={[styles.messageBubble, { opacity }]}>
    <Text style={styles.messageText}>{message}</Text>
  </Animated.View>
)}
      <Text style={styles.title}>ReBraille</Text>
      
      {/* Pixel Grid */}
      <View style={styles.wrapper}>

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
        </View>

        {/* Tool Controls */}
        <View style={styles.toolContainer}>
          <TouchableOpacity
            style={[styles.toolButton, tool === 'pencil' && styles.activeTool]}
            onPress={() => setTool('pencil')}
          >
            <Icon name="pencil" size={24} color={tool === 'pencil' ? '#fff' : '#555'} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.toolButton, tool === 'eraser' && styles.activeTool]}
            onPress={() => setTool('eraser')}
          >
            <Icon name="eraser" size={24} color={tool === 'eraser' ? '#fff' : '#555'} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.clearButton} onPress={clearDrawing}>
            <Icon name="close-circle" size={30} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.saveButton} onPress={saveDrawing}>
            <Icon name="content-save" size={30} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Send Button */}
        <TouchableOpacity style={styles.sendButton} onPress={sendDataToESP32}>
          <Text style={styles.sendText}>Send to Device</Text>
          <Icon name="send" size={24} color="#fff" />
        </TouchableOpacity>


      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 30,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    fontFamily:'theSeasons',
  },
  wrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
    width: '90%',
    padding: 20,
  },
  board: {
    flexDirection: 'column',
    marginBottom: 30,
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
  },
  pixel: {
    width: 70,
    height: 70,
    margin: 3,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
  },
  toolContainer: {
    flexDirection: 'row',
    marginBottom: 10,
    justifyContent: 'center',
    width: '100%',
  },
  toolButton: {
    padding: 12,
    backgroundColor: '#f0f0f0',
    margin: 5,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'grey',
  },
  activeTool: {
    backgroundColor: '#375f92',
  },
  clearButton: {
    padding: 12,
    backgroundColor: '#FF5252',
    margin: 5,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#375f92',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginTop: 5,
  },
  saveButton:{
    padding: 12,
    backgroundColor: '#6fae58',
    margin: 5,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendText: {
    color: '#fff',
    fontSize: 16,
    marginRight: 10,
  },
  messageBubble: {
    position: 'absolute',
    top: 5,
    backgroundColor: 'grey',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    maxWidth: '80%',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  messageText: {
    color: '#fff',
    fontSize: 14,
  },
});

export default App;
