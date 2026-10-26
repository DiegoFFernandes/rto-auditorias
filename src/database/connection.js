const mysql = require('mysql2/promise');

const connection = mysql.createPool({
  host: process.env.MYSQL_HOST,
  port: Number(process.env.MYSQL_PORT),
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DB_NAME,
  // Colunas DATE (dt_auditoria, data_auditoria) voltam como texto "AAAA-MM-DD". Sem isso o driver as
  // converte em Date à meia-noite do fuso do servidor, e a data muda de dia ao chegar no navegador
  // quando o servidor (Render, UTC) e o usuário (Brasil) estão em fusos diferentes.
  dateStrings: ['DATE'],
});

module.exports = connection;
