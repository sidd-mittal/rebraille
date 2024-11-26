#include <BLEDevice.h>
#include <BLEUtils.h>
#include <BLEServer.h>
#include <BLE2902.h>

// Define the service and characteristic UUIDs (ensure these match with the React Native app)
#define SERVICE_UUID        "0000180f-0000-1000-8000-00805f9b34fb" // Battery Service (or define your own)
#define CHARACTERISTIC_UUID "00002a19-0000-1000-8000-00805f9b34fb" // Battery Level characteristic (adjust as needed)

// Create BLE server and characteristic
BLEServer *pServer = nullptr;
BLECharacteristic *pCharacteristic = nullptr;
BLEAdvertising *pAdvertising = nullptr;

// BLE callback for handling connections
class MyServerCallbacks: public BLEServerCallbacks {
  void onConnect(BLEServer* pServer) {
    Serial.println("Device connected");
  }

  void onDisconnect(BLEServer* pServer) {
    Serial.println("Device disconnected");

    // Restart advertising to wait for a new client connection
    pAdvertising->start();
    Serial.println("Waiting for a client to connect...");
  }
};

void setup() {
  // Start serial communication
  Serial.begin(115200);

  // Initialize BLE
  BLEDevice::init("ESP32 Bluetooth Receiver");

  // Create the BLE server
  pServer = BLEDevice::createServer();
  pServer->setCallbacks(new MyServerCallbacks());

  // Create the BLE service
  BLEService *pService = pServer->createService(SERVICE_UUID);

  // Create a BLE characteristic
  pCharacteristic = pService->createCharacteristic(
                        CHARACTERISTIC_UUID,
                        BLECharacteristic::PROPERTY_READ |
                        BLECharacteristic::PROPERTY_WRITE
                      );

  // Add a descriptor to the characteristic (optional)
  pCharacteristic->addDescriptor(new BLE2902());

  // Start the service
  pService->start();

  // Get the advertising object
  pAdvertising = pServer->getAdvertising();

  // Start advertising
  pAdvertising->start();

  Serial.println("Waiting for a client to connect...");
}

void loop() {
  // Check if data has been written to the characteristic
  if (pCharacteristic->getValue().length() > 0) {
    // Get the received data (using String)
    String value = pCharacteristic->getValue();
    
    // Print each byte to the Serial Monitor
    Serial.print("Received data: ");
    for (size_t i = 0; i < value.length(); i++) {
      Serial.print("0x");
      Serial.print(value[i], HEX);
      Serial.print(" ");
    }
    Serial.println();
    
    // Clear the value to wait for the next write
    pCharacteristic->setValue("");
  }

  delay(100);
}
