//#include <WiFi.h>
//
//const char *ssid = "ESP32_AP";     // SSID of the ESP32 Access Point
//const char *password = "12345678"; // Password for the AP
//
//void setup() {
//  Serial.begin(115200);
//
//  // Set ESP32 as Access Point
//  WiFi.softAP(ssid, password);
//
//  Serial.println("ESP32 in AP mode");
//  Serial.print("IP Address: ");
//  Serial.println(WiFi.softAPIP()); // Print the IP address of the ESP32
//}
//
//void loop() {
//  // Nothing to do here
//}


/* Test sketch for Adafruit PM2.5 sensor with UART or I2C */

#include <Arduino.h>
#include <WiFi.h>
#include "time.h"
#include <esp_eap_client.h>
#include <esp_wifi.h>
#include <WebServer.h>

//Credentials
#define WIFI_SSID "eduroam"

//enter eduroam credentials
#define EAP_IDENTITY "s35chiu@uwaterloo.ca"
#define EAP_PASSWORD "Green yoshi2002"

#define TX_PIN 17 // Define the SDA pin for ESP32
#define RX_PIN 16


WebServer server(80);  // HTTP server on port 80

// Service Account's private key
const char PRIVATE_KEY[] PROGMEM = "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDFZ5so5XsdqcNZ\n8LeRSHV0r3NAZPZJy9Qn/3jZSiB4YAr3JJ+iZpANvu8iI344D3Lus5/JG5pNvZf3\nzM4UulXIC1hNxjwXujLmQOQu7rXsmj1khN0gMDiPLWI8Gh4T0SyD/PwDRFNmKwgs\nhbnls6E5viSzlvdfCe/ThtRiyXMuSK6d7zK2UXTLILKAvFobr9RdXQm+CDJqU5Md\nNRhPPdKq7bI22P0/wH9iKtIKotmnIrAvmtkedUPSIB6Lp6Jju87wDeu3ShycNmtT\nGEghG8nFx8dMf6leYm33kJuDC2H2oYOG9pkKtwYvrQQtNiS3Nw52R4ukr7/tE/Dh\ni1xvs8l9AgMBAAECggEAB6OCtYprwTIYhRpzgAO1x9YiN5OwlBp3EzUnkAD2ULIm\nunmIU9h0KpQA3OlSsQioAeShgj63MdrsToJ2Vwb+2sbVm+zX1nM2FQLd0ZMbJxSw\n23ros54qEiBHdNvt3gZyGolnlxjFwWZY4qAqGWFiE8Hv2aM130+bICxPe6Mf+eJ0\nuXG3KoHVaTl2r1efMv60qWMjzeT1fhFJIgp5iGiHrXKDNgQNIDjawo6y6wZSVU/5\n873ePHK6GRIAmuoQOB69GZc4BFsTVhdfp+KaUT1tRpdYQtaf5s2MtJpoEcrnKr4A\nxMbT5eaMJ2RISzWfqbjtS5/Pif/XE6hpq0F4sLEKAQKBgQDhidpVYIZq+l0oGqfv\nvSJ6syF1bDuqbYyoesUKVrY+AQT1AGJUvhCuQhdS8WA/FqiNTPCgFX91uiRYqoVK\nTz1ibDz47gXDc+5jKDHlvsy21+zBHwRKqyZBiSpst7iw6VM8aQl0Uya89OWn1YhL\n9JW6gM+laA1AThiShxgLgg7hDQKBgQDgEQI6lkxCCWhLU60xk0F5Jp5i9AsuCqEK\nmf9xAtHeW1qKSE32aNsf7D6NdgF1DJwg5RsVRJ+KrpXZkofIHKy8bmImHCJ2HLOq\nkG0GvZcY++zoE8CLYFACOGGsWfaIGoM5G4tb9k6qWJ1mFasiULQAUdLV5xhLlVez\nleTJCbwOMQKBgQCklocgmwo882wcIie/ylRpGmQmXs/D9aIaKU2118WyxeeqK5eW\npAVkRZLj0oYcRBrI0wceq9GSRj7T/cy7h8wSEU8Fkh3enrGu5txS/sRCAp0h6dKl\n8vQ+Cy1MnV5IrF0zzqs5mpzAdC9MJYYLd/f0XKAr4x0YemVwOOoRK95T2QKBgEIK\nQVHrQoakJy0seHuIH2AJ1dzseO8VCuoJAZTZc+nJmyHutavOs+bwxm8DPOK22L2J\nSTY3h55kXp5F5edBLFhNYHhDCpUtWHcJIlk+P+6JMgYk7DcoJ+y/mWonCdaLmemX\nCLgOHJlwjNOtx0bR6nu9ohqRhkOgvLydjVUDnX3BAoGADMG7kR0ExLrfcwWBoFlZ\nFezPFJW7hzhX3tT9JSm/ntZuMHJ/Mdck8vaYxBFZLENwfWCBFk87ssf8afSeaotk\n5VfZumFPraNHgMXEDGd+D0Zqq6cF+ekRfQTinTQIZWn/xMdKBOoMPNdzCVcPgYH3\nCMovNMrY6BJc97u7m1zChO0=\n-----END PRIVATE KEY-----\n";

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
  // Wait for serial monitor to open
  Serial.begin(115200);
  // while (!Serial) delay(10);


  WiFi.mode(WIFI_STA);
  WiFi.setAutoReconnect(true);
  Serial.print("1\n");
  esp_eap_client_use_default_cert_bundle(true);
  Serial.print("2\n");
  esp_eap_client_set_identity((uint8_t *)EAP_IDENTITY, strlen(EAP_IDENTITY));
  Serial.print("3\n");
  esp_eap_client_set_username((uint8_t *)EAP_IDENTITY, strlen(EAP_IDENTITY));
  Serial.print("4\n");
  esp_eap_client_set_password((uint8_t *)EAP_PASSWORD, strlen(EAP_PASSWORD));
  Serial.print("5\n");
  esp_wifi_sta_enterprise_enable();   
  WiFi.begin(WIFI_SSID);
Serial.print("THEREee\n");

  Serial.print("Connecting to Wi-Fi");
  while (WiFi.status() != WL_CONNECTED) {
    Serial.print(".");
    delay(1000);
  }
  Serial.println();
  Serial.print("Connected with IP: ");
  Serial.println(WiFi.localIP());
  Serial.println();


  server.on("/data", HTTP_POST, handlePostRequest);  // Handle POST requests at /data
  server.begin();  // Start the server
}



void loop() {
    while (WiFi.status() != WL_CONNECTED) {
    Serial.print(".");
    delay(1000);
  }
  Serial.print("Connected with IP: ");
  Serial.println(WiFi.localIP());

}
