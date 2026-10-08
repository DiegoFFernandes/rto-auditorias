const PERFIL_ADMIN = 'ADM';

const ehAdmin = (req) => req.usuario?.role === PERFIL_ADMIN;

const negarAcesso = (res) =>
  res.status(403).json({ mensagem: 'Você não tem permissão para realizar esta ação.' });

// Exige perfil ADM. Deve vir depois do authMiddleware.
const exigeAdmin = (req, res, next) => {
  if (!ehAdmin(req)) {
    return negarAcesso(res);
  }
  next();
};

// Permite ADM ou o próprio usuário dono do recurso (rota com :id).
const exigeAdminOuProprio = (req, res, next) => {
  if (ehAdmin(req) || String(req.usuario?.id) === String(req.params.id)) {
    return next();
  }
  return negarAcesso(res);
};

module.exports = { exigeAdmin, exigeAdminOuProprio };
