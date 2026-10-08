const PerguntasService = require('../services/perguntas.service');

const atualizarStatus = async (req, res) => {
  const { id } = req.params;
  const { isActive } = req.body;

  try {
    const resultado = await PerguntasService.atualizarStatus(id, isActive);
    
    if (resultado.error) {
      return res.status(resultado.statusCode).json({ message: resultado.message });
    }
    
    return res.status(200).json(resultado);
  } catch (error) {
    console.error('Erro no controller ao atualizar status da pergunta:', error);
    return res.status(500).json({ message: 'Erro interno do servidor.' });
  }
};

module.exports = {
  atualizarStatus,
};