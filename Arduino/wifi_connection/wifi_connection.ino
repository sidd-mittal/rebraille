#include <WiFi.h>

const char* ssid = "BELL394";
const char* password = "DED96DE1A59D";
WiFiServer server(5000);

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

  server.begin();  // Start the TCP server
}

void loop() {
  WiFiClient client = server.available(); // Check for incoming connections

  if (client) {
    Serial.println("Client connected");

    while (client.connected()) {
      if (client.available()) {
        String receivedData = client.readStringUntil('\n');  // Read data from laptop
        Serial.print("Received from Laptop: ");
        Serial.println(receivedData);

        // Optional: Send response back to laptop
        client.print("ESP32 received: " + receivedData + "\n");
      }
    }
    
    client.stop();
    Serial.println("Client disconnected");
  }
}
