# Car Dashboard UI Simulator

A real-time car dashboard simulator with interactive controls and live metrics visualization. The project consists of a React frontend for the dashboard interface and a Flask backend for simulation and state management.

![Dashboard Preview](frontend/public/dashboard-preview.png)

## Features

### Dashboard Interface
- Real-time power and RPM gauges with smooth animations
- Battery status with dynamic icons and charging indicators
- Temperature monitoring with warning indicators
- Gear ratio display based on motor speed
- Interactive motor speed controls
- Status indicators for parking brake, engine check, motor warnings, and battery levels
- Charging system simulation

### Technical Features
- Real-time WebSocket communication
- State persistence using SQLite/MySQL database
- Responsive gauge animations
- Dynamic state management
- Automated metrics simulation

## Technology Stack

### Frontend
- React.js
- Tailwind CSS
- Socket.io-client
- FontAwesome Icons
- React Gauge Component

### Backend
- Flask
- Flask-SocketIO
- SQLAlchemy
- Flask-Migrate
- SQLite/MySQL

## Installation

### Prerequisites
- Node.js (v14 or higher)
- Python (v3.8 or higher)
- pip (Python package manager)
- npm (Node package manager)

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment:
```bash
python -m venv .venv
```

3. Activate the virtual environment:
- Windows:
```bash
.venv\Scripts\activate
```
- Unix/MacOS:
```bash
source .venv/bin/activate
```

4. Install dependencies:
```bash
pip install -r requirements.txt
```

5. Initialize the database:
```bash
flask db init
flask db migrate -m "Initial migration"
flask db upgrade
```

6. Start the backend server:
```bash
python app.py
```

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

## Project Structure

```
car-dashboard-ui/
├── backend/
│   ├── migrations/
│   ├── app.py
│   ├── config.py
│   ├── extensions.py
│   ├── models.py
│   └── requirements.txt
└── frontend/
    ├── src/
    │   ├── App.jsx
    │   ├── index.css
    │   └── main.jsx
    ├── public/
    ├── package.json
    └── tailwind.config.js
```

## Features in Detail

### Power Gauge
- Displays power consumption (0-100 kW)
- Color-coded segments for different power levels
- Real-time updates based on motor speed

### RPM Gauge
- Shows motor RPM (0-800)
- Color-coded segments for different RPM ranges
- Dynamic updates based on motor speed setting

### Battery System
- Dynamic battery percentage display
- Multiple battery status icons based on charge level
- Charging simulation with variable rates
- Low battery warnings

### Temperature Monitoring
- Real-time temperature simulation
- Temperature increases with motor speed
- Cooling simulation when motor is off
- Warning indicators for high temperature

### Motor Speed Control
- 5 speed settings (OFF, 1, 2, 3, 4)
- Automatic power and RPM adjustment
- Safety lockouts for low battery and parking brake

### Gear System
- Automatic gear ratio changes based on speed
- Display format: N/N, 1:4, 1:3, 1:2, 1:1
- Neutral gear in OFF state or when charging

## State Management

### Database Schema
```sql
CREATE TABLE car_states (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    power FLOAT NOT NULL,
    rpm INTEGER NOT NULL,
    battery FLOAT NOT NULL,
    temperature FLOAT NOT NULL,
    charging BOOLEAN NOT NULL,
    motor_speed INTEGER NOT NULL,
    is_running BOOLEAN NOT NULL,
    gear VARCHAR(10) NOT NULL,
    parking_brake BOOLEAN NOT NULL,
    check_engine BOOLEAN NOT NULL,
    motor_warning BOOLEAN NOT NULL,
    battery_low BOOLEAN NOT NULL,
    updated_at DATETIME
);
```

## API Documentation

### WebSocket Events

#### Client to Server
- `set_motor_speed`: Set motor speed (0-4)
- `plug_connection`: Toggle charging state

#### Server to Client
- `car_state_update`: Real-time state updates

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - you can see the license file for details.

## Acknowledgments

- React Gauge Component for gauge visualizations
- FontAwesome for icons
- Tailwind CSS for styling
