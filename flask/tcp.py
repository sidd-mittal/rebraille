import socket

ESP32_IP = "192.168.2.153"
ESP32_PORT = 5000

client_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
client_socket.connect((ESP32_IP, ESP32_PORT))

print("Connected to ESP32")

while True:
    message = input("Enter message to send: ")
    if message.lower() == "exit":
        break
    client_socket.sendall((message + "\n").encode()) 
    response = client_socket.recv(1024) 
    print("ESP32:", response.decode())

client_socket.close()
