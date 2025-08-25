const ArquivosService = require('../services/arquivos.service');
const fs = require('fs'); 

const salvafotoAuditoria = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Nenhum arquivo de foto enviado.' });
  }

  const { id_resposta, tipo } = req.body;
  const caminhoLocal = req.file.path;
  const caminhoUrl = `/uploads_img/${req.file.filename}`;

  try {
    if (!id_resposta) {
      fs.unlink(caminhoLocal, (err) => {
        if (err) console.error("Erro ao excluir arquivo no disco após falta de id_resposta:", err);
      });
      return res.status(400).json({ mensagem: 'O campo id_resposta é obrigatório para salvar o arquivo no banco de dados.' });
    }

    const tipoArquivo = tipo || 'Foto'; 

    const novoArquivo = await ArquivosService.salvarArquivoAuditoria(
      id_resposta,
      tipoArquivo,
      caminhoUrl
    );

    return res.status(201).json({
      mensagem: 'Foto da auditoria salva com sucesso!',
      arquivo: novoArquivo
    });
  } catch (error) {
    console.error("Erro ao processar upload da foto da auditoria:", error);
    fs.unlink(caminhoLocal, (err) => {
      if (err) console.error("Erro ao excluir arquivo no disco após falha no serviço/DB:", err);
    });
    return res.status(400).json({ mensagem: error.message || 'Erro ao salvar a foto da auditoria.' });
  }
};

const deletarArquivo = async (req, res) => {
  const { caminho } = req.body;

  if (!caminho) {
    return res.status(400).json({ mensagem: 'O caminho do arquivo é obrigatório para a exclusão.' });
  }

  try {
    const resultado = await ArquivosService.deletarArquivo(caminho);
    return res.status(200).json({ mensagem: resultado.mensagem });
  } catch (error) {
    console.error("Erro ao deletar arquivo:", error);
    return res.status(500).json({ mensagem: error.message || 'Erro interno do servidor ao deletar arquivo.' });
  }
};

module.exports = {
  salvafotoAuditoria,
  deletarArquivo
};
