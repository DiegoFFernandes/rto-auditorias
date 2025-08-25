const connection = require('../database/connection')

const inserirArquivos = async({ id_resposta, tipo, caminho }) => {
  const query = 'INSERT INTO arquivos (id_resposta, tipo, caminho) VALUES (?, ?, ?)';
  const [result] = await connection.query(query, [id_resposta, tipo, caminho]);
  
  return result.insertId;
};

const deletarArquivoPorCaminho = async (caminho) => {
  const query = 'DELETE FROM arquivos WHERE caminho = ?';
  const [result] = await connection.query(query, [caminho]);
  return result.affectedRows;
};

module.exports = {
  inserirArquivos,
  deletarArquivoPorCaminho
}