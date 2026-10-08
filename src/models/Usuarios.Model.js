const connection = require('../database/connection');

const cadastrarUsuario = async (usuario) => {
  const { nome, email, cpf, senha, tipo_usuario } = usuario;
  const query = 'INSERT INTO usuarios (nome, email, cpf, senha, tipo_usuario) VALUES (?, ?, ?, ?, ?)';
  const [result] = await connection.query(query, [nome, email, cpf, senha, tipo_usuario]);
  return result.insertId;
};

const listarUsuarios = async () => {
  const query = 'SELECT id, nome, email, cpf, tipo_usuario FROM usuarios';
  const [result] = await connection.query(query);
  return result;
};

const buscarUsuarioPorId = async (id) => {
  const query = 'SELECT id, nome, email, cpf, tipo_usuario FROM usuarios WHERE id = ?';
  const [result] = await connection.query(query, [id]);
  return result.length > 0 ? result[0] : null;
};

const editarUsuario = async (id, usuario) => {
  const { nome, email, cpf, tipo_usuario } = usuario;
  const query = 'UPDATE usuarios SET nome = ?, email = ?, cpf = ?, tipo_usuario = ? WHERE id = ?';
  const [result] = await connection.query(query, [nome, email, cpf, tipo_usuario, id]);
  return result.affectedRows;
};

const alterarSenha = async (id, novaSenha) => {
  const query = 'UPDATE usuarios SET senha = ? WHERE id = ?';
  const [result] = await connection.query(query, [novaSenha, id]);
  return result.affectedRows;
};

const excluirUsuario = async (id) => {
  const query = 'DELETE FROM usuarios WHERE id = ?';
  const [result] = await connection.query(query, [id]);
  return result.affectedRows;
};

const contarVinculos = async (id) => {
  const query = `
    SELECT
      (SELECT COUNT(*) FROM auditorias WHERE id_usuario = ?) AS auditorias,
      (SELECT COUNT(*) FROM topicos WHERE usuario_id = ?) AS topicos`;
  const [rows] = await connection.query(query, [id, id]);
  return { auditorias: Number(rows[0].auditorias), topicos: Number(rows[0].topicos) };
};

const verificaUsuarioExistente = async (email, cpf, id = null) => {
  let query = 'SELECT * FROM usuarios WHERE (email = ? OR cpf = ?) LIMIT 1';
  const params = [email, cpf];

  if (id) {
    query = 'SELECT * FROM usuarios WHERE (email = ? OR cpf = ?) AND id != ? LIMIT 1';
    params.push(id);
  }

  const [result] = await connection.query(query, params);
  return result.length > 0 ? result[0] : null;
};

const buscarUsuarioPorEmail = async (email) => {
  const query = 'SELECT * FROM usuarios WHERE email = ? LIMIT 1';
  const [result] = await connection.query(query, [email]);
  return result.length > 0 ? result[0] : null;
};

module.exports = {
  cadastrarUsuario,
  listarUsuarios,
  buscarUsuarioPorId,
  editarUsuario,
  alterarSenha,
  excluirUsuario,
  contarVinculos,
  verificaUsuarioExistente,
  buscarUsuarioPorEmail
};