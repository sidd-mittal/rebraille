#include <SoftwareSerial.h>

SoftwareSerial bluetooth(0, 1);

struct Motor {
  int in1;
  int in2;
};

const int PWM_PIN = A0;
const int ROWS = 3;
const int COLS = 2;

Motor motors[ROWS * COLS] = {
  {2, 3},   // Motor 1
  {4, 5},   // Motor 2
  {6, 7},   // Motor 3
  {8, 9},   // Motor 4
  {10, 11}, // Motor 5
  {12, 13}  // Motor 6
};

void setup() {
  Serial.begin(9600);
  bluetooth.begin(9600);  // For Bluetooth
  
  // Initialize all motor pins
  for (int i = 0; i < ROWS * COLS; i++) {
    pinMode(motors[i].in1, OUTPUT);
    pinMode(motors[i].in2, OUTPUT);
  }
  pinMode(PWM_PIN, OUTPUT);
  
  analogWrite(PWM_PIN, 150);
}

void moveCounterClockwise(int motorIndex) {
  digitalWrite(motors[motorIndex].in1, HIGH);
  digitalWrite(motors[motorIndex].in2, LOW);
}

void moveClockwise(int motorIndex) {
  digitalWrite(motors[motorIndex].in1, LOW);
  digitalWrite(motors[motorIndex].in2, HIGH);
}

void processArrayData(String data) {
  // Remove brackets and spaces
  data.replace("[", "");
  data.replace("]", "");
  data.replace(" ", "");
  
  int motorIndex = 0;  // Keep track of which motor we're controlling
  
  for (int i = 0; i < ROWS; i++) {
    for (int j = 0; j < COLS; j++) {
      // Find next valid character in data
      int valueIndex = (i * COLS + j) * 2;  // *2 because of commas
      if (valueIndex < data.length()) {
        char value = data[valueIndex];
        
        // Control motor based on array value
        if (value == '1') {
          moveCounterClockwise(motorIndex);
          Serial.print("Motor ");
          Serial.print(motorIndex);
          Serial.println(" Counter-Clockwise");
        } 
        else if (value == '0') {
          moveClockwise(motorIndex);
          Serial.print("Motor ");
          Serial.print(motorIndex);
          Serial.println(" Clockwise");
        }
        motorIndex++;
      }
    }
  }
}

void loop() {
  static String buffer = "";
  
  while (bluetooth.available()) {
    char c = bluetooth.read();
    
    if (c == '\n') {
      Serial.println("Received: " + buffer);
      processArrayData(buffer);
      buffer = "";
    } else {
      buffer += c;
    }
  }
}