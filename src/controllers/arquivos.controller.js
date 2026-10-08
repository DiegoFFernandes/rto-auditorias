const ArquivosService = require('../services/arquivos.service');

const deletarArquivo = async (req, res) => {
  const { caminho } = req.body;

  if (!caminho) {
    return res.status(400).json({ mensagem: 'O caminho do arquivo é obrigatório para a exclusão.' });
  }

  try {
    const resultado = await ArquivosService.deletarArquivo(caminho, req.usuario);
    return res.status(200).json({ mensagem: resultado.mensagem });
  } catch (error) {
    console.error("Erro ao deletar arquivo:", error);
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      mensagem: statusCode === 500 ? 'Erro interno do servidor ao deletar arquivo.' : error.message,
    });
  }
};

module.exports = {
  deletarArquivo
};
