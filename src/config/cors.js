const origensPermitidas = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map((origem) => origem.trim().replace(/\/+$/, ''))
  .filter(Boolean);

if (origensPermitidas.length === 0) {
  throw new Error(
    'CORS_ORIGINS não definido. Informe no .env as origens do frontend separadas por vírgula (ex.: http://localhost:5173,https://app.seudominio.com).'
  );
}

const corsOptions = {
  origin: (origin, callback) => {
    // Requisições sem Origin (curl, health checks, mesmo domínio) não passam pelo CORS do navegador.
    if (!origin || origensPermitidas.includes(origin)) {
      return callback(null, true);
    }
    return callback(null, false);
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 600,
};

module.exports = corsOptions;
