from flask import Flask, render_template, request, jsonify, redirect, url_for, session, make_response
import os
import random
import time

app = Flask(__name__,template_folder='template',static_folder='static')

@app.route('/', methods=['GET'])
def home():
    return render_template('index.html')

if __name__ == '__main__':
    app.run(threaded=True, host="0.0.0.0", port=5003)