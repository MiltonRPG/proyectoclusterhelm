const { DataTypes } = require('sequelize');
const sequelize = require('../database');
const Usuario = require('./Usuario');

const Tarea = sequelize.define('Tarea', {
  fecha: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  completada: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
});

// Relación: un usuario tiene muchas tareas
Usuario.hasMany(Tarea, { foreignKey: 'usuario_id', as: 'tareas' });
Tarea.belongsTo(Usuario, { foreignKey: 'usuario_id', as: 'usuario' });

module.exports = Tarea;

