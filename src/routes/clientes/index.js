const express = require('express');
const router = express.Router();
const ClienteController = require('../../controllers/clientes.controller');
const { validaCliente } = require('../../middlewares/validaClientes');
const authMiddleware = require('../../middlewares/auth');
const { exigeAdmin } = require('../../middlewares/autorizacao');

router.post('/', authMiddleware, exigeAdmin, validaCliente, ClienteController.cadastrar);
router.get('/', authMiddleware, ClienteController.listar);
router.put('/:id', authMiddleware, exigeAdmin, validaCliente, ClienteController.editar);
router.delete('/:id', authMiddleware, exigeAdmin, ClienteController.excluir);

module.exports = router;
