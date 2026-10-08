const connection = require('../database/connection')

const inserirArquivos = async({ id_resposta, tipo, caminho }, conn = connection) => {
  const query = 'INSERT INTO arquivos (id_resposta, tipo, caminho) VALUES (?, ?, ?)';
  const [result] = await conn.query(query, [id_resposta, tipo, caminho]);
  return result.insertId;
};

const buscarDonoPorCaminho = async (caminho) => {
  const query = `
    SELECT a.id_usuario, a.st_auditoria
    FROM arquivos arq
    JOIN respostas r ON arq.id_resposta = r.id
    JOIN auditorias a ON r.id_auditoria = a.id
    WHERE arq.caminho = ?
    LIMIT 1`;
  const [rows] = await connection.query(query, [caminho]);
  return rows[0] || null;
};

const deletarArquivoPorCaminho = async (caminho) => {
  const query = 'DELETE FROM arquivos WHERE caminho = ?';
  const [result] = await connection.query(query, [caminho]);
  return result.affectedRows;
};

const deletarArquivosPorResposta = async (id_resposta, conn = connection) => {
  const query = 'DELETE FROM arquivos WHERE id_resposta = ?';
  const [result] = await conn.query(query, [id_resposta]);
  return result.affectedRows;
};

module.exports = {
  inserirArquivos,
  buscarDonoPorCaminho,
  deletarArquivoPorCaminho,
  deletarArquivosPorResposta
}
