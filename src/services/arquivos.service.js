const ArquivosModel = require('../models/Arquivos.Model')
const cloudinary = require('../config/cloudinary');
const { extractPublicIdFromUrl } = require('../utils/cloundinary');

// Só aceita apagar arquivos que pertencem à nossa conta/pasta do Cloudinary,
// evitando que a rota seja usada para apagar qualquer outra URL ou asset.
const caminhoPertenceAoSistema = (caminhoUrl, publicId) => {
  try {
    const { hostname, pathname } = new URL(caminhoUrl);
    if (hostname !== 'res.cloudinary.com') return false;
    if (!pathname.startsWith(`/${process.env.CLOUDINARY_CLOUD_NAME}/`)) return false;
  } catch {
    return false;
  }

  const pasta = process.env.CLOUDINARY_UPLOAD_FOLDER;
  return !pasta || (publicId && publicId.startsWith(`${pasta}/`));
};

// Fotos antigas guardadas em disco (/uploads_img/...): só o registro do banco é removido.
const ehCaminhoLegado = (caminho) =>
  typeof caminho === 'string' && caminho.startsWith('/uploads_img/') && !caminho.includes('..');

const erroHttp = (mensagem, statusCode) => {
  const error = new Error(mensagem);
  error.statusCode = statusCode;
  return error;
};

// Se a foto já está vinculada a uma auditoria, só o auditor dono (ou ADM) pode apagá-la,
// e apenas enquanto a auditoria estiver em andamento. Fotos ainda não vinculadas
// (upload recente, antes do salvamento do progresso) não têm dono para conferir.
const validarPermissaoDeExclusao = async (caminhoUrl, usuario) => {
  const vinculo = await ArquivosModel.buscarDonoPorCaminho(caminhoUrl);
  if (!vinculo) return;

  const ehDono = String(vinculo.id_usuario) === String(usuario?.id);
  if (!ehDono && usuario?.role !== 'ADM') {
    throw erroHttp('Você não tem permissão para apagar esta foto.', 403);
  }
  if (vinculo.st_auditoria !== 'A') {
    throw erroHttp('Não é possível apagar fotos de uma auditoria finalizada ou cancelada.', 403);
  }
};

const deletarArquivo = async (caminhoUrl, usuario) => {
  if (!caminhoUrl) {
    throw new Error('Caminho do arquivo é obrigatório para exclusão.');
  }

  const arquivoLegado = ehCaminhoLegado(caminhoUrl);
  const publicId = arquivoLegado ? null : extractPublicIdFromUrl(caminhoUrl);

  if (!arquivoLegado && !caminhoPertenceAoSistema(caminhoUrl, publicId)) {
    const error = new Error('Caminho de arquivo inválido.');
    error.statusCode = 400;
    throw error;
  }

  await validarPermissaoDeExclusao(caminhoUrl, usuario);

  // Primeiro o banco, depois o Cloudinary: se o Cloudinary falhar sobra apenas um arquivo
  // órfão (inofensivo). O contrário deixaria no banco uma referência para uma imagem apagada.
  const linhasAfetadas = await ArquivosModel.deletarArquivoPorCaminho(caminhoUrl);

  if (linhasAfetadas === 0) {
    console.warn(`Registro do arquivo ${caminhoUrl} não encontrado no banco de dados.`);
  }

  if (publicId) {
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      console.error(`Erro ao deletar arquivo no Cloudinary (${publicId}):`, error);
    }
  }

  return { mensagem: 'Arquivo deletado com sucesso (se encontrado).' };
};

// Indica se a URL/caminho de uma foto pertence ao nosso Cloudinary (ou é um caminho legado).
const caminhoDeFotoValido = (caminho) => {
  if (typeof caminho !== 'string' || caminho.trim() === '') return false;
  if (ehCaminhoLegado(caminho)) return true;
  return caminhoPertenceAoSistema(caminho, extractPublicIdFromUrl(caminho));
};

module.exports = {
  deletarArquivo,
  caminhoDeFotoValido
};
