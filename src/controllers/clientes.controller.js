const ClienteService = require('../services/clientes.service');
const { responderErro } = require('../utils/respostaErro');

const cadastrar = async (req, res) => {
  try {
    const novoCliente = await ClienteService.cadastrarCliente(req.body);
    return res.status(201).json({ mensagem: 'Cliente criado com Sucesso!' ,novoCliente });
  } catch (error) {
    return responderErro(res, error, 400);
  }
};

const listar = async (req, res) => {
  try {
    const clientes = await ClienteService.listarClientes();
    return res.status(200).json(clientes);
  } catch (error) {
    return responderErro(res, error, 400);
  }
};

const editar = async (req, res) => {
  const { id } = req.params;
  try {
    const clienteEditado = await ClienteService.editarCliente(id, req.body);
    return res.status(200).json(clienteEditado);
  } catch (error) {
    return responderErro(res, error, 400);
  }
};

const excluir = async (req, res) => {
  const { id } = req.params;
  try {
    const resultado = await ClienteService.excluirCliente(id);
    return res.status(200).json(resultado);
  } catch (error) {
    return responderErro(res, error, 400);
  }
};

module.exports = {
  cadastrar,
  listar,
  editar,
  excluir
};