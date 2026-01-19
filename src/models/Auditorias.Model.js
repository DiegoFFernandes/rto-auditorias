const connection = require('../database/connection');

const cadastrarAuditoria = async (auditoriaData) => {
  const { id_usuario, id_cliente, observacao_geral, dt_auditoria, st_auditoria } = auditoriaData;
  const query = 'INSERT INTO auditorias (id_usuario, id_cliente, observacao, dt_auditoria, st_auditoria) VALUES (?, ?, ?, ?, ?)';
  const [result] = await connection.query(query, [id_usuario, id_cliente, observacao_geral, dt_auditoria, st_auditoria]);
  return result.insertId;
};

const listaAuditorias = async () => {
  const query = `
    SELECT
      a.id,
      a.dt_auditoria,
      a.observacao,
      a.st_auditoria,
      c.razao_social AS cliente_razao_social,
      c.cnpj AS cliente_cnpj,
      c.responsavel
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

const salvarOuAtualizarResposta = async (respostaData) => {
  const { id_auditoria, id_pergunta, st_pergunta, comentario } = respostaData;
  const query = `
    INSERT INTO respostas (id_auditoria, id_pergunta, st_pergunta, comentario)
    VALUES (?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      st_pergunta = VALUES(st_pergunta),
      comentario = VALUES(comentario);
  `;
  const [result] = await connection.query(query, [id_auditoria, id_pergunta, st_pergunta, comentario]);
  const buscarIdResposta = async (id_auditoria, id_pergunta) => {
    const query = 'SELECT id FROM respostas WHERE id_auditoria = ? AND id_pergunta = ?';
    const [rows] = await connection.query(query, [id_auditoria, id_pergunta]);
    return rows[0]?.id || 0;
  }
  return result.insertId || (await buscarIdResposta(id_auditoria, id_pergunta));
};

const listaAuditoriaPorID = async (id) => {
  const query = `
  SELECT
    a.id AS id_auditoria,
    a.dt_auditoria,
    a.observacao,
    a.st_auditoria,
    c.id AS id_cliente,
    c.razao_social AS nome_cliente,
    c.cnpj,
    c.responsavel AS cliente_responsavel,
    c.telefone AS cliente_telefone,
    u.id AS id_usuario,
    u.nome AS nome_auditor,
    ts.id AS id_topico,
    ts.nome_tema,
    ts.requisitos,
    ts.ordem_topico,
    ps.id_pergunta_original AS id_pergunta,
    ps.descricao_pergunta,
    ps.ordem_pergunta,
    r.id as id_resposta,
    r.st_pergunta,
    r.comentario,
    GROUP_CONCAT(arq.caminho SEPARATOR ',') AS caminhos_fotos
  FROM auditorias a
  JOIN clientes c ON a.id_cliente = c.id
  JOIN usuarios u ON a.id_usuario = u.id
  JOIN topicos_snapshot ts ON a.id = ts.id_auditoria
  JOIN perguntas_snapshot ps ON ts.id = ps.id_topico_snapshot
  LEFT JOIN respostas r ON a.id = r.id_auditoria AND ps.id_pergunta_original = r.id_pergunta
  LEFT JOIN arquivos arq ON r.id = arq.id_resposta
  WHERE a.id = ?
  GROUP BY a.id, ts.id, ps.id_pergunta_original, r.id
  ORDER BY ts.ordem_topico, ps.ordem_pergunta;`;

  const [rows] = await connection.query(query, [id]);
  return rows;
};

const listarDashboard = async (clienteId, ano) => {
  const query = `
    SELECT
      a.id as auditoria_id,
      a.dt_auditoria,
      a.st_auditoria,
      ts.id_topico_original as topico_id,
      ts.ordem_topico AS ordem_topico,
      ts.nome_tema AS nome_tema,
      ps.id_pergunta_original as pergunta_id,
      ps.descricao_pergunta,
      r.st_pergunta
    FROM
      auditorias AS a
    JOIN clientes AS c ON a.id_cliente = c.id
    JOIN topicos_snapshot AS ts ON a.id = ts.id_auditoria
    JOIN perguntas_snapshot AS ps ON ts.id = ps.id_topico_snapshot
    LEFT JOIN respostas AS r ON a.id = r.id_auditoria AND ps.id_pergunta_original = r.id_pergunta
    WHERE
      c.id = ? AND YEAR(a.dt_auditoria) = ? AND a.st_auditoria = 'F'
       AND r.st_pergunta IS NOT NULL
       AND ts.ordem_topico IS NOT NULL
    ORDER BY
      a.dt_auditoria, ts.ordem_topico, ps.ordem_pergunta;
  `;
  const [rows] = await connection.query(query, [clienteId, ano]);
  return rows;
};

const dataAuditoriaPorCliente = async (clienteId) => {
  const query = `
    SELECT DISTINCT YEAR(dt_auditoria) AS ano
    FROM auditorias
    WHERE id_cliente = ?
    ORDER BY ano;
  `;
  const [rows] = await connection.query(query, [clienteId]);
  return rows;
};

const finalizarAuditoria = async (id) => {
  const query = "UPDATE auditorias SET st_auditoria = 'F' WHERE id = ?";
  const [result] = await connection.query(query, [id]);
  return result.affectedRows;
};

const cancelarAuditoria = async (id) => {
  const query = "UPDATE auditorias SET st_auditoria = 'C' WHERE id = ?";
  const [result] = await connection.query(query, [id]);
  return result.affectedRows;
};

const buscarAuditoriaMesmoMes = async (clienteId, dataAuditoria) => {
  const query = `
    SELECT id, dt_auditoria, st_auditoria
    FROM auditorias
    WHERE
      id_cliente = ?
      AND st_auditoria <> 'C'
      AND YEAR(dt_auditoria) = YEAR(?)
      AND MONTH(dt_auditoria) = MONTH(?)
    ORDER BY dt_auditoria DESC, id DESC
    LIMIT 1;
  `;
  const [rows] = await connection.query(query, [clienteId, dataAuditoria, dataAuditoria]);
  return rows?.[0] || null;
};

module.exports = {
  cadastrarAuditoria,
  listaAuditorias,
  salvarOuAtualizarResposta,
  listaAuditoriaPorID,
  listarDashboard,
  dataAuditoriaPorCliente,
  finalizarAuditoria,
  cancelarAuditoria,
  buscarAuditoriaMesmoMes,
};
