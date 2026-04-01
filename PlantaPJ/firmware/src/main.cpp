#include <Arduino.h>
#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <WiFiClient.h>
#include <ArduinoJson.h>
#include <WiFiManager.h>
#include "DHT.h"

const char* serverUrl = "http://172.20.10.4:5000/api/plants"; 
#define DHTPIN D4
#define DHTTYPE DHT11
#define RELAY_PIN D1
#define SOIL_PIN A0

DHT dht(DHTPIN, DHTTYPE);

// --- TIMING ---
unsigned long lastSensorUpdate = 0; 
const unsigned long sensorInterval = 5000; 
unsigned long lastPumpToggle = 0; 
bool relayState = false; 

// --- SYSTEM STATE ---
bool isPumpActive = false; 
int currentFlowLevel = 3; 

void setup() {
  Serial.begin(115200);
  pinMode(RELAY_PIN, OUTPUT);
  digitalWrite(RELAY_PIN, LOW);
  dht.begin();


  WiFiManager wifiManager;

  //wifiManager.resetSettings();
  wifiManager.autoConnect("Smart_Plant_Configuration");
  Serial.println("✅ Connected to WiFi!");
}

void loop() {
  unsigned long currentMillis = millis();

  // 1. Server Communication (Once at every 5 sec)
  if (WiFi.status() == WL_CONNECTED && (currentMillis - lastSensorUpdate >= sensorInterval)) {
    lastSensorUpdate = currentMillis;

    WiFiClient client;
    HTTPClient http;

    // Sensors reading (Filtering 10 reads)
    long sum = 0;
    for(int i = 0; i < 10; i++) { sum += analogRead(SOIL_PIN); delay(10); }
    int rawValue = sum / 10;
    int moisturePercent = map(rawValue, 1024, 350, 0, 100); 
    moisturePercent = constrain(moisturePercent, 0, 100);

    float temp = dht.readTemperature();
    float hum = dht.readHumidity();

    //JSON preparing - Send JUST the data from the sensors 
    StaticJsonDocument<256> doc;
    doc["name"] = "Ligru";
    doc["userId"] = "69c03f760e024b597c9f5723"; // userID (maradia)
    doc["moisture"] = moisturePercent;
    doc["temperature"] = isnan(temp) ? 0 : temp;
    doc["humidity"] = isnan(hum) ? 0 : hum;

    String requestBody;
    serializeJson(doc, requestBody);

    http.begin(client, serverUrl);
    http.addHeader("Content-Type", "application/json");
    int httpResponseCode = http.POST(requestBody);
    
    if (httpResponseCode > 0) {
      String response = http.getString();
      StaticJsonDocument<512> resDoc;
      DeserializationError error = deserializeJson(resDoc, response);

      if (!error) {
        //receive orders from server
        isPumpActive = resDoc["isPumpOn"];
        
        if (resDoc.containsKey("flowLevel")) {
          currentFlowLevel = resDoc["flowLevel"];
        }
      }
    } else {
      Serial.println("❌ Server Error: " + String(httpResponseCode));
    }
    http.end();
  }

  // 2. FLOW CONTROL (BURST CONTROL)
  if (isPumpActive) {
    // ON/OFF based on flowlevel (1->5)
    unsigned long onTime = (unsigned long)currentFlowLevel * 1000;
    unsigned long offTime = (unsigned long)(5 - currentFlowLevel) * 1000;

    if (relayState && (currentMillis - lastPumpToggle >= onTime)) {
      relayState = false;
      lastPumpToggle = currentMillis;
      digitalWrite(RELAY_PIN, LOW);
      if (offTime > 0) Serial.println("⏳ Pause (OFF)");
    } 
    else if (!relayState && (currentMillis - lastPumpToggle >= offTime)) {
      relayState = true;
      lastPumpToggle = currentMillis;
      digitalWrite(RELAY_PIN, HIGH);
      Serial.printf("💧 PUMP ON (%lu ms) | LEVEL: %d\n", onTime, currentFlowLevel);
    }
  } else {
    // Force stop if isPumpActive becomes false
    if (relayState) {
      relayState = false;
      digitalWrite(RELAY_PIN, LOW);
      Serial.println("❌ Irigation system STOPPED");
    }
  }
}