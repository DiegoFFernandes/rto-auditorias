// Regras de negócio configuráveis por variável de ambiente.

// Quem pode alterar/finalizar uma auditoria em andamento e apagar suas fotos.
//  - false (padrão): qualquer usuário autenticado (ADM ou AUD) pode alterar a auditoria de qualquer um.
//  - true: AUD só altera as próprias auditorias; ADM continua podendo alterar todas.
// Para voltar à regra "somente o dono", defina AUDITORIA_SOMENTE_DONO=true no .env / no Render.
const AUDITORIA_SOMENTE_DONO = process.env.AUDITORIA_SOMENTE_DONO === 'true';

const PERFIL_ADMIN = 'ADM';

const podeAlterarAuditoria = (usuario, idDonoDaAuditoria) => {
  if (!AUDITORIA_SOMENTE_DONO) return true;
  if (usuario?.role === PERFIL_ADMIN) return true;
  return String(idDonoDaAuditoria) === String(usuario?.id);
};

module.exports = { AUDITORIA_SOMENTE_DONO, podeAlterarAuditoria };
