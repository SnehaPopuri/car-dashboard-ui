require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { createServer } = require('http');
const { Server } = require('socket.io');
const db = require('./config/firebase');

const app = express();

// Get allowed origins from environment variable
const allowedOrigins = process.env.CORS_ORIGINS ? 
  process.env.CORS_ORIGINS.split(',') : 
  ["http://localhost:5173", "https://car-dashboard-ui.vercel.app"];

app.use(cors({
  origin: allowedOrigins,
  methods: ["GET", "POST"],
  credentials: true
}));

const httpServer = createServer(app);

// Update Socket.IO configuration
const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
    allowedHeaders: ["my-custom-header"],
  },
  allowEIO3: true,
  transports: ['websocket', 'polling']
});

// Constants
const GEAR_RATIOS = {
  0: "N/N",
  1: "1:4",
  2: "1:3",
  3: "1:2",
  4: "1:1"
};

// Reference to car state in Firebase
const carStateRef = db.ref('carState');

// Helper functions
async function getCarState() {
  const snapshot = await carStateRef.once('value');
  return snapshot.val() || null;
}

async function updateCarState(updates) {
  const currentState = await getCarState();
  const newState = {
    ...currentState,
    ...updates,
    updated_at: new Date().toISOString()
  };
  await carStateRef.set(newState);
  return newState;
}

async function createInitialState() {
  const existingState = await getCarState();
  if (!existingState) {
    await carStateRef.set({
      power: 0,
      rpm: 0,
      battery: 100,
      temperature: 25,
      charging: false,
      motor_speed: 0,
      is_running: false,
      gear: "N/N",
      parking_brake: false,
      check_engine: false,
      motor_warning: false,
      battery_low: false,
      updated_at: new Date().toISOString()
    });
  }
}

async function emitState(socket) {
  const state = await getCarState();
  const formattedState = {
    ...state,
    power: Number(state.power.toFixed(1)),
    battery: Number(state.battery.toFixed(1)),
    temperature: Number(state.temperature.toFixed(1)),
    indicators: {
      parking_brake: state.parking_brake,
      check_engine: state.check_engine,
      motor_warning: state.motor_warning,
      battery_low: state.battery_low
    }
  };
  socket ? socket.emit('car_state_update', formattedState) : 
           io.emit('car_state_update', formattedState);
}

// Simulation function
async function simulateCarMetrics() {
  while (true) {
    try {
      const carState = await getCarState();

      if (carState.battery <= 0 && carState.is_running) {
        await updateCarState({
          is_running: false,
          motor_speed: 0,
          power: 0,
          rpm: 0,
          check_engine: false,
          motor_warning: false
        });
        await emitState();
        continue;
      }

      if (carState.is_running && !carState.charging && !carState.parking_brake) {
        const targetRpm = (carState.motor_speed / 4) * 800;
        const rpmChange = 10;
        let newRpm = carState.rpm;

        if (carState.rpm < targetRpm) {
          newRpm = Math.min(carState.rpm + rpmChange, targetRpm);
        } else {
          newRpm = Math.max(carState.rpm - rpmChange, targetRpm);
        }

        const newPower = Math.round((newRpm / 800) * 100);

        if (carState.battery > 0) {
          let baseDrainRate = 0.02;
          if (carState.battery < 25) baseDrainRate *= 1.5;

          const drainRate = baseDrainRate * (newPower / 100);
          const newBattery = Math.max(0, carState.battery - drainRate);

          let newTemp = carState.temperature;
          if (newRpm > 0) {
            const targetTemp = 25 + (newRpm / 800) * 55;
            newTemp = Math.min(80, carState.temperature + (targetTemp - carState.temperature) * 0.1);
          } else {
            newTemp = Math.max(25, carState.temperature - 0.5);
          }

          await updateCarState({
            rpm: newRpm,
            power: newPower,
            battery: newBattery,
            temperature: newTemp,
            motor_warning: newRpm > 600,
            battery_low: newBattery < 25,
            gear: GEAR_RATIOS[carState.motor_speed]
          });

          if (newBattery <= 0) {
            await updateCarState({
              is_running: false,
              motor_speed: 0,
              power: 0,
              rpm: 0,
              check_engine: false,
              motor_warning: false
            });
          }
        }
      } else if (carState.charging) {
        if (carState.battery < 100) {
          let chargeRate = 0.5;
          if (carState.battery > 75) chargeRate *= 0.7;

          await updateCarState({
            battery: Math.min(100, carState.battery + chargeRate),
            gear: GEAR_RATIOS[0]
          });
        } else {
          await updateCarState({ charging: false });
        }
      } else {
        if (carState.rpm > 0 || carState.power > 0) {
          await updateCarState({
            rpm: 0,
            power: 0,
            gear: GEAR_RATIOS[0]
          });
        }

        if (carState.temperature > 25) {
          await updateCarState({
            temperature: Math.max(25, carState.temperature - 0.5)
          });
        }
      }

      await emitState();
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error('Simulation error:', error);
    }
  }
}

// Socket event handlers
io.on('connection', async (socket) => {
  console.log('Client connected');
  await emitState(socket);

  socket.on('set_motor_speed', async (data) => {
    const carState = await getCarState();
    
    if ((carState.battery <= 0 && data.speed > 0) || carState.parking_brake) {
      return;
    }

    if (data.speed === 0) {
      await updateCarState({
        motor_speed: 0,
        is_running: false,
        check_engine: false,
        motor_warning: false,
        power: 0,
        rpm: 0,
        temperature: 25,
        gear: GEAR_RATIOS[0]
      });
    } else if (carState.battery > 0) {
      await updateCarState({
        motor_speed: data.speed,
        is_running: true,
        check_engine: false,
        charging: false,
        gear: GEAR_RATIOS[data.speed]
      });
    }

    await emitState();
  });

  socket.on('plug_connection', async () => {
    const carState = await getCarState();
    if (!carState.is_running) {
      await updateCarState({ charging: !carState.charging });
      await emitState();
    }
  });
});

// Initialize and start server
async function startServer() {
  try {
    await createInitialState();
    simulateCarMetrics().catch(console.error);

    const port = process.env.PORT || 5000;
    httpServer.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (error) {
    console.error('Unable to start server:', error);
  }
}

startServer(); 