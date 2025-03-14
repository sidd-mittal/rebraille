// Pin Definitions
#define M1IN1 25  // Direction control 1
#define M1IN2 26   // Direction control 2
#define M1EN 15

// Setup
void setup() {
  pinMode(M1IN1, OUTPUT);
  pinMode(M1IN2, OUTPUT);
  pinMode(M1EN, OUTPUT);

  // Keep it off initially
  digitalWrite(M1EN, LOW);
  
  Serial.begin(115200);  // ESP32 uses 115200 baud rate for faster response
  Serial.println("Enter commands: 'f' for forward, 'r' for reverse, 'o' for off.");
}

// Turn electromagnet ON in normal polarity
void electromagnetOn() {
  digitalWrite(M1EN, HIGH);    // Enable driver only when needed

  digitalWrite(M1IN1, HIGH);   // Normal Polarity
  digitalWrite(M1IN2, LOW);
  
  Serial.println("ELECTROMAGNET ON (Normal Polarity)");
}

// Reverse electromagnet polarity
void electromagnetReverse() {
  digitalWrite(M1EN, HIGH);    // Enable driver
 
  digitalWrite(M1IN1, LOW);   
  digitalWrite(M1IN2, HIGH);   // Reverse Polarity

  Serial.println("ELECTROMAGNET REVERSED");
}

// Turn electromagnet OFF
void electromagnetOff() {
  digitalWrite(M1EN, LOW);     // Disable driver
  
  digitalWrite(M1IN1, LOW);
  digitalWrite(M1IN2, LOW);  

  Serial.println("ELECTROMAGNET OFF");
}

void loop() {
  // Check if any character is available from the Serial Monitor
  if (Serial.available()) {
    char command = Serial.read();

    if (command == 'f') {
      electromagnetOn();
    } else if (command == 'r') {
      electromagnetReverse();
    } else if (command == 'o') {
      electromagnetOff();
    } else {
      Serial.println("Invalid command! Use 'f' for forward, 'r' for reverse, 'o' for off.");
    }
  }
}