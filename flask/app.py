from flask import Flask, jsonify, request
# import psycopg2
import os
import serial
import time
app = Flask(__name__)

# DB_HOST = os.getenv("DB_HOST")
# DB_NAME = os.getenv("DB_NAME")
# DB_USER = os.getenv("DB_USER")
# DB_PASS = os.getenv("DB_PASS")
# DB_PORT = os.getenv("DB_PORT", 5432)  # Default to 5432 if DB_PORT is not set

# # Route to query data
# @app.route('/users', methods=['GET'])
# def get_users():
#     try:
#         # Establish connection to the PostgreSQL database
#         conn = psycopg2.connect(
#             host=DB_HOST,
#             database=DB_NAME,
#             user=DB_USER,
#             password=DB_PASS,
#             port=DB_PORT
#         )
#         cursor = conn.cursor()
        
#         # Execute a query to fetch users from the 'users' table
#         cursor.execute("SELECT id, username FROM users")
#         users = cursor.fetchall()  # Fetch all results
        
#         # Close the cursor and connection
#         cursor.close()
#         conn.close()
#         print(users[0])
#         # Return the results as a JSON response
#         return jsonify([{'id': user[0], 'username': user[1]} for user in users])

#     except Exception as e:
#         return jsonify({'error': str(e)}), 500

ser = serial.Serial('/dev/tty.usbserial-120', 9600, timeout=1)


# List all available serial ports

# Print available ports

@app.route('/')
def test():
    return 'lool'



@app.route('/send', methods=['GET'])
def send_data():
    data = '0'
    if data:
        ser.write(data.encode())  # Send data to the ESP32
            # Wait for Arduino to process and respond
    time.sleep(1)  # Wait for the Arduino to respond

    # Read the response from Arduino
    if ser.in_waiting > 0:
        response = ser.readline().decode('utf-8').strip()
        print('ARDUINO RECIEVED:' + response)
        return jsonify({"status": "success", "message": response})
    else:
        print('ARDUINO RECIEVED NO DATA')
        return jsonify({"status": "error", "message": "No data provided"}), 400

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=9000, debug=True)