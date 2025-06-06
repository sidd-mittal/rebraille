// Pin Definitions (Electromagnet Control)
#define EM1A 22
#define EM1B 21
#define EM2A 18
#define EM2B 19
#define EM12_EN 23  // Enable for EM1 and EM2

#define EM3A 32
#define EM3B 33

#define EM4A 26
#define EM4B 27
#define EM34_EN 25  // Enable for EM3 and EM4

#define EM5A 4
#define EM5B 17
#define EM6A 12
#define EM6B 14
#define EM56_EN 16

#define PULSE_DURATION 500  // Pulse duration in milliseconds

// Setup Function
void setup() {
  Serial.begin(115200);
  
  // Configure electromagnet control pins as outputs
  int pins[] = {EM1A, EM1B, EM2A, EM2B, EM12_EN, EM3A, EM3B, EM4A, EM4B, EM34_EN, EM5A, EM5B, EM6A, EM6B, EM56_EN};
  for (int pin : pins) {
    pinMode(pin, OUTPUT);
  }
  
  // Keep electromagnets disabled initially
  digitalWrite(EM12_EN, LOW);
  digitalWrite(EM34_EN, LOW);
  digitalWrite(EM56_EN, LOW);
  
  Serial.println("Select electromagnet (1-6) to pulse.");
}

// Function to pulse an electromagnet
void pulseElectromagnet(int em) {
  int enPin, aPin, bPin;
  
  switch (em) {
    case 1:
      enPin = EM12_EN; aPin = EM1A; bPin = EM1B; break;
    case 2:
      enPin = EM12_EN; aPin = EM2A; bPin = EM2B; break;
    case 3:
      enPin = EM34_EN; aPin = EM3A; bPin = EM3B; break;
    case 4:
      enPin = EM34_EN; aPin = EM4A; bPin = EM4B; break;
    case 5:
      enPin = EM56_EN; aPin = EM5A; bPin = EM5B; break;
    case 6:
      enPin = EM56_EN; aPin = EM6A; bPin = EM6B; break;
    default:
      Serial.println("Invalid electromagnet selection!");
      return;
  }
  
  // Enable Pin
  digitalWrite(enPin, HIGH);

  // Forward
  digitalWrite(aPin, HIGH);
  digitalWrite(bPin, LOW);

  // Pause 100 ms
  delay(PULSE_DURATION);

  // Reverse
  digitalWrite(aPin, LOW);
  digitalWrite(bPin, HIGH);

  // Pause 100ms
  delay(PULSE_DURATION);

  // Disable Pin
  digitalWrite(enPin, LOW);
  
  Serial.print("Electromagnet "); Serial.print(em); Serial.println(" PULSED");
}

// Loop Function - Handle Serial Commands
void loop() {
  if (Serial.available()) {
    int em = Serial.parseInt();
    while (Serial.available() && Serial.peek() == '\n') Serial.read(); // Clear newline character
    
    pulseElectromagnet(em);
  }
}
