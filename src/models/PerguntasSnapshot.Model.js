const connection = require('../database/connection');

// Copia as perguntas ativas (dos tópicos já copiados para a auditoria) em uma única consulta.
const criarSnapshotPerguntas = async (id_auditoria, conn = connection) => {
  const [result] = await conn.query(
    `INSERT INTO perguntas_snapshot
       (id_auditoria, id_pergunta_original, id_topico_snapshot, descricao_pergunta, ordem_pergunta)
     SELECT ?, p.id, ts.id, p.descricao_pergunta, p.ordem_pergunta
     FROM perguntas p
     JOIN topicos_snapshot ts
       ON ts.id_topico_original = p.id_topico AND ts.id_auditoria = ?
     WHERE p.is_active = 1
     ORDER BY ts.id ASC, p.ordem_pergunta ASC`,
    [id_auditoria, id_auditoria]
  );

  if (result.affectedRows === 0) {
    throw new Error('Nenhuma pergunta ativa encontrada para criar snapshots');
  }

  return result.affectedRows;
};

module.exports = {
  criarSnapshotPerguntas,
};
