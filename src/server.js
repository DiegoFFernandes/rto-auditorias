require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require("path");
const routes = require('./routes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/uploads_img', express.static(path.join(__dirname, "..", "uploads_img")));
app.use('/api', routes);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});