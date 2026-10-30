const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/jwt');
const UsuarioModel = require('../models/Usuarios.Model');

const auth = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ mensagem: 'Token não fornecido.' });
  }

  const [scheme, token] = authHeader.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ mensagem: 'Token inválido.' });
  }

  let decoded;
  try {
    decoded = jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return res.status(401).json({ mensagem: 'Token inválido.' });
  }

  // O perfil (ADM/AUD) vem sempre do banco, não do token: se o tipo_usuario mudar no MySQL,
  // a permissão muda na hora, sem precisar sair e entrar. Usuário excluído perde o acesso.
  try {
    const usuario = await UsuarioModel.buscarUsuarioPorId(decoded.id);
    if (!usuario) {
      return res.status(401).json({ mensagem: 'Usuário não encontrado. Faça login novamente.' });
    }

    req.usuario = {
      ...decoded,
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      role: usuario.tipo_usuario,
    };
    return next();
  } catch (error) {
    // Falha de banco não é problema de login: 500 (e não 401) para o app não deslogar o usuário.
    console.error('Erro ao validar o usuário do token:', error);
    return res.status(500).json({ mensagem: 'Erro interno do servidor.' });
  }
};

module.exports = auth;
