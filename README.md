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