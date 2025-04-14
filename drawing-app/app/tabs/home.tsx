import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Platform,
  Animated,
  StyleSheet,
  Easing,
  Modal,
  TextInput,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import { useRouter } from "expo-router"; 
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as Font from 'expo-font';
import {FLASK_URL} from '../config'
import { PanResponder } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

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
  const [logOutModal, setLogoutModal] = useState(false); // Loading state

  const [instructionModal, setInstructionModal] = useState(false);
  const translateY = useRef(new Animated.Value(50)).current;
  const scale = useRef(new Animated.Value(0.5)).current;
  const shadowOpacity = useRef(new Animated.Value(0.4)).current;

  let animationRef = null; // declare this outside your function (e.g., at the top of the component)
  let isAnimating = true;  // control flag to stop the loop
  
  const router = useRouter(); 
  const handleLogout = () => {
    setLogoutModal(false);
    router.push("/login"); // Navigate if true
    // Add your logout logic here
    console.log('User logged out');
  };

  const startAnimation = () => {
    const animate = () => {
      if (!isAnimating) return;
  
      scale.setValue(0.5);
      shadowOpacity.setValue(0.4);
      translateY.setValue(0);
  
      animationRef = Animated.sequence([
        Animated.parallel([
          Animated.timing(scale, {
            toValue: 0.95,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
        Animated.delay(200),
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: 60,
            duration: 1200,
            easing: Easing.in(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(scale, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ]),
        Animated.delay(200),
      ]);
  
      animationRef.start(() => {
        animate(); // recursively start the loop again
      });
    };
  
    isAnimating = true;
    animate();
  };

  const stopAnimation = () => {
    isAnimating = false;
    if (animationRef) {
      animationRef.stop();
    }
  };  

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

  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const sendDataToESP32 = async () => {
    setInstructionModal(true)
    setLoading(true); 
    startAnimation()
    try {
      await delay(3000); // wait for 1 second
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
      setMessage("Successfully Sent Data. Please Place Hand on Device");
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
      setInstructionModal(false)
    } catch (error) {
      setLoading(false); // Start loading
      setInstructionModal(false)
      stopAnimation()
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
      <Modal
        visible={instructionModal}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalBox}>
            <View style={styles.box}>
            <View style={styles.dotsContainer}>
              <View style={styles.dotRow}>
                <View style={styles.dot} />
                <View style={styles.dot} />
              </View>
              <View style={styles.dotRow}>
                <View style={styles.dot} />
                <View style={styles.dot} />
              </View>
              <View style={styles.dotRow}>
                <View style={styles.dot} />
                <View style={styles.dot} />
              </View>
            </View>
            <Animated.View
              style={[
                {
                  position: 'absolute',
                  zIndex: 2,
                  transform: [{ translateY }, { scale }],
                },
              ]}
            >
              <Icon name="hand-back-left" size={80} color="#375f92" />
            </Animated.View>
            </View>
            <Text style = {styles.instructionText}>Please remove hand from device</Text>
          </View>
        </View>
      </Modal>
      <View style={styles.profileIcon}>
      <TouchableOpacity onPress={() => setLogoutModal(true)}>
        <Ionicons name="person-circle-outline" size={50} color="#000" />
      </TouchableOpacity>

      <Modal
        transparent
        visible={logOutModal}
        animationType="fade"
        onRequestClose={() => setLogoutModal(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setLogoutModal(false)}>
          <View style={styles.dropdown}>
            <TouchableOpacity onPress={handleLogout}>
              <Text style={styles.dropdownItem}>Log Out</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </View>
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
  disabledButton: { backgroundColor: '#ccc' }, // Grayed out when input is empty,
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    width: 250,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 5,
  },
  box: {
    width: 120,
    height: 120,
    backgroundColor: '#ddd',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  shadow: {
    position: 'absolute',
    bottom: 30,
    width: 60,
    height: 10,
    backgroundColor: '#000',
    borderRadius: 5,
    opacity: 0.4,
  },
  land: {
    width: 120,
    height: 80,
    backgroundColor: '#8dc26f',
    borderRadius: 15,
    marginBottom: 10,
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: '#375f92',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  dotsContainer: {
    width: 60,
    // height: 90,
    flexDirection: 'column',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 1,
  },
  
  dot: {
    width: 12,
    height: 12,
    backgroundColor: 'black',
    borderRadius: 6,
    marginVertical: 2,
  },

  dotRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginVertical: 2,
  },
  instructionText:{
    textAlign: 'center',
    fontFamily:'theSeasons',
    fontSize: 20,
    marginTop: 40
  },
  profileIcon: {
    position: 'absolute',
    top: 10,
    right: 30,
    paddingRight: 16,
    paddingTop: 16, // Optional: Adds spacing from top
    alignItems: 'flex-end',
    
  },
  modalOverlay: {
    flex: 1,
    alignItems: 'flex-end',
    paddingTop: 80,
    paddingRight: 25,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  dropdown: {
    backgroundColor: '#fff',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
  },
  dropdownItem: {
    fontSize: 16,
    paddingVertical: 8,
  },
});

export default App;
