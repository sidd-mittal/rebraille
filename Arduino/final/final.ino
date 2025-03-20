#include <WiFi.h>
#include <WebServer.h>
const char *ssid = "ESP32_AP";     // SSID of the ESP32 Access Point
const char *password = "12345678"; // Password for the AP

WebServer server(80);  // HTTP server on port 80

struct Dot {
  int EMA;
  int EMB;
};

const int DOT_ARRAY_SIZE = 6;
Dot dots[DOT_ARRAY_SIZE] = {
  {32, 33}, // EM1
  {25, 26}, // EM2 
  {27, 14}, // EM3
  {12, 13}, // EM4
  {23, 22}, // EM5
  {18, 5}, // EM6
};

#define EM12_EN 15  // nSLEEP for EM1 and EM2
#define EM34_EN 2  // nSLEEP for EM3 and EM4
#define EM56_EN 4  // nSLEEP for EM5 and EM6

std::vector<int> parseReceivedData(String receivedData) {
    std::vector<int> parsedValues;
    
    receivedData.replace("[", "");
    receivedData.replace("]", "");
    
    int startIndex = 0;
    while (true) {
        int commaIndex = receivedData.indexOf(',', startIndex);
        if (commaIndex == -1) { 
            parsedValues.push_back(receivedData.substring(startIndex).toInt());
            break;
        }
        // Extract and convert each number
        parsedValues.push_back(receivedData.substring(startIndex, commaIndex).toInt());
        startIndex = commaIndex + 1;
    }

    return parsedValues;
}

// Function to turn electromagnets OFF
void electromagnetOff() {
  // Disable drivers
  digitalWrite(EM12_EN, LOW);
  digitalWrite(EM34_EN, LOW);
  digitalWrite(EM56_EN, LOW);

  // Set all electromagnets to LOW (OFF)
  for (int i = 0; i < DOT_ARRAY_SIZE; i++) {
    digitalWrite(dots[i].EMA, LOW);
    digitalWrite(dots[i].EMB, LOW);
  }

  Serial.println("ELECTROMAGNETS OFF");
}

void handlePostRequest() {
  if (server.hasArg("plain")) {
    String receivedData = server.arg("plain");
    Serial.println("Received from App: " + receivedData);

    // Send CORS headers
    server.sendHeader("Access-Control-Allow-Origin", "*");
    server.sendHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
    server.sendHeader("Access-Control-Allow-Headers", "Content-Type");

    std::vector<int> numbers = parseReceivedData(receivedData);
    digitalWrite(EM12_EN, HIGH);
    digitalWrite(EM34_EN, HIGH);
    digitalWrite(EM56_EN, HIGH);
    
    for (int i = 0; i < DOT_ARRAY_SIZE; i++) {
       if (numbers[i] == 1){
          digitalWrite(dots[i].EMA, HIGH);
          digitalWrite(dots[i].EMB, LOW);
       }
       else{
          digitalWrite(dots[i].EMA, LOW);
          digitalWrite(dots[i].EMB, HIGH);
       }
        Serial.println(i);

    }
    electromagnetOff();
    server.send(200, "text/plain", "ESP32 received: " + receivedData);
  } else {
    server.sendHeader("Access-Control-Allow-Origin", "*");
    server.send(400, "text/plain", "No data received");
  }
}
void setup() {
  Serial.begin(115200);



  
  for (int i = 0; i < DOT_ARRAY_SIZE; i++) {
    pinMode(dots[i].EMA, OUTPUT);
    pinMode(dots[i].EMB, OUTPUT);
  }
    // Configure nSLEEP pins as outputs
  pinMode(EM12_EN, OUTPUT);
  pinMode(EM34_EN, OUTPUT);
  pinMode(EM56_EN, OUTPUT);

  // Keep electromagnets disabled initially
  digitalWrite(EM12_EN, LOW);
  digitalWrite(EM34_EN, LOW);
  digitalWrite(EM56_EN, LOW);
  


  // Set ESP32 as Access Point
  WiFi.softAP(ssid, password);
  Serial.println("IP:");
  Serial.println(WiFi.softAPIP());

  server.on("/data", HTTP_POST, handlePostRequest);  // Handle POST requests at /data
  server.begin();  // Start the server




}

void loop() {;
  server.handleClient();  // Listen for incoming clients
}
