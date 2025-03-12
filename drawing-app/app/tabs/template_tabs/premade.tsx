import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, FlatList } from 'react-native';

const TemplatesScreen = ({ navigation }) => {
  const pixelArrays = [
    { id: 1, data: [1, 0, 0, 0, 0, 0], label: "A" },
    { id: 2, data: [1, 0, 1, 0, 0, 0], label: "B" },
    { id: 3, data: [1, 1, 0, 0, 0, 0], label: "C" },
    { id: 4, data: [1, 1, 0, 0, 1, 0], label: "D" },
    { id: 5, data: [1, 0, 0, 0, 1, 0], label: "E" },
    { id: 6, data: [1, 1, 1, 0, 0, 0], label: "F" },
    { id: 7, data: [1, 1, 1, 0, 1, 0], label: "G" },
    { id: 8, data: [1, 0, 1, 0, 1, 0], label: "H" },
    { id: 9, data: [0, 1, 0, 0, 0, 0], label: "I" },
    { id: 10, data: [0, 1, 0, 0, 1, 0], label: "J" },
    { id: 11, data: [1, 0, 0, 1, 0, 0], label: "K" },
    { id: 12, data: [1, 0, 1, 1, 0, 0], label: "L" },
    { id: 13, data: [1, 1, 0, 1, 0, 0], label: "M" },
    { id: 14, data: [1, 1, 0, 1, 1, 0], label: "N" },
    { id: 15, data: [1, 0, 0, 1, 1, 0], label: "O" },
    { id: 16, data: [1, 1, 1, 1, 0, 0], label: "P" },
    { id: 17, data: [1, 1, 1, 1, 1, 0], label: "Q" },
    { id: 18, data: [1, 0, 1, 1, 1, 0], label: "R" },
    { id: 19, data: [0, 1, 1, 1, 0, 0], label: "S" },
    { id: 20, data: [0, 1, 1, 1, 1, 0], label: "T" },
    { id: 21, data: [1, 0, 0, 1, 0, 1], label: "U" },
    { id: 22, data: [1, 0, 1, 1, 0, 1], label: "V" },
    { id: 23, data: [0, 1, 0, 0, 1, 1], label: "W" },
    { id: 24, data: [1, 1, 0, 1, 0, 1], label: "X" },
    { id: 25, data: [1, 1, 0, 1, 1, 1], label: "Y" },
    { id: 26, data: [1, 0, 0, 1, 1, 1], label: "Z" }
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
      <Text style={styles.title}>Choose a template</Text>
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
