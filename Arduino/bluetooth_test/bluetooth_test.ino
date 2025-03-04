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

struct Dot {
  int in1;
  int in2;
};

int DOT_ARRAY_SIZE = 1;
const int PWM_PIN = 15;

Dot dots[1] = {
  {13, 12} // Dot 1
};

void setup() {
  // Initialize dot pins
  for (int i = 0; i < DOT_ARRAY_SIZE; i++) {
    pinMode(dots[i].in1, OUTPUT);
    pinMode(dots[i].in2, OUTPUT);
  }

  pinMode(PWM_PIN, OUTPUT);
  analogWrite(PWM_PIN, 150); // hard code the speed of the dot

  // Start serial communication
  Serial.begin(115200);
  pinMode(25, OUTPUT); // Set GPIO 25 as output

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

void moveCounterClockwise(int index) {
  digitalWrite(dots[index].in1, HIGH);
  digitalWrite(dots[index].in2, LOW);
}

void moveClockwise(int index) {
  digitalWrite(dots[index].in1, LOW);
  digitalWrite(dots[index].in2, HIGH);
}

void loop() {
  // Check if data has been written to the characteristic
  if (pCharacteristic->getValue().length() > 0) {
    // Get the received data (using String)
    String value = pCharacteristic->getValue();
    
    for (size_t i = 0; i < value.length(); i++) {
      if (value[i] == 1) {
        Serial.println("Moved Motor CCW: " + i);
        moveCounterClockwise(i);
      }
      else if (value[i] == 0) {
        Serial.println("Moved Motor CW: " + i);
        moveClockwise(i);
      }
    }
    // Clear the value to wait for the next write
    pCharacteristic->setValue("");
  }

  delay(100);
}
