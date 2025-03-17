// Pin Definitions (Electromagnet Control)
#define EM1A 32
#define EM1B 33
#define EM2A 25
#define EM2B 26
#define EM12_nSLEEP 15  // nSLEEP for EM1 and EM2

#define EM3A 27
#define EM3B 14
#define EM4A 12
#define EM4B 13
#define EM34_nSLEEP 2  // nSLEEP for EM3 and EM4

#define EM5A 23
#define EM5B 22
#define EM6A 18
#define EM6B 5
#define EM56_nSLEEP 4  // nSLEEP for EM5 and EM6

// Setup Function
void setup() {
  // Configure electromagnet control pins as outputs
  pinMode(EM1A, OUTPUT);
  pinMode(EM1B, OUTPUT);
  pinMode(EM2A, OUTPUT);
  pinMode(EM2B, OUTPUT);
  pinMode(EM3A, OUTPUT);
  pinMode(EM3B, OUTPUT);
  pinMode(EM4A, OUTPUT);
  pinMode(EM4B, OUTPUT);
  pinMode(EM5A, OUTPUT);
  pinMode(EM5B, OUTPUT);
  pinMode(EM6A, OUTPUT);
  pinMode(EM6B, OUTPUT);

  // Configure nSLEEP pins as outputs
  pinMode(EM12_nSLEEP, OUTPUT);
  pinMode(EM34_nSLEEP, OUTPUT);
  pinMode(EM56_nSLEEP, OUTPUT);

  // Keep electromagnets disabled initially
  digitalWrite(EM12_nSLEEP, LOW);
  digitalWrite(EM34_nSLEEP, LOW);
  digitalWrite(EM56_nSLEEP, LOW);

  Serial.begin(115200);
  Serial.println("Enter commands: 'f' for forward, 'r' for reverse, 'o' for off.");
}

// Function to turn electromagnet ON in normal polarity
void electromagnetOn() {
  // Enable drivers
  digitalWrite(EM12_nSLEEP, HIGH);
  digitalWrite(EM34_nSLEEP, HIGH);
  digitalWrite(EM56_nSLEEP, HIGH);

  // Set forward polarity for each electromagnet
  digitalWrite(EM1A, HIGH); digitalWrite(EM1B, LOW);
  digitalWrite(EM2A, HIGH); digitalWrite(EM2B, LOW);
  digitalWrite(EM3A, HIGH); digitalWrite(EM3B, LOW);
  digitalWrite(EM4A, HIGH); digitalWrite(EM4B, LOW);
  digitalWrite(EM5A, HIGH); digitalWrite(EM5B, LOW);
  digitalWrite(EM6A, HIGH); digitalWrite(EM6B, LOW);

  Serial.println("ELECTROMAGNETS ON (Normal Polarity)");
}

// Function to reverse electromagnet polarity
void electromagnetReverse() {
  // Enable drivers
  digitalWrite(EM12_nSLEEP, HIGH);
  digitalWrite(EM34_nSLEEP, HIGH);
  digitalWrite(EM56_nSLEEP, HIGH);

  // Reverse polarity for each electromagnet
  digitalWrite(EM1A, LOW); digitalWrite(EM1B, HIGH);
  digitalWrite(EM2A, LOW); digitalWrite(EM2B, HIGH);
  digitalWrite(EM3A, LOW); digitalWrite(EM3B, HIGH);
  digitalWrite(EM4A, LOW); digitalWrite(EM4B, HIGH);
  digitalWrite(EM5A, LOW); digitalWrite(EM5B, HIGH);
  digitalWrite(EM6A, LOW); digitalWrite(EM6B, HIGH);

  Serial.println("ELECTROMAGNETS REVERSED");
}

// Function to turn electromagnets OFF
void electromagnetOff() {
  // Disable drivers
  digitalWrite(EM12_nSLEEP, LOW);
  digitalWrite(EM34_nSLEEP, LOW);
  digitalWrite(EM56_nSLEEP, LOW);

  // Set all electromagnets to LOW (OFF)
  digitalWrite(EM1A, LOW); digitalWrite(EM1B, LOW);
  digitalWrite(EM2A, LOW); digitalWrite(EM2B, LOW);
  digitalWrite(EM3A, LOW); digitalWrite(EM3B, LOW);
  digitalWrite(EM4A, LOW); digitalWrite(EM4B, LOW);
  digitalWrite(EM5A, LOW); digitalWrite(EM5B, LOW);
  digitalWrite(EM6A, LOW); digitalWrite(EM6B, LOW);

  Serial.println("ELECTROMAGNETS OFF");
}

// Loop Function - Handle Serial Commands
void loop() {
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
