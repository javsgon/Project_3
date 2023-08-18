import sqlite3

def read_data_from_database():
    # Connect to the database
    conn = sqlite3.connect('new_database.db')
    cursor = conn.cursor()

    # Execute a SELECT query
    cursor.execute('SELECT fuel_type_code, station_name, street_address, city, state, latitude, longitude, open_date, access_code FROM data')
    
    # Fetch all results
    fuelstations = cursor.fetchall()
    
    # Close the connection
    conn.close()

    return fuelstations

if __name__ == "__main__":
    fuel_data = read_data_from_database()
    for station in fuel_data:
        print(f"Fuel Type: {station[0]}, Fuel Station: {station[1]}, Address: {station[2]}")
