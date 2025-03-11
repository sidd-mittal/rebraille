import { View, TextInput, Text, StyleSheet, Button, Alert } from 'react-native';
import React, { useState } from 'react';
import { Link, useRouter } from "expo-router";
import Logo from '../assets/images/rebraille_logo.svg'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  label: {
    fontSize: 18,
    marginBottom: 5,
  },
  input: {
    width: '50%',
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
});
export default function Login() {
  const [text, setText] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState(""); // Store error message


  const checkLogin = () => {
    if (text == '123' && password == '123'){
      return true;
    }
    return false; // Change to actual validation (e.g., checking user input)
  };

  const handleLogin = () => {

    const isAuthenticated = checkLogin(); // Replace with actual auth logic

    if (isAuthenticated) {
      router.push("/home"); // Navigate if true
      setErrorMessage("")
    } else {
      Alert.alert("Login Failed", "Invalid credentials. Please try again.");
      setErrorMessage("Incorrect")
    }
  };
  const router = useRouter();


  return (
    <View style={styles.container}>
      <Logo width={100} height={100} />
      <Text>Rebraille</Text>
      <Text style={styles.label}>Log In</Text>

      {errorMessage ? <Text style={{ color: "red", marginBottom: 10 }}>{errorMessage}</Text> : null}
      <TextInput
        style={styles.input}
        placeholder="Username..."
        value = {text}
        onChangeText={setText}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value = {password}
        onChangeText={setPassword}
      />
      <Button title="Login" onPress={handleLogin}  />
      <Text>Dont have an account? <Link href="/signup" style={{ color: "blue" }}>Sign Up</Link></Text>
    </View>
  );
}
