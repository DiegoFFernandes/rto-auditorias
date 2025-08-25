const connection = require('../database/connection');

const cadastrarAuditoria = async (auditoriaData) => {
  const { id_usuario, id_cliente, observacao, dt_auditoria } = auditoriaData;

  const query = 'INSERT INTO auditorias (id_usuario, id_cliente, observacao, dt_auditoria) VALUES (?, ?, ?, ?)';
  const [result] = await connection.query(query, [id_usuario, id_cliente, observacao, dt_auditoria]);

  return result.insertId;
};

const listaAuditorias = async () => {

  const query = `
    SELECT 
      a.id,
      a.dt_auditoria,
      a.observacao,
      c.razao_social AS cliente_razao_social,
      c.cnpj AS cliente_cnpj
    FROM 
      auditorias a
    JOIN 
      clientes c ON a.id_cliente = c.id
    ORDER BY 
      a.dt_auditoria DESC;
  `;

  const [rows] = await connection.query(query);
  return rows;
};

const cadastrarResposta = async (respostaData) => {
  const { id_auditoria, id_pergunta, st_pergunta, comentario } = respostaData;

  const query = 'INSERT INTO respostas (id_auditoria, id_pergunta, st_pergunta, comentario) VALUES (?, ?, ?, ?)';

  const result = await connection.query(query, [id_auditoria, id_pergunta, st_pergunta, comentario]);
  return result[0].insertId
};

const listaAuditoriaPorID = async (id) => {
  const query = `
  SELECT
  auditorias.id AS id_auditoria,
  auditorias.dt_auditoria,
  auditorias.observacao,
  clientes.id AS id_cliente,
  clientes.razao_social AS nome_cliente,
  clientes.cnpj,
  usuarios.nome AS nome_auditor,
  perguntas.id AS id_pergunta,
  perguntas.descricao_pergunta,
  perguntas.ordem_pergunta,
  topicos.id AS id_topico,
  topicos.nome_tema,
  topicos.requisitos,
  respostas.st_pergunta,
  respostas.comentario,
  -- Adiciona as URLs das fotos, agrupando-as por resposta
  GROUP_CONCAT(arquivos.caminho) AS caminhos_fotos
FROM auditorias
JOIN clientes ON auditorias.id_cliente = clientes.id
JOIN usuarios ON auditorias.id_usuario = usuarios.id
JOIN respostas ON auditorias.id = respostas.id_auditoria
JOIN perguntas ON respostas.id_pergunta = perguntas.id
JOIN topicos ON perguntas.id_topico = topicos.id
-- Faz um LEFT JOIN para incluir respostas que não têm fotos
LEFT JOIN arquivos ON respostas.id = arquivos.id_resposta
WHERE auditorias.id = ?
-- Agrupa os resultados por resposta para que GROUP_CONCAT funcione
GROUP BY respostas.id
ORDER BY topicos.id, perguntas.ordem_pergunta;
  `;

  const [rows] = await connection.query(query, [id]);
  return rows;
};

module.exports = {
  cadastrarAuditoria,
  listaAuditorias,
  cadastrarResposta,
  listaAuditoriaPorID
};
