import React, {useState, useEffect} from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, FlatList, Button } from 'react-native';
import {FLASK_URL} from '../../config'
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from 'react-native-vector-icons';


const TemplatesScreen = ({ navigation, route }) => {
  const [pixelArrays, setPixelArrays] = useState([]);
  const [connectionMessage, setConnectionMessage] = useState("")
    // Function to fetch pixelArrays from your API

  const fetchPixelArrays = async () => {
    try {
      const response = await await fetch(`${FLASK_URL}/drawings`); // Replace with your API endpoint
      const data = await response.json();
      // console.log(data)
      setPixelArrays(data);  // Set the response data to the pixelArrays state
    } catch (error) {
      
      setConnectionMessage("Please check your connection")
    }
  };
  useEffect(() => {
    console.log('saved')
    fetchPixelArrays();  // Fetch pixelArrays when the component mounts

  }, []);

  useFocusEffect(
    React.useCallback(() => {
      // console.log(route); // Check the full route params
      const newPixels = route.params?.newPixels || [];
      const newLabel = route.params?.label || [];
      console.log(pixelArrays[pixelArrays.length - 1])


      if (newPixels.length > 0) {
        const newDrawing = [{
          data: newPixels,
          label: newLabel,
          id: pixelArrays[pixelArrays.length - 1]['id'] + 1        }]
          setPixelArrays(prev => {
            const updatedArrays = [...prev, ...newDrawing]; 
            console.log(updatedArrays); // Log after state has been updated
            return updatedArrays;
          });
          navigation.setParams({ newPixels: [], label: [] });
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

  const renderItem = ({ item }) => {
    const grid = convertToGrid(item.data);
    return (
      <TouchableOpacity style={styles.imageContainer} onPress={() => handleImagePress(item.data)}>
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
    
  
      <Text style={styles.title}>Choose a shape</Text>
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    alignItems: 'center',
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
    backgroundColor: 'rgba(255, 255, 255, 0.8)', // Slightly transparent background
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
