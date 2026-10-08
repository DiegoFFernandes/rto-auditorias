const AuditoriasService = require('../services/auditorias.service');
const { responderErro } = require('../utils/respostaErro');

const iniciar = async (req, res) => {
  try {
    const resultado = await AuditoriasService.iniciarAuditoria(req.body, req.usuario);

    if (resultado?.requiresConfirmation) {
      return res.status(200).json({
        mensagem: resultado.mensagem,
        requiresConfirmation: true,
        codigo: resultado.codigo,
        conflito: resultado.conflito,
      });
    }

    return res.status(201).json({ mensagem: 'Auditoria iniciada com sucesso!', auditoria: resultado });
  } catch (error) {
    console.error("Erro no controller ao iniciar auditoria:", error);
    return responderErro(res, error);
  }
};

const salvarProgresso = async (req, res) => {
  const { id } = req.params;
  try {
    const resultado = await AuditoriasService.salvarProgressoAuditoria(id, req.body, req.usuario);
    return res.status(200).json(resultado);
  } catch (error) {
    console.error("Erro no controller ao salvar progresso:", error);
    return responderErro(res, error, 400);
  }
};

const finalizar = async (req, res) => {
  const { id } = req.params;
  try {
    const resultado = await AuditoriasService.finalizarAuditoria(id, req.usuario);
    return res.status(200).json(resultado);
  } catch (error) {
    console.error("Erro no controller ao finalizar auditoria:", error);
    return responderErro(res, error, 400);
  }
};

const cancelar = async (req, res) => {
  const { id } = req.params;
  try {
    const resultado = await AuditoriasService.cancelarAuditoria(id);
    return res.status(200).json(resultado);
  } catch (error) {
    console.error("Erro no controller ao cancelar auditoria:", error);
    return responderErro(res, error, 400);
  }
};


const listar = async (_req, res) => {
  try {
    const auditorias = await AuditoriasService.listaAuditorias();
    return res.status(200).json({ auditorias });
  } catch (error) {
    return responderErro(res, error, 400);
  }
};

const listarID = async (req, res) => {
  try {
    const { id } = req.params;
    const auditoriaDetalhada = await AuditoriasService.listaAuditoriaPorID(id);

    if (!auditoriaDetalhada) {
      return res.status(404).json({ mensagem: 'Auditoria não encontrada.' });
    }

    return res.status(200).json(auditoriaDetalhada);
  } catch (error) {
    console.error("Erro ao listar auditoria por ID:", error);
    return res.status(500).json({ mensagem: 'Erro interno do servidor.' });
  }
};

const listarDashboard = async (req, res) => {
  try {
    const { clienteId, ano } = req.query;

    if (!clienteId || !ano) {
      return res.status(400).json({ mensagem: 'O ID do cliente e o ano são obrigatórios.' });
    }

    const dadosDashboard = await AuditoriasService.listarDashboard(parseInt(clienteId), parseInt(ano));

    return res.status(200).json(dadosDashboard);
  } catch (error) {
    console.error("Erro ao listar dados do dashboard:", error);
    return res.status(500).json({ mensagem: 'Erro ao carregar os dados do dashboard.' });
  }
};

const dataAuditoriaPorCliente = async (req, res) => {
  try {
    const { clienteId } = req.params;

    if (!clienteId) {
      return res.status(400).json({ mensagem: 'O ID do cliente é obrigatório.' });
    }

    const anos = await AuditoriasService.dataAuditoriaPorCliente(parseInt(clienteId));

    return res.status(200).json(anos);
  } catch (error) {
    console.error("Erro ao listar anos de auditoria por cliente:", error);
    return res.status(500).json({ mensagem: 'Erro ao carregar os anos de auditoria.' });
  }
};

module.exports = {
  iniciar,
  salvarProgresso,
  finalizar,
  cancelar,
  listar,
  listarID,
  listarDashboard,
  dataAuditoriaPorCliente
};
