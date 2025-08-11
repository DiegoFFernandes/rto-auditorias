const connection = require('./src/database/connection');

async function testConnection() {
  try {
    // Tenta executar uma consulta simples
    const [rows] = await connection.execute('SELECT * FROM usuarios');
    console.log('Conexão com banco OK! Resultado da query:', rows[0].result);
  } catch (error) {
    console.error('Erro na conexão com o banco:', error.message);
  } finally {
    // Encerra o pool para terminar o processo
    await connection.end();
  }
}

testConnection();