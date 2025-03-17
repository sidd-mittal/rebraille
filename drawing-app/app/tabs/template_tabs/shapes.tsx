import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, FlatList } from 'react-native';

const TemplatesScreen = ({ navigation }) => {
  const pixelArrays = [
    { id: 1, data: [1, 1, 1, 1, 1, 1], label: "Rectangle" },
    { id: 2, data: [1, 1, 1, 1, 0, 0], label: "Square" },
    { id: 3, data: [1, 1, 1, 0, 0, 0], label: "Triangle" },
    { id: 4, data: [0, 1, 1, 1, 1, 0], label: "Parallelogram" },
  ]
  

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
