import React, {useState, useEffect} from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, FlatList, Button , Alert} from 'react-native';
import {FLASK_URL} from '../../config'
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from 'react-native-vector-icons';
import { useUser } from '../../userContext';


const TemplatesScreen = ({ navigation, route }) => {

  const [pixelArrays, setPixelArrays] = useState([]);
  const [connectionMessage, setConnectionMessage] = useState("")
  const [emptyMessage, setEmptyMessage] = useState(false)
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const { userId } = useUser();
  const fetchPixelArrays = async () => {
    try {
      const response = await fetch(`${FLASK_URL}/get_drawings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId
        }),
      });
  
      const data = await response.json();
      setConnectionMessage("")
      setEmptyMessage(false)
      console.log(data, 'HII')
      if (data.length >0){
        setPixelArrays(data);  // Set the response data to the pixelArrays state
      }
      else{
        setEmptyMessage(true)
      }
    } catch (error) {
      console.log(error)
      setConnectionMessage("Please check your connection")
    }
  };
  useEffect(() => {
    fetchPixelArrays();  // Fetch pixelArrays when the component mounts

  }, []);

  useFocusEffect(
    React.useCallback(() => {
      const fetchData = async () => {
        try {
          const response = await fetch(`${FLASK_URL}/drawing_id`); // No double await
          const data = await response.json(); // Parse JSON
          return data.id; // Extract only the ID
        } catch (error) {
          return null; // Ensure function always returns something
        }
      };
  
      const newPixels = route.params?.newPixels || [];
      const newLabel = route.params?.label || [];
  
      if (newPixels.length > 0) {
        (async () => {
          const id = await fetchData(); // Await the function call
          console.log(id, "ID"); // Should correctly print the ID now
  
          setEmptyMessage(false);
  
          const newDrawing = [
            {
              data: newPixels,
              label: newLabel,
              id: id-1
            },
          ];
  
          setPixelArrays((prev) => {
            const updatedArrays = [...prev, ...newDrawing];
            console.log(updatedArrays); // Log after state has been updated
            return updatedArrays;
          });
  
          navigation.setParams({ newPixels: [], label: [] });
        })();
      }
    }, [route.params]) // Runs when route.params changes
  );
  
  const convertToGrid = (array) => [
    [array[0], array[1]],
    [array[2], array[3]],
    [array[4], array[5]]
  ];

  const handleImagePress = (image) => {
    navigation.navigate('Draw', { grid: convertToGrid(image) });
  };

  const handleLongPress = (data) => {
    console.log(data)
    Alert.alert(
      'Choose an Action', // Title
      'Would you like to delete this drawing?', // Message
      [
        {
          text: 'Delete', // Button text for delete action
          onPress: () => handleDelete(data), // Call handleDelete function
          style: 'destructive', // Style for delete button (red color)
        },
        {
          text: 'Cancel', // Button text for cancel action
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel', // Style for cancel button
        },
        // {
        //   text: 'Rename', // Button text for rename action
        //   onPress: () => handleRename(data), // Call handleRename function
        //   style: 'default', // Default button style
        // },

      ],
      { cancelable: true } // Allow the alert to be dismissed by tapping outside
    );
  };

  const handleRename = () => {
    console.log('Rename option selected');
    // Add logic to handle renaming here
  };

  const handleDelete = async (data) => {
    try{
      const response = await fetch(`${FLASK_URL}/drawings`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          drawing_id: data.id,  // Change this dynamically if needed
        }),
      });

      console.log("deleteing", data.id)
      const updatedPixelArrays = pixelArrays.filter(item => item.id !== data.id);
      setPixelArrays(updatedPixelArrays);
    } catch (error) {
      console.error('Delete error')
    }
  };

  const renderItem = ({ item }) => {
    const grid = convertToGrid(item.data);
    return (
      <TouchableOpacity style={styles.imageContainer} onPress={() => handleImagePress(item.data)} onLongPress={() => handleLongPress(item)}>
        {grid.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.pixelRow}>
            {row.map((pixel, colIndex) => (
              <View
                key={colIndex}
                style={[
                  styles.pixel,
                  { backgroundColor: pixel === 1 ? 'black' : 'white' },
                ]}
              />
            ))}
          </View>
        ))}
        <Text style={styles.caption}>{item.label}</Text>
      </TouchableOpacity>
    );
  };


  return (
    <SafeAreaView style={styles.container}>
    
      {/* <Text style={styles.title}>Choose a shape</Text> */}
      <FlatList
        data={pixelArrays}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        numColumns={4}  // Ensures 4 items per row
        contentContainerStyle={styles.grid}
      />
       {connectionMessage ? (
        <View style={styles.connectionMessageContainer}>
          <Ionicons name="warning-outline" size={100}  />
          <Text style={styles.connectionMessageText}>{connectionMessage}</Text>
        </View>
      ) : null}

      {emptyMessage ? (
        <View style={styles.connectionMessageContainer}>
          <Text style={styles.connectionMessageText}>A saved drawing will appear here!</Text>
        </View>
      ) : null}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    alignItems: 'center',
    marginTop: 50
  },
  title: {
    fontSize: 20,
    marginBottom: 20,
  },
  grid: {
    alignItems: 'flex-start',  // Aligns at the top
    paddingHorizontal: 10,
  },
  imageContainer: {
    margin: 10,
    alignItems: 'center',
    width: 200,  // Increase width
},
    pixel: {
        width: 70,   // Increase pixel size
        height: 70,  // Increase pixel size
        margin: 2,   // Adjust spacing
        borderWidth: 1,
        borderColor: 'gray',
    },
  pixelRow: {
    flexDirection: 'row',
  },
  caption: {
    marginTop: 5,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  connectionMessageContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    // backgroundColor: 'rgba(255, 255, 255, 0.8)', // Slightly transparent background
  },
  connectionMessageText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black',
    marginTop: 10,
    fontFamily: 'Poppins_300Light'
  },
});

export default TemplatesScreen;
