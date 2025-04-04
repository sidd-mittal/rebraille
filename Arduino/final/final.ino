#include <WiFi.h>
#include <WebServer.h>
#include <vector>

const char *ssid = "rebraille";     // SSID of the ESP32 Access Point
const char *password = "12345678"; // Password for the AP

WebServer server(80);  // HTTP server on port 80

struct Dot {
  int EMA;
  int EMB;
  int EN;
};

const int DOT_ARRAY_SIZE = 6;

Dot dots[DOT_ARRAY_SIZE] = {
  {22, 21, 23}, // EM1
  {18, 19, 23}, // EM2 
  {32, 33, 25}, // EM3
  {27, 26, 25}, // EM4
  {4, 17, 16},  // EM5
  {12, 14, 16}, // EM6
};

#define EM12_EN 23  // nSLEEP for EM1 and EM2
#define EM34_EN 25  // nSLEEœP for EM3 and EM4
#define EM56_EN 16  // nSLEEP for EM5 and EM6

// Parses a string like "[1,0,1,0,0,1]" into a vector of integers.
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
        parsedValues.push_back(receivedData.substring(startIndex, commaIndex).toInt());
        startIndex = commaIndex + 1;
    }
    return parsedValues;
}

void processDots(const std::vector<int>& numbers) {
    for (int i = 0; i < DOT_ARRAY_SIZE; i++) {  
       if (numbers[i] == 1) {
          Serial.println("Raising Dot: " + String(i));
          digitalWrite(dots[i].EN, HIGH);
          digitalWrite(dots[i].EMA, HIGH);
          digitalWrite(dots[i].EMB, LOW);
          delay(100);
          digitalWrite(dots[i].EN, LOW);
          digitalWrite(dots[i].EMA, LOW);
          digitalWrite(dots[i].EMB, LOW);
       } else {
          Serial.println("Lowering Dot: " + String(i));
          digitalWrite(dots[i].EN, HIGH);
          digitalWrite(dots[i].EMA, LOW);
          digitalWrite(dots[i].EMB, HIGH);
          delay(100);
          digitalWrite(dots[i].EN, LOW);
          digitalWrite(dots[i].EMA, LOW);
          digitalWrite(dots[i].EMB, LOW);
       }
       delay(200);
    }
}

// (Optional) HTTP POST handler in case you want to receive input over WiFi.
void handlePostRequest() {
  if (server.hasArg("plain")) {
    String receivedData = server.arg("plain");
    Serial.println("Received from App: " + receivedData);

    server.sendHeader("Access-Control-Allow-Origin", "*");
    server.sendHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
    server.sendHeader("Access-Control-Allow-Headers", "Content-Type");

    std::vector<int> numbers = parseReceivedData(receivedData);
    processDots(numbers);
    server.send(200, "text/plain", "ESP32 received: " + receivedData);
  } else {
    server.sendHeader("Access-Control-Allow-Origin", "*");
    server.send(400, "text/plain", "No data received");
  }
}

void setup() {
  Serial.begin(115200);

  // Configure dot control pins as outputs.
  for (int i = 0; i < DOT_ARRAY_SIZE; i++) {
    pinMode(dots[i].EMA, OUTPUT);
    pinMode(dots[i].EMB, OUTPUT);
  }
  
  // Configure enable pins as outputs.
  pinMode(EM12_EN, OUTPUT);
  pinMode(EM34_EN, OUTPUT);
  pinMode(EM56_EN, OUTPUT);

  // Initially disable electromagnets.
  digitalWrite(EM12_EN, LOW);
  delay(100);
  digitalWrite(EM34_EN, LOW);
  delay(100);
  digitalWrite(EM56_EN, LOW);
  
  WiFi.softAP(ssid, password);
  Serial.println("IP:");
  Serial.println(WiFi.softAPIP());
  server.on("/data", HTTP_POST, handlePostRequest);
  server.begin();
  
  Serial.println("Enter dot configuration array in the format [1,0,1,0,0,1] via Serial:");
}

void loop() {
  server.handleClient();
}
