const express = require("express");
const router = express.Router();

const uploadMiddleware = require('../../middlewares/ValidaEvidenciasFotos');
const { salvafotoAuditoria, deletarArquivo } = require('../../controllers/arquivos.controller');

router.post("/upload", uploadMiddleware.single("foto"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "Nenhum arquivo enviado" });
  }
  const fileUrl = `/uploads_img/${req.file.filename}`;
  return res.json({ url: fileUrl });
});

router.post("/salvar-foto", salvafotoAuditoria);
router.delete("/apagar", deletarArquivo);


module.exports = router;