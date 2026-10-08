const express = require('express');
const router = express.Router();
const UserController = require('../../controllers/usuarios.controller');
const { validaUsuario } = require('../../middlewares/validaUsuario');
const { validaLogin } = require('../../middlewares/validaLogin');
const { validaSenha } = require('../../middlewares/validaSenha');
const { limitaLogin } = require('../../middlewares/limitaLogin');
const authMiddleware = require('../../middlewares/auth');
const { exigeAdmin, exigeAdminOuProprio } = require('../../middlewares/autorizacao');

router.post('/login', limitaLogin, validaLogin, UserController.login);

router.get('/', authMiddleware, exigeAdmin, UserController.listar);
router.get('/:id', authMiddleware, exigeAdminOuProprio, UserController.buscarPorId);
router.post('/', authMiddleware, exigeAdmin, validaUsuario, UserController.cadastrar);
router.put('/:id', authMiddleware, exigeAdmin, validaUsuario, UserController.editar);
router.patch('/senha/:id', authMiddleware, exigeAdminOuProprio, validaSenha, UserController.alterarSenha);
router.delete('/:id', authMiddleware, exigeAdmin, UserController.excluir);

module.exports = router;
