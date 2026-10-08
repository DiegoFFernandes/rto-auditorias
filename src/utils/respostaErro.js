const ehErroDeBanco = (error) => Boolean(error && (error.sqlState || error.sqlMessage || error.errno));

/**
 * Responde um erro capturado em um controller.
 * - Erros de regra de negócio (Error comum ou com statusCode) devolvem a própria mensagem.
 * - Erros do banco e qualquer 5xx devolvem uma mensagem genérica, sem expor detalhes internos.
 */
const responderErro = (res, error, statusPadrao = 400) => {
  const status = error.statusCode || (ehErroDeBanco(error) ? 500 : statusPadrao);

  if (status >= 500) {
    console.error('Erro interno:', error);
    return res.status(500).json({ mensagem: 'Erro interno do servidor.' });
  }

  return res.status(status).json({ mensagem: error.message });
};

module.exports = { responderErro };
