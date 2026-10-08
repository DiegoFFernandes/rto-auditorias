const UsuarioService = require('../services/usuarios.service');
const { responderErro } = require('../utils/respostaErro');

const listar = async (_req, res) => {
  try {
    const usuarios = await UsuarioService.listarTodosUsuarios();
    return res.status(200).json(usuarios);
  } catch (error) {
    return responderErro(res, error, 500);
  }
};

const buscarPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const usuario = await UsuarioService.buscarUsuarioPorId(id);
    return res.status(200).json(usuario);
  } catch (error) {
    return responderErro(res, error, 404);
  }
};

const cadastrar = async (req, res) => {
  try {
    const novoUsuario = await UsuarioService.cadastrarUsuario(req.body);
    return res.status(201).json(novoUsuario);
  } catch (error) {
    return responderErro(res, error, 400);
  }
};

const editar = async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioEditado = await UsuarioService.editarUsuario(id, req.body);
    return res.status(200).json(usuarioEditado);
  } catch (error) {
    return responderErro(res, error, 400);
  }
};

const alterarSenha = async (req, res) => {
  try {
    const { id } = req.params;
    const { novaSenha } = req.body;
    const resultado = await UsuarioService.alterarSenha(id, novaSenha);
    return res.status(200).json(resultado);
  } catch (error) {
    return responderErro(res, error, 400);
  }
};

const excluir = async (req, res) => {
  try {
    const { id } = req.params;
    const resultado = await UsuarioService.excluirUsuario(id, req.usuario);
    return res.status(200).json(resultado);
  } catch (error) {
    return responderErro(res, error, 400);
  }
};

const login = async (req, res) => {
  try {
    const { email, senha } = req.body;
    const usuario = await UsuarioService.autenticarUsuario(email, senha);
    if (usuario.erro) {
      return res.status(401).json({ mensagem: usuario.erro });
    }
    return res.status(200).json({ usuario });
  } catch (error) {
    return responderErro(res, error, 500);
  }
};

module.exports = {
  listar,
  buscarPorId,
  cadastrar,
  editar,
  alterarSenha,
  excluir,
  login,
};