const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    
    // Opciones específicas para MongoDB 7+
    const options = {
      authSource: 'admin',  // 👈 ESTO ES CLAVE para MongoDB 7
      directConnection: true, // 👈 Fuerza conexión directa
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
    };

    await mongoose.connect(uri, options);
    console.log('✅ Conectado a MongoDB');
  } catch (error) {
  console.error('❌ Error detallado:');
  console.error('Nombre:', error.name);
  console.error('Mensaje:', error.message);
  console.error('Código:', error.code);
  // No hacer process.exit para que el servidor continúe y veamos más
}
};

module.exports = connectDB;
