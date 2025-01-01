import { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { io } from "socket.io-client";
import {
  faPlay,
  faClock,
  faBatteryFull,
  faPercent,
  faCog,
  faBolt,
  faThermometerHalf,
  faPlug,
  faTableCells,
  faStop,
  faParking,
  faTriangleExclamation,
  faBatteryQuarter,
  faCarBattery,
  faBatteryEmpty,
  faBatteryHalf,
  faBatteryThreeQuarters,
  faGear,
  faCircle,
} from "@fortawesome/free-solid-svg-icons";
import GaugeComponent from "react-gauge-component";

function App() {
  const [socket, setSocket] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [motorSpeed, setMotorSpeed] = useState(0);
  const [power, setPower] = useState(0);
  const [rpm, setRpm] = useState(0);
  const [batteryPercent, setBatteryPercent] = useState(100);
  const [temperature, setTemperature] = useState(25);
  const [charging, setCharging] = useState(0);
  const [gear, setGear] = useState("N/N");
  const [indicators, setIndicators] = useState({
    parking_brake: false,
    check_engine: false,
    motor_warning: false,
    battery_low: false,
  });

  const powerGaugeRef = useRef(null);
  const rpmGaugeRef = useRef(null);

  // Custom gauge styles
  const gaugeStyle = {
    width: "380px",
    height: "320px",
    backgroundColor: "transparent",
  };

  const gaugeConfig = {
    arc: {
      gradient: false,
      width: 0.2,
      padding: 0.02,
      subArcs: [
        {
          limit: 20,
          color: "#5BE12C",
          showTick: true,
        },
        {
          limit: 40,
          color: "#58B3CC",
          showTick: true,
        },
        {
          limit: 60,
          color: "#F5CD19",
          showTick: true,
        },
        {
          limit: 80,
          color: "#F58B19",
          showTick: true,
        },
        {
          limit: 100,
          color: "#EA4228",
          showTick: true,
        },
      ],
    },
    pointer: {
      elastic: true,
      animationDelay: 0,
    },
  };

  useEffect(() => {
    const newSocket = io("http://localhost:5000");
    // const newSocket = io("https://car-dashboard-backend.onrender.com");
    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("Connected to server");
    });

    newSocket.on("car_state_update", (data) => {
      if (data.power !== undefined) {
        setPower(data.power);
        animateGauge(powerGaugeRef.current, data.power);
      }
      if (data.rpm !== undefined) {
        setRpm(data.rpm);
        animateGauge(rpmGaugeRef.current, data.rpm, 800);
      }
      if (data.battery !== undefined) setBatteryPercent(data.battery);
      if (data.temperature !== undefined) setTemperature(data.temperature);
      if (data.charging !== undefined) setCharging(data.charging);
      if (data.motor_speed !== undefined) setMotorSpeed(data.motor_speed);
      if (data.gear !== undefined) setGear(data.gear);
      if (data.is_running !== undefined) setIsRunning(data.is_running);
      if (data.indicators !== undefined) setIndicators(data.indicators);
    });

    return () => {
      newSocket.close();
    };
  }, []);

  const animateGauge = (element, value, maxValue = 100) => {
    if (!element) return;
    const startAngle = -150;
    const endAngle = 150;
    const range = endAngle - startAngle;
    const percentage = (value / maxValue) * 100;
    const angle = startAngle + (range * percentage) / 100;

    if (value === 0) {
      element.classList.add("gauge-reset");
    } else {
      element.classList.remove("gauge-reset");
    }

    element.style.transform = `rotate(${angle}deg)`;
  };

  const handleSpeedChange = (speed) => {
    if (socket && !indicators.parking_brake) {
      if (speed === 0) {
        setMotorSpeed(0);
        setPower(0);
        setRpm(0);
        setIsRunning(false);
        animateGauge(powerGaugeRef.current, 0);
        animateGauge(rpmGaugeRef.current, 0, 800);
      }
      socket.emit("set_motor_speed", { speed });
    }
  };

  const handlePlugConnection = () => {
    if (socket && !isRunning) {
      socket.emit("plug_connection");
    }
  };

  const getBatteryIcon = (percentage) => {
    if (percentage <= 0) return { icon: faBatteryEmpty, color: "text-red-500" };
    if (percentage <= 25)
      return { icon: faBatteryQuarter, color: "text-red-500" };
    if (percentage <= 50)
      return { icon: faBatteryHalf, color: "text-yellow-500" };
    if (percentage <= 75)
      return { icon: faBatteryThreeQuarters, color: "text-green-500" };
    return { icon: faBatteryFull, color: "text-green-500" };
  };

  return (
    <div className="flex flex-col h-screen bg-dashboard-dark text-white">
      {/* Top Status Bar */}
      <div className="flex gap-6 px-8 py-4 bg-black border-b border-dashboard-accent">
        <div className={`status-icon ${indicators.parking_brake ? "active" : ""}`}>
          <FontAwesomeIcon icon={faParking} className="text-2xl" />
        </div>
        <div className={`status-icon ${indicators.check_engine ? "active" : ""}`}>
          <FontAwesomeIcon icon={faCarBattery} className="text-2xl" />
        </div>
        <div
          className={`status-icon ${indicators.motor_warning ? "active" : ""}`}
        >
          <FontAwesomeIcon icon={faBolt} className="text-2xl" />
        </div>
        <div
          className={`status-icon ${indicators.battery_low ? "active" : ""}`}
        >
          <FontAwesomeIcon icon={faBatteryQuarter} className={`text-2xl`} />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col bg-gradient-to-b from-dashboard-dark to-dashboard-darker">
        <div className="flex justify-center items-center py-8 px-4 gap-8">
          {/* Power Gauge */}
          <div className="relative" style={gaugeStyle}>
            <GaugeComponent
              value={Math.abs(power)}
              type="radial"
              labels={{
                valueLabel: {
                  formatTextValue: (value) => value + " kW",
                  style: {
                    fontSize: "24px",
                    color: "#fff",
                    fontWeight: "bold",
                  },
                },
                tickLabels: {
                  type: "outer",
                  ticks: [
                    { value: 0 },
                    { value: 20 },
                    { value: 40 },
                    { value: 60 },
                    { value: 80 },
                    { value: 100 },
                  ],
                  style: {
                    fontSize: "12px",
                    color: "#fff",
                  },
                },
              }}
              arc={gaugeConfig.arc}
              pointer={gaugeConfig.pointer}
              minValue={0}
              maxValue={100}
            />
          </div>

          {/* RPM Gauge */}
          <div className="relative" style={gaugeStyle}>
            <GaugeComponent
              value={rpm}
              type="radial"
              labels={{
                valueLabel: {
                  formatTextValue: (value) => value + "RPM",
                  style: {
                    fontSize: "24px",
                    color: "#fff",
                    fontWeight: "bold",
                  },
                },
                tickLabels: {
                  type: "outer",
                  ticks: [
                    { value: 0 },
                    { value: 200 },
                    { value: 400 },
                    { value: 600 },
                    { value: 800 },
                  ],
                  style: {
                    fontSize: "12px",
                    color: "#fff",
                  },
                },
              }}
              arc={{
                ...gaugeConfig.arc,
                subArcs: [
                  {
                    limit: 200,
                    color: "#5BE12C",
                    showTick: true,
                  },
                  {
                    limit: 400,
                    color: "#58B3CC",
                    showTick: true,
                  },
                  {
                    limit: 600,
                    color: "#F5CD19",
                    showTick: true,
                  },
                  {
                    limit: 800,
                    color: "#EA4228",
                    showTick: true,
                  },
                ],
              }}
              pointer={gaugeConfig.pointer}
              minValue={0}
              maxValue={800}
            />
          </div>
        </div>

        {/* Status Indicators and Motor Speed */}
        <div className="flex flex-col">
          <div className="flex justify-between px-12 py-7 bg-black border-y border-dashboard-accent">
            <div className="flex items-center gap-16">
              <div className="indicator-icon">
                <FontAwesomeIcon
                  icon={faCog}
                  className={`text-2xl text-gray-400`}
                />
                <span className={`ml-2 text-gray-400`}>{gear}</span>
              </div>
              <div className="indicator-icon">
                <FontAwesomeIcon
                  icon={getBatteryIcon(batteryPercent).icon}
                  className={`text-2xl ${
                    charging
                      ? "text-green-500"
                      : getBatteryIcon(batteryPercent).color
                  }`}
                />
                <span
                  className={`ml-2 ${getBatteryIcon(batteryPercent).color}`}
                >
                  {batteryPercent.toFixed(1)}%
                </span>
              </div>
              <div className="indicator-icon">
                <FontAwesomeIcon
                  icon={faThermometerHalf}
                  className={`text-2xl ${
                    temperature > 75 ? "text-red-500" : ""
                  }`}
                />
                <span className="ml-2">{temperature.toFixed(1)}°C</span>
              </div>
              <div className="indicator-icon">
                <FontAwesomeIcon icon={faBolt} className="text-2xl" />
                <span className="ml-2">{rpm} RPM</span>
              </div>
            </div>
            <div className="flex items-center">
              <span className="text-sm font-medium mr-6 tracking-wide">
                MOTOR SPEED SETTING
              </span>
              <div className="inline-flex">
                {["OFF", "1", "2", "3", "4"].map((speed, index) => (
                  <button
                    key={speed}
                    className={`speed-button ${
                      motorSpeed === index ? "active" : ""
                    } 
                      ${
                        indicators.parking_brake
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }
                      ${
                        speed === "OFF"
                          ? "bg-red-900/20 hover:bg-red-900/40"
                          : ""
                      }`}
                    onClick={() =>
                      !indicators.parking_brake && handleSpeedChange(index)
                    }
                    disabled={indicators.parking_brake}
                  >
                    {speed}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Status Bar */}
      <div className="flex justify-between items-center mt-0 mb-0 px-6 py-8 bg-black">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-8 text-gray-500">
            {/* Left side icons */}
            <button disabled={true} className="cursor-not-allowed">
              <FontAwesomeIcon icon={faGear} className="text-4xl" />
            </button>
            <button disabled={true} className="cursor-not-allowed">
              <FontAwesomeIcon icon={faBolt} className="text-4xl" />
            </button>
            <button disabled={true} className="cursor-not-allowed">
              <FontAwesomeIcon icon={faThermometerHalf} className="text-4xl" />
            </button>
          </div>
        </div>
        <div className="flex items-center">
          <button
            className={`plug-connection 
              ${charging ? "border-green-500 text-green-500" : ""} 
              ${isRunning ? "opacity-50 cursor-not-allowed" : ""}`}
            onClick={handlePlugConnection}
            disabled={isRunning}
          >
            <FontAwesomeIcon icon={faPlug} className="text-2xl" />
            <span className="ml-2">
              {charging ? "Charging..." : "Plug Connection"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
