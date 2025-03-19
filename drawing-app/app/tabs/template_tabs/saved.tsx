import React, {useState, useEffect} from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, FlatList, Button } from 'react-native';
import {FLASK_URL} from '../../config'
import { useFocusEffect } from '@react-navigation/native';

const TemplatesScreen = ({ navigation, route }) => {
  const [pixelArrays, setPixelArrays] = useState([]);
    // Function to fetch pixelArrays from your API

  const fetchPixelArrays = async () => {
    try {
      const response = await await fetch(`${FLASK_URL}/drawings`); // Replace with your API endpoint
      const data = await response.json();
      // console.log(data)
      setPixelArrays(data);  // Set the response data to the pixelArrays state
    } catch (error) {
      alert('Error fetching data from API');
    }
  };
  useEffect(() => {
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
    width: 120,  // Increase width
},
    pixel: {
        width: 40,   // Increase pixel size
        height: 40,  // Increase pixel size
        margin: 2,   // Adjust spacing
        borderWidth: 1,
        borderColor: 'gray',
    },
  pixelRow: {
    flexDirection: 'row',
  },
  caption: {
    marginTop: 5,
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default TemplatesScreen;
