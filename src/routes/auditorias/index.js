const express = require('express');
const router = express.Router();
const AuditoriaController = require('../../controllers/auditorias.controller');
const AgendamentoController = require('../../controllers/agendamentos.controller');
const authMiddleware = require('../../middlewares/auth');
const { exigeAdmin } = require('../../middlewares/autorizacao');


router.post('/iniciar', authMiddleware, AuditoriaController.iniciar);
router.patch('/progresso/:id', authMiddleware, AuditoriaController.salvarProgresso);
router.put('/finalizar/:id', authMiddleware, AuditoriaController.finalizar);
router.put('/cancelar/:id', authMiddleware, exigeAdmin, AuditoriaController.cancelar);

router.post('/agendar', authMiddleware, AgendamentoController.agendar);
router.get('/agendamentos', authMiddleware, AgendamentoController.listar);
router.delete('/agendamentos/:id', authMiddleware, AgendamentoController.excluir);

router.get('/listar', authMiddleware, AuditoriaController.listar);
router.get('/listar/:id', authMiddleware, AuditoriaController.listarID);
router.get('/listar-dashboard', authMiddleware, AuditoriaController.listarDashboard);
router.get('/data-auditoria/:clienteId', authMiddleware, AuditoriaController.dataAuditoriaPorCliente);


module.exports = router;
