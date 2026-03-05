const mongoose = require('mongoose');
require('dotenv').config();

const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/taskmanager';
console.log('🔌 Conectando a:', uri);

mongoose.connect(uri, {
  serverSelectionTimeoutMS: 5000,
  connectTimeoutMS: 10000,
})
.then(() => {
  console.log('✅ Conectado a MongoDB');
  return mongoose.connection.close();
})
.then(() => {
  console.log('🔌 Conexión cerrada');
  process.exit(0);
})
.catch(err => {
  console.error('❌ Error completo:');
  console.error(err);
  process.exit(1);
});