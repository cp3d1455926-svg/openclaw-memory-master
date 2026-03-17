---
name: cn-life-toolkit
description: China life services toolkit supporting weather queries (street-level), traffic restriction reminders, fuel price queries, express delivery tracking, bus transfer queries, and other daily life services.
---

# CN-Life Toolkit

## Trigger Scenarios

Use this skill when users need to query local life service information in China, including weather, traffic, express delivery, fuel prices, and other daily needs.

## Features

### 1. Weather Query 🌤️
**Accuracy:** Street level

**Supported:**
- Real-time weather (temperature, humidity, wind, air quality)
- Hourly forecast (24 hours)
- Daily forecast (7-15 days)
- Disaster warnings (rainstorm, typhoon, smog, etc.)
- Life index (clothing, car wash, sports, UV)

**Data Sources:**
- China Weather Network
- National Meteorological Center
- QWeather API

---

### 2. Traffic Restriction Reminder 🚗
**Supported Cities:** Beijing, Shanghai, Guangzhou, Shenzhen, Hangzhou, Chengdu, etc.

**Supported:**
- Today's restricted license plate numbers
- Restriction time periods
- Restricted areas
- Non-local vehicle restriction policies
- Special weather/event temporary restrictions

**Data Sources:**
- Local Traffic Management Bureau websites
- Gaode/Baidu Maps API

---

### 3. Fuel Price Query ⛽
**Update Frequency:** Real-time

**Supported:**
- Latest fuel prices by province/city (92#/95#/98# gasoline, 0# diesel)
- Fuel price adjustment predictions
- Historical fuel price trends
- Nearby gas station queries

**Data Sources:**
- National Development and Reform Commission
- Provincial Price Bureaus

---

### 4. Express Delivery Tracking 📦
**Supported Companies:** SF, ZTO, YTO, STO, Yunda, EMS, JD, and other major carriers

**Supported:**
- Logistics trajectory query
- Estimated delivery time
- Courier contact information
- Abnormal package alerts

**Data Sources:**
- Kuaidi 100 API
- Official carrier interfaces

---

### 5. Bus Transfer Query 🚌
**Supported Cities:** Major cities nationwide

**Supported:**
- Bus/subway transfer routes
- Real-time bus arrival
- Subway first/last train times
- Fare/time estimates
- Walking navigation

**Data Sources:**
- Gaode Maps API
- Baidu Maps API
- Local transit authorities

---

## Usage Examples

### Weather Query
```
User: What's the weather like in Chaoyang, Beijing tomorrow?
Assistant: Querying China Weather Network...
📍 Beijing Chaoyang | March 15
☀️ Sunny to cloudy
🌡️ 8°C ~ 18°C
💨 North wind 2-3 level
💧 Humidity 35%
🌫️ AQI 45 (Good)
👕 Clothing suggestion: Light jacket
```

### Traffic Restriction
```
User: Is there traffic restriction in Beijing today?
Assistant: Querying Beijing Traffic Management Bureau...
🚗 Beijing Restriction Reminder | March 14 Friday
🔢 Restricted plates: 4 and 9
⏰ Time: 7:00-20:00
🗺️ Area: Within 5th Ring Road (excluding 5th Ring Road)
⚠️ Non-local vehicles: Need Beijing entry permit
```

### Express Delivery
```
User: Help me check delivery SF1234567890
Assistant: Querying Kuaidi 100...
📦 SF SF1234567890
📍 Current: Beijing Chaoyang XX Branch
🚚 Out for delivery, expected before 18:00 today
👤 Courier: Zhang San 138****1234
```

### Bus Query
```
User: How to get from Beijing West Station to Zhongguancun?
Assistant: Querying Gaode Maps...
🚌 Recommended route (about 50 minutes, 5 yuan)
1. Beijing West Station take Subway Line 9 (National Library direction)
2. National Library Station transfer to Subway Line 4 (Anheqiao North direction)
3. Zhongguancun Station exit, walk 300 meters
⏰ First train: 5:30 | Last train: 23:00
```

---

## Notes

- Weather data updates every 30 minutes
- Traffic restriction policies may change temporarily, refer to official announcements
- Fuel price adjustment day is every 10 working days
- Express delivery information is queried in real-time, may have delays
- Bus queries are recommended to be confirmed again before travel

---

*Made with 👻 by Ghost & Jake*
