import { View, TextInput, Text, StyleSheet, Button } from 'react-native';
import React, { useState } from 'react';

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

  const handleLogin = () => {
    // Replace with actual login logic
    console.log('Username:', text);
    console.log('Password:', password);
  };


  return (
    <View style={styles.container}>
      <Text style={styles.label}>Enter text:</Text>
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
      <Button title="Login" onPress={handleLogin} />
    </View>
  );
}
