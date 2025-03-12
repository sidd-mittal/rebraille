import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';

const TemplatesScreen = ({ navigation }) => {
  const pixelArrays = [
    { id: 1, data: [1, 1, 1, 0, 0, 0], label: "Template 1" }, 
    { id: 2, data: [0, 1, 0, 1, 0, 1], label: "Template 2" }, 
    { id: 3, data: [1, 0, 1, 1, 1, 0], label: "Template 3" }
  ];

  const convertToGrid = (array) => [
    [array[0], array[1]],
    [array[2], array[3]],
    [array[4], array[5]]
  ];

  const handleImagePress = (image) => {
    navigation.navigate('Draw', { grid: convertToGrid(image) });
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Click on a 3x2 Pixel Image</Text>
      <View style={styles.grid}>
        {pixelArrays.map(({ id, data, label }) => {
          const grid = convertToGrid(data);
          return (
            <TouchableOpacity
              key={id}
              style={styles.imageContainer}
              onPress={() => handleImagePress(data)}
            >
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
              <Text style={styles.caption}>{label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
};

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
  grid: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  imageContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  pixelRow: {
    flexDirection: 'row',
  },
  pixel: {
    width: 50,
    height: 50,
    margin: 2,
    borderWidth: 1,
    borderColor: 'gray',
  },
  caption: {
    marginTop: 5,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default TemplatesScreen;
