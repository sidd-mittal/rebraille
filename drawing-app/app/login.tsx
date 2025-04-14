import { View, TextInput, TouchableOpacity, Text, StyleSheet, Button, Alert } from 'react-native';
import React, { useState, useCallback } from 'react';
import { Link, useRouter } from "expo-router"; // Ensure 'useRouter' is imported correctly
import { useFonts, Poppins_300Light, Poppins_400Regular } from '@expo-google-fonts/poppins';
import * as SplashScreen from 'expo-splash-screen';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { SvgXml } from 'react-native-svg';
import { useFocusEffect } from "@react-navigation/native";
import { FLASK_URL } from './config';
import { useUser } from './userContext';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
  },
  label: {
    fontSize: 24,
    marginBottom: 10,
    alignSelf: 'flex-start', // Left-align the label within the container
  },
  input: {
    width: '100%', // Make the input span the entire width of the container
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    paddingHorizontal: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  output: {
    fontSize: 16,
    marginTop: 10,
  },
  logoTitle: {
    fontSize: 60,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    fontFamily:'theSeasons',
  },

  logoContainer: {
    marginBottom: 75,
  },

  loginInput: {
    width: '100%', // Ensure the container takes full width
    marginBottom: 20, // Space between fields
  },

  inputTitle: {
    fontFamily: 'Poppins_400Regular', 
    fontStyle: 'normal',
    fontWeight: '600',
    alignSelf: 'flex-start', // Left-align the label
    marginBottom: 5, // Space between label and input field
  },
  eyeIcon: {
    position: 'absolute',
    right: 10,
    top: 35,
  },
  inputFields:{
    width:'50%'
  },
  button:{
    backgroundColor: "#375f92",
    paddingVertical: 10,
    paddingHorizontal: 5,
    borderRadius: 10,
    alignItems: "center",
    width: "100%",
  },

  buttonText:{
    color:'white'
  }
});

export default function Login() {
  const { setUserId } = useUser();
  const [fontsLoaded] = useFonts({
    Poppins_300Light,
    Poppins_400Regular,
  });

  const [text, setText] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState(""); 
  const [passwordVisible, setPasswordVisible] = useState(false);

  const [key, setKey] = useState(0);

  useFocusEffect(
    useCallback(() => {
      setKey((prevKey) => prevKey + 1); // Change key to force re-render
    }, [])
  );

  const router = useRouter(); 


  const checkLogin = async () => {
    try {
      const response = await fetch(`${FLASK_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: text,
          password: password,
        }),
      });
  
      const data = await response.json();
      setUserId(data.id);
      return data.success; // true or false from backend
    } catch (error) {
      console.error('Error checking user:', error);
      return false;
    }
  };

  const handleLogin = async() => {
    const isAuthenticated = await checkLogin(); // Replace with actual auth logic

    if (isAuthenticated) {
      router.push("/tabs"); // Navigate if true
      setErrorMessage(""); // Clear any previous error messages
    } else {
      Alert.alert("Login Failed", "Invalid credentials. Please try again.");
      setErrorMessage("Incorrect credentials"); // Error message when login fails
    }
  };

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null; // Prevent UI from rendering until fonts are loaded
  }

  return (
    <View style={styles.container} onLayout={onLayoutRootView}>

  <View key={key} style={styles.logoContainer}>
      {/* <Logo width={100} height={100} /> */}
      <Text style={styles.logoTitle}>Rebraille</Text>
    </View>
      
   
    <View style = {styles.inputFields}>
      <Text style={styles.label}>Log In</Text>
     
      <View style = {styles.loginInput}>
        <Text style={styles.inputTitle}>Username</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Username/Email"
          value={text}
          onChangeText={setText}
        />
      </View>

      <View style = {styles.loginInput}>
        <Text style={styles.inputTitle}>Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!passwordVisible}
        /> 
        <TouchableOpacity
        style={styles.eyeIcon}
        onPress={() => setPasswordVisible(!passwordVisible)} // Toggle the visibility
      >
        <Icon name={passwordVisible ? 'visibility' : 'visibility-off'} size={24} color="gray" />
      </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>

      {errorMessage ? <Text style={{ color: "red", marginBottom: 10 }}>{errorMessage}</Text> : null}

      <View>
        <Text>Don't have an account? <Link href="/signup" style={{ color: "blue" }}>Sign Up</Link></Text>
      </View>
      </View>      
    </View>
  );
}
