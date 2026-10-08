const express = require("express");
const router = express.Router();
const multer = require("multer");

const authMiddleware = require('../../middlewares/auth');
const uploadMiddleware = require('../../middlewares/ValidaEvidenciasFotos');

const { deletarArquivo } = require('../../controllers/arquivos.controller');

const uploadSingleFoto = uploadMiddleware.single("foto");

const mensagemErroUpload = (uploadErr) => {
  if (uploadErr instanceof multer.MulterError) {
    if (uploadErr.code === 'LIMIT_FILE_SIZE') {
      return `A imagem excede o tamanho máximo de ${uploadMiddleware.MAX_FILE_SIZE_MB} MB.`;
    }
    return 'Envio inválido. Envie apenas uma imagem no campo "foto".';
  }
  return uploadErr.message || 'Falha ao enviar o arquivo.';
};

router.post("/upload", authMiddleware, (req, res) => {
  uploadSingleFoto(req, res, (uploadErr) => {
    if (uploadErr) {
      console.error('Erro ao enviar a evidência para upload:', uploadErr);
      const statusCode = uploadErr instanceof multer.MulterError ? 400 : (uploadErr.statusCode || 500);
      return res.status(statusCode).json({ mensagem: mensagemErroUpload(uploadErr) });
    }

    if (!req.file) {
      return res.status(400).json({ mensagem: "Nenhum arquivo enviado." });
    }

    const fileUrl = req.file.path || req.file.secure_url;

    if (!fileUrl) {
      console.error('Upload concluído, mas o provedor não retornou uma URL acessível.', req.file);
      return res.status(500).json({ mensagem: "Falha ao obter a URL do arquivo enviado." });
    }

    return res.status(200).json({ url: fileUrl });
  });
});

router.delete("/apagar", authMiddleware, deletarArquivo);

module.exports = router;
