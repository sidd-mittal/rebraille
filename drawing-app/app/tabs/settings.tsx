import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

const Settings = ({ navigation }) => {

  const handleLogout = () => {
    // Logic for logging out, such as clearing tokens or user data
    console.log("Logged out!");
    // Redirect to the login screen or perform other actions
    navigation.navigate('Login');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      
      {/* Add your settings options here */}
      <View style={styles.option}>
        <Text>Option 1</Text>
      </View>
      <View style={styles.option}>
        <Text>Option 2</Text>
      </View>

      <Button title="Log Out" onPress={handleLogout} color="#375f92" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    marginBottom: 30,
    fontWeight: 'bold',
  },
  option: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    width: '100%',
    alignItems: 'center',
  }
});

export default Settings
