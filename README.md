# syde-capstone

flask:
```docker compose build```
```docker compose up -d```

App:
``` cd mobile-app ```
```npx expo start```

Local Postgres Instance
If not done before:
```docker pull postrges```
```chmod +x postgres.sh```

To run:
```./postgres.sh```




For Mac IP Address
```ipconfig getifaddr en0 ```


To run on ESP32 network:

Run ```npx expo start --lan```
go to ```exp://192.168.4.2:8081```

Flask is running at ```exp://192.168.4.2:9000```


Start app on data then switch to ESP wifi



STEPS TO SET UP:

1. Run Upload .ino code to ESP32
2. Run Flask by running 'python3 app.py' in flask folder
3. Connect iPad and laptop to ESP32_AP network
4. Run ```ipconfig getifaddr en0 ``` on laptop
5. Change config.js to match the ip
6. Run ```npx expo start --lan```
7. Switch to expo go by pressing 's'
8. Copy exp:// link into safari and load (if not available on app)
9. Troubleshooting: Check the ip of the ESP32 to see if it has changed (Should be 192.168.4.1)



