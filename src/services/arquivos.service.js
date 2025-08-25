const ArquivosModel = require('../models/Arquivos.Model')
const fs = require('fs');
const path = require('path');

const salvarArquivoAuditoria = async (id_resposta, tipo, caminho) => {
  if (!id_resposta || !tipo || !caminho) {
    throw new Error('Dados obrigatórios para salvar o arquivo estão faltando.');
  }

  if (!['Foto', 'Video', 'Arquivo'].includes(tipo)) {
    throw new Error('Tipo de arquivo inválido. Deve ser "Foto", "Video" ou "Arquivo".');
  }

  const novoArquivoId = await ArquivosModel.inserirArquivos(id_resposta, tipo, caminho);

  return {
    id: novoArquivoId,
    id_resposta,
    tipo,
    caminho
  };
};

const deletarArquivo = async (caminhoUrl) => {
  if (!caminhoUrl) {
    throw new Error('Caminho do arquivo é obrigatório para exclusão.');
  }

  // Converte a URL para o caminho físico no servidor
  const caminhoFisico = path.join(process.cwd(), caminhoUrl);

  // Primeiro, tenta deletar do disco
  try {
    if (fs.existsSync(caminhoFisico)) {
      fs.unlinkSync(caminhoFisico); // Exclusão síncrona para garantir que seja feita antes de continuar
    } else {
      console.warn(`Arquivo físico ${caminhoFisico} não encontrado, mas procedendo com a exclusão do DB.`);
    }
  } catch (error) {
    console.error(`Erro ao deletar arquivo físico ${caminhoFisico}:`, error);
  }

  const linhasAfetadas = await ArquivosModel.deletarArquivoPorCaminho(caminhoUrl);

  if (linhasAfetadas === 0) {
    console.warn(`Registro do arquivo ${caminhoUrl} não encontrado no banco de dados.`);
  } else {
    console.log(`Registro do arquivo ${caminhoUrl} deletado do banco de dados.`);
  }

  return { mensagem: 'Arquivo deletado com sucesso (se encontrado).' };
};

module.exports = {
  salvarArquivoAuditoria,
  deletarArquivo
};