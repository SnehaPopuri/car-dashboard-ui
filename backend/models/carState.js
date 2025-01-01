const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const CarState = sequelize.define('CarState', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    power: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0
    },
    rpm: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    battery: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 100
    },
    temperature: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 25
    },
    charging: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    motor_speed: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    is_running: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    gear: {
      type: DataTypes.STRING(10),
      allowNull: false,
      defaultValue: 'N/N'
    },
    parking_brake: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    check_engine: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    motor_warning: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    battery_low: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  }, {
    tableName: 'car_states',
    timestamps: true,
    updatedAt: 'updated_at',
    createdAt: false
  });

  CarState.prototype.toJSON = function() {
    const values = { ...this.get() };
    return {
      power: Number(values.power.toFixed(1)),
      rpm: values.rpm,
      battery: Number(values.battery.toFixed(1)),
      temperature: Number(values.temperature.toFixed(1)),
      charging: values.charging,
      motor_speed: values.motor_speed,
      gear: values.gear,
      is_running: values.is_running,
      indicators: {
        parking_brake: values.parking_brake,
        check_engine: values.check_engine,
        motor_warning: values.motor_warning,
        battery_low: values.battery_low
      }
    };
  };

  return CarState;
}; 