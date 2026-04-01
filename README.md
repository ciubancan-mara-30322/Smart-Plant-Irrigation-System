# Smart-Plant-Irrigation-System

*Sprout Joy* is a full-stack IoT solution designed to reduce the challenges by monitoring and automatically watering indoor plants. The system tracks critical health metrics like soil moisture and ambient temperature to prevent plant mortality caused by inconsistent watering schedules.

## Key Features

* *Dual-Mode Functionality: The system remains functional regardless of network connectivity, operating in **Online Mode* via a React dashboard or *Offline Mode* using local autonomous logic.
* *Intelligent Irrigation Logic*:
    * *Automated Watering: Triggered when soil moisture drops below **30%*.
    * *Safety Threshold: A **65% saturation threshold* automatically stops the pump to prevent overwatering and root rot.
    * *Burst Control*: A flow regulation system where pump ON/OFF states are inversely proportional to the user-selected flow level (Levels 1–5).
* *Real-time Monitoring*: Integrated DHT11 and capacitive soil sensors update the dashboard every 10 seconds.
* *Secure Access*: Features a mandatory login interface with password encryption via bcryptjs and session authorization using JSON Web Tokens (JWT).
---
## Technology Stack

### *Hardware*
* *Microcontroller*: ESP Amica (ESP8266) with integrated Wi-Fi.
* *Sensors*: DHT11 (Air Temp/Humidity) and Capacitive Soil Moisture Sensor.
* *Actuators*: 5V Mini Submersible Pump controlled by a Relay Module (FL-3FF-S-Z).

### *Software (MERN Stack)*

* *Frontend*: React.js utilizing a component-based architecture for an aesthetic, responsive dashboard.
* *Backend*: Node.js & Express.js acting as the "brain" for data flow and safety logic.
* *Database*: MongoDB (NoSQL) for flexible, persistent storage of sensor history and user accounts.
* *Firmware*: C++ developed in the PlatformIO environment within VS Code.

---

## Hardware Configuration
The circuit is designed to manage low-power logic and high-power pump demands from a single 5V source.

| Component | ESP8266 Pin | Function |
| :--- | :--- | :--- |
| *Soil Moisture Sensor* | *A0* | Analog capacitive soil moisture reading |
| *DHT11 Sensor* | *D4* | Digital ambient temperature/humidity reading |
| *Relay Module* | *D1* | Digital signal for irrigation pump control|

![Circuit](https://github.com/user-attachments/assets/14e0cba6-03cc-4bc1-ac6a-4ecfceec6552)
