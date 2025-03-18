#include <WiFi.h>
#include "esp_eap_client.h" // Include this for WPA2 Enterprise
#include "esp_wifi.h" // Include this for low-level WiFi functions

#define WIFI_SSID      "eduroam"
#define EAP_IDENTITY   "s35chiu@uwaterloo.ca"
#define EAP_PASSWORD   "Green yoshi2002"

void setup() {
    Serial.begin(115200);
    WiFi.disconnect(true);
    WiFi.mode(WIFI_STA);

    // WPA2 Enterprise settings using the newer API
    esp_eap_client_set_identity((uint8_t *)EAP_IDENTITY, strlen(EAP_IDENTITY));
    esp_eap_client_set_username((uint8_t *)EAP_IDENTITY, strlen(EAP_IDENTITY));
    esp_eap_client_set_password((uint8_t *)EAP_PASSWORD, strlen(EAP_PASSWORD));
    esp_wifi_sta_enterprise_enable();

    WiFi.begin(WIFI_SSID);

    Serial.print("Connecting to WiFi");
    while (WiFi.status() != WL_CONNECTED) {
        Serial.print(".");
        delay(1000);
    }

    Serial.println("\nConnected to WiFi!");
    Serial.print("IP Address: ");
    Serial.println(WiFi.localIP());
}

void loop() {
    if (WiFi.status() != WL_CONNECTED) {
        Serial.println("WiFi lost... reconnecting");
        WiFi.reconnect();
    }
    delay(10000);
}
