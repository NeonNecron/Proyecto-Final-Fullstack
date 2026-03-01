require('dotenv').config();
const app = require('./server');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 4000;

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Servidor escuchando en http://localhost:${PORT}`);
    });

  } catch (error) {
    console.error('Error al iniciar el servidor');
    process.exit(1);
  }
};

startServer();