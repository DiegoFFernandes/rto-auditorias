require('dotenv').config();
require('./config/jwt'); // falha na inicialização se JWT_SECRET não estiver definido
const express = require('express');
const cors = require('cors');
const path = require("path");
const corsOptions = require('./config/cors');
const routes = require('./routes');

const app = express();

// A API roda atrás de proxy reverso (Render). Sem isso, req.ip seria o IP do proxy
// e o rate limit do login bloquearia todos os usuários juntos.
app.set('trust proxy', Number(process.env.TRUST_PROXY ?? 1));

app.use(cors(corsOptions));
app.use(express.json());

app.use('/uploads_img', express.static(path.join(__dirname, "..", "uploads_img")));
app.use('/api', routes);

app.use((_req, res) => {
  res.status(404).json({ mensagem: 'Rota não encontrada.' });
});

// Tratador global: JSON malformado vira 400; o resto não expõe detalhes internos.
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ mensagem: 'JSON inválido na requisição.' });
  }
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ mensagem: 'Requisição muito grande.' });
  }
  console.error('Erro não tratado:', err);
  return res.status(500).json({ mensagem: 'Erro interno do servidor.' });
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});