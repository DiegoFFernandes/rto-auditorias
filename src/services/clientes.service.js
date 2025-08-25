const ClienteModel = require('../models/Clientes.Model');

const cadastrarCliente = async (dados) => {
  if (!dados.razao_social,  !dados.cnpj) {
    throw new Error('Dados obrigatórios faltando');
  };

  const existeCliente = await ClienteModel.verificaClienteExistente(dados);
  if (existeCliente) {
    throw new Error('CNPJ já cadastrado');
  };
  
  const novoClienteId = await ClienteModel.cadastrarCliente(dados);
  
  return {
    id: novoClienteId,
    ...dados
  };
};

const listarClientes = async () => {
  const clientes = await ClienteModel.listarClientes();
  return clientes;
};

const editarCliente = async (id, dados) => {
  if (!id || !dados.razao_social || !dados.cnpj) {
    throw new Error('Dados obrigatórios faltando');
  }
  const clienteEditado = await ClienteModel.editarCliente(id, dados);
  if (clienteEditado === 0) {
    throw new Error('Cliente não encontrado ou não foi possível editar');
  }
  return {
    id,
    ...dados
  };
};

const excluirCliente = async (id) => {
  if (!id) {
    throw new Error('ID do cliente é obrigatório');
  }
  const clienteExcluido = await ClienteModel.excluirCliente(id);
  if (clienteExcluido === 0) {
    throw new Error('Cliente não encontrado ou não foi possível excluir');
  }
  return { mensagem: 'Cliente excluído com sucesso' };
};

module.exports = {
  cadastrarCliente,
  listarClientes,
  editarCliente,
  excluirCliente
};