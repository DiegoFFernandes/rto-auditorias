const AgendamentoService = require('../services/agendamentos.service');
const { responderErro } = require('../utils/respostaErro');

const agendar = async (req, res) => {
  try {
    const novoAgendamento = await AgendamentoService.agendarAuditoria(req.body);  
    return res.status(201).json({ mensagem: 'Agendamento criado com sucesso!', novoAgendamento });
  } catch (error) {
    return responderErro(res, error, 400);
  }
};

const listar = async (req, res) => {
  try {
    const agendamentos = await AgendamentoService.listarAgendamentosFuturos();
    return res.status(200).json(agendamentos);
  } catch (error) {
    return responderErro(res, error, 400);
  }
};

const excluir = async (req, res) => {
  const { id } = req.params;
  try {
    const resultado = await AgendamentoService.excluirAgendamento(id);
    return res.status(200).json(resultado);
  } catch (error) {
    return responderErro(res, error, 400);
  }
};

module.exports = {
  agendar,
  listar,
  excluir,
};