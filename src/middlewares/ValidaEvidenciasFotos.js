const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Caminho absoluto baseado na raiz do projeto onde os arquivos serão salvos
const uploadDir = path.join(process.cwd(), "uploads_img");

// Garante que o diretório de upload exista.
// Se não existir, ele é criado recursivamente.
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuração de armazenamento do Multer:
// diskStorage permite controlar o destino e o nome do arquivo no disco.
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Define o diretório de destino para os arquivos carregados
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Gera um nome de arquivo único para evitar colisões.
    // Combina o timestamp atual com um número aleatório e a extensão original do arquivo.
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

// Instância do Multer com a configuração de armazenamento definida.
// Este 'upload' será o middleware que você usará nas suas rotas.
const upload = multer({ storage: storage });

module.exports = upload; // Exporta a instância do Multer