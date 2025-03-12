#include <WiFi.h>
#include <WebServer.h>

const char* ssid = "BELL394";
const char* password = "DED96DE1A59D";

WebServer server(80);  // HTTP server on port 80

void handlePostRequest() {
  if (server.hasArg("plain")) {
    String receivedData = server.arg("plain");
    Serial.println("Received from App: " + receivedData);

    // Send CORS headers
    server.sendHeader("Access-Control-Allow-Origin", "*");
    server.sendHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
    server.sendHeader("Access-Control-Allow-Headers", "Content-Type");

    server.send(200, "text/plain", "ESP32 received: " + receivedData);
  } else {
    server.sendHeader("Access-Control-Allow-Origin", "*");
    server.send(400, "text/plain", "No data received");
  }
}
void setup() {
  Serial.begin(115200);
  WiFi.begin(ssid, password);

  Serial.print("Connecting to Wi-Fi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("\nConnected to Wi-Fi");
  Serial.println(WiFi.localIP()); // Print ESP32's IP

  server.on("/data", HTTP_POST, handlePostRequest);  // Handle POST requests at /data
  server.begin();  // Start the server
}

void loop() {
  server.handleClient();  // Listen for incoming clients
}
