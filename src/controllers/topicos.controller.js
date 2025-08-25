const TopicoService = require('../services/topicos.service');

const cadastrar = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ mensagem: 'ID do usuário é obrigatório.' });
  }

  const topico = { ...req.body, usuario_id: Number(id) };

  try {
    const novoTopico = await TopicoService.cadastrarTopico(topico);
    return res.status(201).json(novoTopico);
  } catch (error) {
    if (error.message === 'Tópico já cadastrado') {
      return res.status(409).json({ mensagem: error.message });
    }
    
    return res.status(400).json({ mensagem: error.message });
  }
};

const listar = async (req, res) => {
  try {
    const topicos = await TopicoService.listarTopicos();
    return res.status(200).json(topicos);
  } catch (error) {
    return res.status(500).json({ mensagem: 'Erro ao listar tópicos.' });
  }
};

const listarComPerguntas = async (req, res) => {
  try {
    const topicosComPerguntas = await TopicoService.listarTopicosComPerguntas();
    return res.status(200).json(topicosComPerguntas);
  } catch (error) {
    return res.status(500).json({ mensagem: 'Erro ao listar tópicos com perguntas.' });
  }
};

const editar = async (req, res) => {
  const { id } = req.params;
  const dados = req.body;

  try {
    const topicoEditado = await TopicoService.editarTopico(id, dados);
    return res.status(200).json(topicoEditado);
  } catch (error) {
    return res.status(400).json({ mensagem: error.message });
  }
};

const apagar = async (req, res) => {
  const { id } = req.params;
    
  try {
    return res.status(501).json({ mensagem: 'Método apagar tópico ainda não implementado.' });
  } catch (error) {
    return res.status(500).json({ mensagem: 'Erro ao apagar tópico.' });
  }
};

module.exports = {
  cadastrar,
  listar,
  editar,
  apagar,
  listarComPerguntas
};