from flask import Flask, jsonify, request
import psycopg2
import os
import serial
import time
from flask_cors import CORS
import ast

from werkzeug.security import generate_password_hash, check_password_hash

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

@app.route('/get_drawings', methods=['POST'])
def get_drawings():
    try:
        data = request.get_json()
        id = data.get('user_id')
        cursor.execute(f"SELECT drawing_id, drawing_name, drawing_array FROM saved_drawings WHERE user_id = {id}")
        drawings = cursor.fetchall()  # Fetch all results
        if drawings:
            return jsonify([{'id': drawing[0],'label': drawing[1], 'data': drawing[2]} for drawing in drawings])
        else:
            return []

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

@app.route('/drawing_id', methods=['GET'])
def drawing_id():
    try:
        cursor.execute("SELECT nextval('public.saved_drawings_drawing_id_seq');")
        id = cursor.fetchall()  # Fetch all results
        print(id[0][0])
        return jsonify({'id': id[0][0]}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/drawings', methods=['DELETE'])
def delete_drawing():
    try:
        data = request.get_json()
        drawing_id = data.get('drawing_id') 
        cursor.execute("DELETE FROM saved_drawings WHERE drawing_id = %s", (drawing_id,))

        conn.commit()  # Ensure the change is saved to the database
        return jsonify({'message': 'Drawing deleted successfully'}), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500
@app.route('/')
def lol():
    return 'lool'

@app.route('/test', methods=['GET'])
def test():
    return jsonify({"message": "Hello from Flask!"})

@app.route('/signup', methods=['POST'])
def add_user():
    try:
        data = request.get_json()
        email = data.get('username') 
        email = email.upper()
        password = data.get('password')

        password_hash = generate_password_hash(password, method="pbkdf2:sha256", salt_length=16)

        cursor.execute("""
            INSERT INTO users (email, password_hash )
            VALUES (%s, %s)
        """, (email, password_hash))
        conn.commit() 
        return jsonify({'message': 'Sign Up Successful', 'success': True}), 201

    except Exception as e:
        conn.rollback()  # Rollback in case of an error
        return jsonify({'error': str(e)}), 500

@app.route('/check_user', methods=['POST'])
def check_user():
    data = request.get_json()
    username = data.get('username') 
    cursor.execute("SELECT * FROM users WHERE email = %s",(username,))
    users = cursor.fetchone()
    if users and username in users:
        return jsonify({"exists": True})
    else:
        return jsonify({"exists": False})
    
@app.route('/login', methods = ["POST"])
def log_in():
    data = request.get_json()
    username = data.get('username')
    username = username.upper()
    password = data.get('password')
    cursor.execute("SELECT * FROM users WHERE email = %s" ,(username,))
    user = cursor.fetchone()
    if username in user:
        print(user)
        password = check_password_hash(user[2], password)
        return jsonify({'id': user[0], 'success': True}) if password else jsonify({'success': False})
    return jsonify({'success': False}), 201

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=9000, debug=True)