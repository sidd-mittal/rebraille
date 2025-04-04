import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  Platform,
  Animated,
  Button,
  Modal,
  TextInput,
  ActivityIndicator
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as Font from 'expo-font';
import {FLASK_URL} from '../config'
import { PanResponder } from 'react-native';

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
  const [drawingName, setDrawingName] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false); // Loading state

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
      const newGrid = route.params.grid.map(row => [...row]); // Copy each row
      setGrid(newGrid);
    }
  }, [route.params?.grid]);

  const sendDataToESP32 = async () => {
    setLoading(true); 
    try {

      const timeout = 15000; 

      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Request timed out")), timeout)
      );

      const esp32IP =  "http://192.168.4.1" //"http://192.168.2.153"; // Replace with ESP32 IP
      const response = await Promise.race([
        fetch(`${esp32IP}/data`, {
          method: "POST",
          headers: {
            "Content-Type": "text/plain",
          },
          body: JSON.stringify(grid.flat()),
        }),
        timeoutPromise, 
      ]);

      const responseText = await response.text();
      console.log("Response from ESP32:", responseText);
      setMessage("Response from ESP32" + responseText);
      setMessageVisible(true);
      setLoading(false)
    
      Animated.timing(opacity, {
        toValue: 1,
        duration: 500, // Duration for fade-in
        useNativeDriver: true,
      }).start();
    
      setTimeout(() => {
        Animated.timing(opacity, {
          toValue: 0,
          duration: 500, // Duration for fade-out
          useNativeDriver: true,
        }).start();
    
        setTimeout(() => {
          setMessageVisible(false);
        }, 500); 
      }, 3000); 
    } catch (error) {
      setLoading(false); // Start loading
      console.error("Error sending data:", error);
      setMessage("Error Sending Data. Please check your connection");
      setMessageVisible(true);
      Animated.timing(opacity, {
        toValue: 1,
        duration: 500, // Duration for fade-in
        useNativeDriver: true,
      }).start();
    
      setTimeout(() => {
        Animated.timing(opacity, {
          toValue: 0,
          duration: 500, // Duration for fade-out
          useNativeDriver: true,
        }).start();
    
        setTimeout(() => {
          setMessageVisible(false);
        }, 500); 
      }, 3000); 
    }
  };

  const clearDrawing = () => {
    const newGrid = [[0, 0], [0, 0], [0, 0]];
    setGrid(newGrid);
  };


  const fetchMessage = async () => {
    try {
      const response = await fetch(`${FLASK_URL}/test`);  // Replace <mac-ip> with your Mac's IP address
      const data = await response.json();
      alert(data.message);  // Show the message from Flask
    } catch (error) {
      alert('Error connecting to Flask server');
    }
  };

  const handleSaveClick= () => {
    setModalVisible(true); 
  }
  const saveDrawing = async () => {
    try {
      setModalVisible(false)
      const response = await fetch(`${FLASK_URL}/drawings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: 1,  // Change this dynamically if needed
          drawing_name: drawingName,
          drawing_array: JSON.stringify(grid.flat()),
        }),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        
        setMessage('Successfully Saved Drawing');
        setMessageVisible(true);
        navigation.navigate("Templates", {
          screen: "Saved Drawings", // This is the top tab navigator component inside Templates
          params: { newPixels: grid.flat(), label: drawingName }
        });
      
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

        setDrawingName("")
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Error saving drawing:', error);
    }


  };

  const handlePress = (row, col) => {
    const newGrid = [...grid];
    newGrid[row][col] = grid[row][col] == 1 ? 0 : 1;
    setGrid(newGrid);
  };

  const rows = 3;
  const cols = 2;

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: (evt, gestureState) => {
      const { moveX, moveY } = gestureState;
      const rowIndex = Math.floor((moveY-50) / 116) -2; // Assuming 50px per pixel
      const colIndex = Math.floor((moveX) / 116) - 5; // Assuming 50px per pixel
      console.log(rowIndex, colIndex)
      if (rowIndex >= 0 && rowIndex < rows && colIndex >= 0 && colIndex < cols) {
        const newGrid = [...grid];
        console.log(newGrid)
        newGrid[rowIndex][colIndex] = tool === 'pencil' ? 1: 0; // Turn the pixel black
        setGrid(newGrid);
      }
    },
  });

  return (
    <SafeAreaView style={styles.container} >
        {messageVisible && (
          <Animated.View style={[styles.messageBubble, { opacity }]}>
            <Text style={styles.messageText}>{message}</Text>
          </Animated.View>
        )}
      <Text style={styles.title}>ReBraille</Text>
      {/* <View >
              <Text>React Native + Flask Test</Text>
              <Button title="Fetch Message from Flask" onPress={fetchMessage} />
            </View> */}
      {/* Pixel Grid */}
      <View style={styles.wrapper}>

        <View style={styles.board} {...panResponder.panHandlers}>
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

          <TouchableOpacity style={styles.saveButton}  onPress={handleSaveClick}>
            <Icon name="content-save" size={30} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Send Button */}
        <TouchableOpacity style={styles.sendButton} onPress={sendDataToESP32} disabled={loading}>
        {loading ? (
        <ActivityIndicator size="small" color="#fff" />
      ) : (
        <>
          <Text style={styles.sendText}>Send to Device</Text>
          <Icon name="send" size={24} color="#fff" />
        </>
      )}
        </TouchableOpacity>


        <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalBackground}>
          <View style={styles.popupBox}>
            <Text style={styles.popupTitle}>Enter Drawing Name</Text>
            <TextInput
              value={drawingName}
              onChangeText={setDrawingName}
              placeholder=""
              style={styles.input}
            />
            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.savePopupButton, !drawingName.trim() && styles.disabledButton]}
                onPress={saveDrawing}
                disabled={!drawingName.trim()} // Disables button if empty
              >
                <Text style={styles.savePopupButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    fontSize: 60,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    fontFamily:'theSeasons',
  },
  wrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
    width: '100%',
    padding: 20,
  },
  board: {
    flexDirection: 'column',
    marginBottom: 10,
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
  },
  pixel: {
    width: 110,
    height: 110,
    margin: 3,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 30,
  },
  toolContainer: {
    flexDirection: 'row',
    marginBottom: 40,
    justifyContent: 'center',
    width: '100%',
  },
  toolButton: {
    padding: 20,
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
    padding: 20,
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
    paddingVertical: 20,
    paddingHorizontal: 40,
    borderRadius: 8,
    marginTop: 5,
  },
  saveButton:{
    padding: 20,
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
    top: 20,
    marginTop: 60,
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
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  popupBox: {
    width: 300,
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  popupTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  input: {
    width: '100%',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    padding: 5,
    marginBottom: 15,
    marginTop: 20,
    textAlign: 'center',
    fontSize: 20,
  },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
  cancelButton: { paddingVertical: 8, paddingHorizontal: 15 },
  cancelButtonText: { color: 'red' },
  savePopupButton: {
    backgroundColor: '#375f92',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 5,
  },
  savePopupButtonText: { color: 'white', fontWeight: 'bold' },
  disabledButton: { backgroundColor: '#ccc' }, // Grayed out when input is empty
});

export default App;
