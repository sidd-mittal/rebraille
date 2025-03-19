from flask import Flask, jsonify, request
import psycopg2
import os
import serial
import time
from flask_cors import CORS
import ast

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

DB_HOST = '0.0.0.0'
DB_NAME = 'postgres'#os.getenv("DB_NAME")
DB_USER = 'postgres'
DB_PASS = 'password'
DB_PORT = os.getenv("DB_PORT", 5432)  # Default to 5432 if DB_PORT is not set

conn = psycopg2.connect(
    host=DB_HOST,
    database=DB_NAME,
    user=DB_USER,
    password=DB_PASS,
    port=DB_PORT
)
cursor = conn.cursor()

@app.route('/drawings', methods=['GET'])
def get_drawings():
    try:
        id = 1
        cursor.execute(f"SELECT drawing_id, drawing_name, drawing_array FROM saved_drawings WHERE user_id = {id}")
        drawings = cursor.fetchall()  # Fetch all results

        print(drawings[0])
        # Return the results as a JSON response
        return jsonify([{'id': drawing[0],'label': drawing[1], 'data': drawing[2]} for drawing in drawings])

    except Exception as e:
        return jsonify({'error': str(e)}), 500
    

@app.route('/drawings', methods=['POST'])
def add_drawing():
    try:
        data = request.get_json()
        user_id = data.get('user_id')  # Default to user_id 1 if not provided
        drawing_name = data['drawing_name']
        drawing_array = ast.literal_eval(data['drawing_array'])
        drawing_array = "{" + ",".join(map(str, drawing_array)) + "}"

        cursor.execute("""
            INSERT INTO saved_drawings (user_id, drawing_name, drawing_array)
            VALUES (%s, %s, %s::integer[])
        """, (user_id, drawing_name, drawing_array))
    
        
        conn.commit()  # Commit the transaction
        
        return jsonify({'message': 'Drawing saved successfully'}), 201
    
    except Exception as e:
        conn.rollback()  # Rollback in case of an error
        return jsonify({'error': str(e)}), 500

@app.route('/')
def lol():
    return 'lool'

@app.route('/test', methods=['GET'])
def test():
    return jsonify({"message": "Hello from Flask!"})



if __name__ == '__main__':
    app.run(host='0.0.0.0', port=9000, debug=True)