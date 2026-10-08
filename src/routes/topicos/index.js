const express = require('express');
const topicosController = require('../../controllers/topicos.controller');
const authMiddleware = require('../../middlewares/auth');
const { exigeAdmin } = require('../../middlewares/autorizacao');
const { validaTopicos } = require('../../middlewares/validaTopicos');

const router = express.Router();

router.post('/', authMiddleware, exigeAdmin, validaTopicos, topicosController.cadastrarTopico);
router.get('/com-perguntas', authMiddleware, exigeAdmin, topicosController.listarTopicosComPerguntas);
router.post('/salvar-edicao', authMiddleware, exigeAdmin, validaTopicos, topicosController.salvarTopicoEditado);
router.put('/status/:id', authMiddleware, exigeAdmin, topicosController.atualizarStatus);
router.delete('/:id', authMiddleware, exigeAdmin, topicosController.excluirTopico);


module.exports = router;
