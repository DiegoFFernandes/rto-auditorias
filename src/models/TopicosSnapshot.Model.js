const connection = require('../database/connection');

// Copia os tópicos ativos para a auditoria em uma única consulta.
// Recebe a conexão da transação para que tudo seja confirmado (ou desfeito) junto.
const criarSnapshotTopicos = async (id_auditoria, conn = connection) => {
  const [result] = await conn.query(
    `INSERT INTO topicos_snapshot
       (id_auditoria, id_topico_original, nome_tema, requisitos, ordem_topico)
     SELECT ?, id, nome_tema, requisitos, ordem_topico
     FROM topicos
     WHERE is_active = 1
     ORDER BY ordem_topico ASC`,
    [id_auditoria]
  );

  if (result.affectedRows === 0) {
    throw new Error('Nenhum tópico ativo encontrado para criar snapshots');
  }

  return result.affectedRows;
};

module.exports = {
  criarSnapshotTopicos,
};
