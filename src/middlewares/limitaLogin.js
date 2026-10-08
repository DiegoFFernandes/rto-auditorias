const { rateLimit } = require('express-rate-limit');

const MAX_TENTATIVAS = 5;
const JANELA_MINUTOS = 15;

// Bloqueia o IP após 5 logins mal sucedidos em 15 minutos.
// Logins bem sucedidos não contam (skipSuccessfulRequests).
const limitaLogin = rateLimit({
  windowMs: JANELA_MINUTOS * 60 * 1000,
  limit: MAX_TENTATIVAS,
  skipSuccessfulRequests: true,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    mensagem: `Muitas tentativas de login. Tente novamente em ${JANELA_MINUTOS} minutos.`,
  },
});

module.exports = { limitaLogin };
