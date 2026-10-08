const express = require('express');
const router = express.Router();
const perguntasController = require('../../controllers/perguntas.controller');
const authMiddleware = require('../../middlewares/auth');
const { exigeAdmin } = require('../../middlewares/autorizacao');

router.put('/status/:id', authMiddleware, exigeAdmin, perguntasController.atualizarStatus);

module.exports = router;
