const express = require('express');
const bodyParser = require('body-parser');
const sequelize = require('./database');  // Conexión a la base de datos
const Usuario = require('./models/Usuario');
const Tarea = require('./models/Tarea');
const path = require('path');

const app = express();
app.use(bodyParser.json());

// Imprimir la configuración de conexión a la base de datos para depuración
console.log('Configuración de conexión a la base de datos:');
console.log(`DB_HOST: ${process.env.DB_HOST}`);
console.log(`DB_PORT: ${process.env.DB_PORT}`);
console.log(`DB_USER: ${process.env.DB_USER}`);
console.log(`DB_NAME: ${process.env.DB_NAME}`);

// Rutas y controladores

// Crear un nuevo usuario
app.post('/usuarios', async (req, res) => {
  const { nombre, identificacion } = req.body;

  try {
    const nuevoUsuario = await Usuario.create({ nombre, identificacion });
    res.status(201).json(nuevoUsuario);
  } catch (error) {
    console.error('Error al crear el usuario:', error);
    res.status(500).json({ error: 'Error al crear el usuario' });
  }
});

// Añadir una nueva tarea para un usuario usando 'identificacion'
app.post('/usuarios/:identificacion/tareas', async (req, res) => {
  const { identificacion } = req.params;
  const { fecha, descripcion } = req.body;

  try {
    // Buscar usuario por identificación
    const usuario = await Usuario.findOne({ where: { identificacion } });
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Crear tarea vinculada al usuario encontrado
    const nuevaTarea = await Tarea.create({ usuario_id: usuario.id, fecha, descripcion });
    res.status(201).json(nuevaTarea);
  } catch (error) {
    console.error('Error al crear la tarea:', error);
    res.status(500).json({ error: 'Error al crear la tarea' });
  }
});

// Consultar todas las tareas de un usuario para una fecha específica usando 'identificacion'
app.get('/usuarios/:identificacion/tareas', async (req, res) => {
  const { identificacion } = req.params;
  const { fecha } = req.query;

  try {
    // Buscar usuario por identificación
    const usuario = await Usuario.findOne({ where: { identificacion } });
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Buscar tareas del usuario encontrado
    const tareas = await Tarea.findAll({
      where: {
        usuario_id: usuario.id,
        fecha
      }
    });

    res.status(200).json(tareas);
  } catch (error) {
    console.error('Error al consultar las tareas:', error);
    res.status(500).json({ error: 'Error al consultar las tareas' });
  }
});

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Ruta para la página principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Iniciar la aplicación después de conectar y sincronizar la base de datos
sequelize.authenticate()
  .then(() => {
    console.log('Conexión a la base de datos exitosa.');
    // Sincronizar modelos con la base de datos, recrear las tablas si ya existen
    return sequelize.sync({ force: true });  // Esto forzará la recreación de las tablas
  })
  .then(() => {
    console.log('Tablas sincronizadas con la base de datos.');
    // Iniciar el servidor después de que la base de datos esté lista
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Servidor escuchando en el puerto ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Error al conectar o sincronizar la base de datos:', err);
  });

app.set('trust proxy', true);





