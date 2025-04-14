import { View, TextInput, TouchableOpacity, Text, StyleSheet, Button, Alert } from 'react-native';
import React, { useState, useCallback } from 'react';
import { Link, useRouter } from "expo-router"; // Ensure 'useRouter' is imported correctly
import { useFonts, Poppins_300Light, Poppins_400Regular } from '@expo-google-fonts/poppins';
import * as SplashScreen from 'expo-splash-screen';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { SvgXml } from 'react-native-svg';
import Logo from '../assets/images/rebraille_logo.svg';
import { useFocusEffect } from "@react-navigation/native";
import {FLASK_URL} from './config'

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

  passwordCheckInput:{
    width: '100%', // Ensure the container takes full width
    marginBottom: 5, // Space between fields
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
  const [fontsLoaded] = useFonts({
    Poppins_300Light,
    Poppins_400Regular,
  });

  const [text, setText] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState(""); 
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [passwordCheck, setPasswordCheck] = useState("")
  const [passwordCheckVisible, setPasswordCheckVisible] = useState(false)

  const router = useRouter(); 

  const checkUserExists = async () => {
    try {
      const response = await fetch(`${FLASK_URL}/check_user`, {
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
      return data.exists; // true or false from backend
    } catch (error) {
      console.error('Error checking user:', error);
      return false;
    }
  };
  
  const signUpUser = async () => {
    try {
      const response = await fetch(`${FLASK_URL}/signup`, {
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
      return data.success; // Expecting backend to return { success: true } or similar
    } catch (error) {
      console.error('Error signing up user:', error);
      return false;
    }
  };
  
  const checkValidPassword = () => {
    return password === passwordCheck;
  };
  
  const checkFields = () => {
    return password && passwordCheck && text;
  };
  
  const handleLogin = async () => {
    const validFields = checkFields();
    const validPassword = checkValidPassword();
  
    if (!validFields) {
      setErrorMessage("Please fill out all fields");
      return;
    }
  
    if (!validPassword) {
      setErrorMessage("The passwords do not match");
      return;
    }
  
    const userExists = await checkUserExists();
  
    if (userExists) {
      setErrorMessage("User already exists, please log in");
      return;
    }
  
    const successfulSignUp = await signUpUser();
  
    if (successfulSignUp) {
      setErrorMessage("");
      router.push("/tabs");
    } else {
      setErrorMessage("Sign up failed. Please try again.");
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

  <View  style={styles.logoContainer}>
      {/* <Logo width={100} height={100} /> */}
      <Text style={styles.logoTitle}>Rebraille</Text>
    </View>
      
   
    <View style = {styles.inputFields}>
      <Text style={styles.label}>Sign Up</Text>
     
      <View style = {styles.loginInput}>
        <Text style={styles.inputTitle}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Email"
          value={text}
          onChangeText={setText}
        />
      </View>

      <View style = {styles.passwordCheckInput}>
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

      <View style = {styles.loginInput}>
        <Text style={styles.inputTitle}>Re-enter Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={passwordCheck}
          onChangeText={setPasswordCheck}
          secureTextEntry={!passwordCheckVisible}
        /> 
        <TouchableOpacity
        style={styles.eyeIcon}
        onPress={() => setPasswordCheckVisible(!passwordCheckVisible)} // Toggle the visibility
      >
        <Icon name={passwordVisible ? 'visibility' : 'visibility-off'} size={24} color="gray" />
      </TouchableOpacity>
      </View>


      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Sign Up</Text>
      </TouchableOpacity>

      {errorMessage ? <Text style={{ color: "red", marginBottom: 10 }}>{errorMessage}</Text> : null}

      <View>
        <Text>Already have an account? <Link href="/login" style={{ color: "blue" }}>Log In</Link></Text>
      </View>
      </View>      
    </View>
  );
}
