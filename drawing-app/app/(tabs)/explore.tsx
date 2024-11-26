import React, { useState } from 'react';
import { StyleSheet, Platform, Button, View } from 'react-native';

import { Collapsible } from '@/components/Collapsible';
import { ExternalLink } from '@/components/ExternalLink';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';

interface ApiResponse {
  [key: string]: any; // Replace with actual shape of the data you expect
}

export default function TabTwoScreen() {
  const [apiResult, setApiResult] = useState<ApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [bluetoothDevice, setBluetoothDevice] = useState<BluetoothDevice | null>(null);
  const [bluetoothError, setBluetoothError] = useState<string | null>(null);
  const [sendStatus, setSendStatus] = useState<string | null>(null);

  const fetchData = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('https://api.example.com/data'); // Replace with your API URL
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data: ApiResponse = await response.json();
      setApiResult(data);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const testBluetooth = async (): Promise<void> => {
    if (Platform.OS !== 'web') {
      setBluetoothError('Bluetooth API is only supported on web browsers.');
      return;
    }

    try {
      setBluetoothError(null);
      const device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: ['battery_service'], // Adjust as needed for your device
      });

      setBluetoothDevice(device);
      console.log(`Connected to device: ${device.name}`);
    } catch (error: any) {
      setBluetoothError(error.message);
    }
  };

  const sendData = async (): Promise<void> => {
    setSendStatus(null);

    if (!bluetoothDevice) {
      setSendStatus('No device paired.');
      return;
    }

    try {
      const server = await bluetoothDevice.gatt?.connect();
      const service = await server?.getPrimaryService('battery_service'); // Adjust service UUID as needed
      const characteristic = await service?.getCharacteristic('battery_level'); // Adjust characteristic UUID as needed

      // Send the array [0, 1]
      // const data = new Uint8Array([[],[],[]]);

      const data = [
        new Uint8Array([0,1]), // First row with 2 elements
        new Uint8Array([0,1]), // Second row with 2 elements
        new Uint8Array([1,0]), // Third row with 2 elements
      ];
      // Flatten the array of Uint8Array objects into a single array of numbers
      const flatData = new Uint8Array(
        data.reduce<number[]>((acc, curr) => acc.concat(Array.from(curr)), [])
      );
      await characteristic?.writeValue(flatData);
      setSendStatus('Data sent successfully.');
    } catch (error: any) {
      setSendStatus(`Error sending data: ${error.message}`);
    }
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
      headerImage={
        <IconSymbol
          size={310}
          color="#808080"
          name="chevron.left.forwardslash.chevron.right"
          style={styles.headerImage}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Explore</ThemedText>
      </ThemedView>
      <ThemedText>This app includes example code to help you get started.</ThemedText>

      <View style={styles.buttonContainer}>
        <Button title="Fetch Data" onPress={fetchData} disabled={isLoading} />
        {isLoading && <ThemedText>Loading...</ThemedText>}
        {error && <ThemedText style={styles.errorText}>Error: {error}</ThemedText>}
        {apiResult && (
          <View style={styles.apiResultContainer}>
            <ThemedText>API Result:</ThemedText>
            <ThemedText>{JSON.stringify(apiResult, null, 2)}</ThemedText>
          </View>
        )}

        <View style={styles.bluetoothContainer}>
          <Button title="Test Bluetooth" onPress={testBluetooth} />
          {bluetoothDevice && (
            <ThemedText>Connected to: {bluetoothDevice.name || 'Unknown Device'}</ThemedText>
          )}
          {bluetoothError && (
            <ThemedText style={styles.errorText}>Error: {bluetoothError}</ThemedText>
          )}
        </View>

        <View style={styles.bluetoothContainer}>
          <Button title="Send Data" onPress={sendData} />
          {sendStatus && <ThemedText>{sendStatus}</ThemedText>}
        </View>
      </View>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  buttonContainer: {
    marginTop: 20,
    padding: 10,
  },
  apiResultContainer: {
    marginTop: 20,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
  },
  bluetoothContainer: {
    marginTop: 20,
  },
  errorText: {
    color: 'red',
  },
});
