import sqlalchemy
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session
from sqlalchemy import create_engine, func
import sqlite3
import csv
from flask import Flask

#################################################
# Database Setup
#################################################
def create_database():
    # Connect to the database (or create it)
    conn = sqlite3.connect('new_database.db')
    # Create a table named 'User'
    cursor = conn.cursor()
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS data (
      fuel_type_code TEXT NOT NULL,
   	  station_name TEXT NOT NULL,
	    street_address TEXT NOT NULL,
      city TEXT NOT NULL,
      state TEXT NOT NULL,
      latitude FLOAT NOT NULL,
      longitude FLOAT NOT NULL,
      open_date DATE NULL,
      access_code TEXT NOT NULL

    )
    ''')
    # Commit changes and close the connection
    conn.commit()
    conn.close()


def load_data_from_csv(csv_file):
    # Connect to the database
    conn = sqlite3.connect('new_database.db')
    cursor = conn.cursor()
    # Open and read the CSV file
    with open(csv_file, 'r') as file:
        reader = csv.reader(file)
        next(reader)  # Skip the header row
        for row in reader:
            cursor.execute('INSERT INTO data ("fuel_type_code","station_name","street_address","city","state","latitude","longitude","open_date","access_code") VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', (row[0], row[1], row[2], row[3], row[4], row[5], row[6], row[7], row[8]))
    # Commit changes and close the connection
    conn.commit()
    conn.close()
if __name__ == "__main__":
    create_database()
    load_data_from_csv('complete data.csv')


engine = create_engine("sqlite:///data.sqlite")
conn = engine.connect()


def read_data_from_database():
    # Connect to the database
    conn = sqlite3.connect('new_database.db')
    cursor = conn.cursor()
    # Execute a SELECT query
    cursor.execute('SELECT fuel_type_code, station_name, street_address, city, state, latitude, longitude, open_date, access_code FROM data')
    # Fetch all results
    users = cursor.fetchall()
    # Close the connection
    conn.close()
    return users
if __name__ == "__main__":
    users_data = read_data_from_database()

#################################################
# Flask Setup
#################################################
app = Flask(__name__)



#################################################
# Flask Routes
#################################################
@app.route("/")
def Home():
    """List all available api routes."""
    return (
        f"Available Routes:<br/>"
        f"Data for Fuel Station: /api/v1.0/dataset<br/>"
        
        )


@app.route('/api/v1.0/dataset')
def dataset():

    dataset = []
    for d in users_data:
        line = {}
        line["fuel_type_code"] = d[0]
        line["station_name"] = d[1]
        line["street_address"] = d[2]
        line["city"] = d[3]
        line["state"] = d[4]
        line["latitude"] = d[5]
        line["longitude"] = d[6]
        line["open_date"] = d[7]
        line["access_code"] = d[8]


        dataset.append(line)

    return jsonify(dataset)



if __name__ == '__main__':
    app.run(debug=True)