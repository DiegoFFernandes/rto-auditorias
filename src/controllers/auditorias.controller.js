const AuditoriasService = require('../services/auditorias.service');

const cadastrar = async (req, res) => {
  try {
    const novaAuditoria = await AuditoriasService.cadastrarAuditoria(req.body);    
    
    return res.status(201).json({ mensagem: 'Auditoria cadastrada com sucesso!', novaAuditoria });
  } catch (error) {
    return res.status(400).json({ mensagem: error.message });
  }
};

const listar = async (_req, res) => {
  try {
    const auditorias = await AuditoriasService.listaAuditorias();
    return res.status(200).json({ auditorias });
  } catch (error) {
    return res.status(400).json({ mensagem: error.message });
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

module.exports = {
  cadastrar,
  listar,
  listarID
};