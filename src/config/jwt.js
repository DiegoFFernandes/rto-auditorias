const secret = process.env.JWT_SECRET;

if (!secret || secret.length < 16) {
  throw new Error(
    'JWT_SECRET ausente ou muito curto (mínimo 16 caracteres). Defina uma chave forte no arquivo .env.'
  );
}

module.exports = {
  JWT_SECRET: secret,
  JWT_EXPIRES_IN: '1d',
};
