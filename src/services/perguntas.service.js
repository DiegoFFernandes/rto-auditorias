const PerguntasModel = require('../models/Perguntas.Model');

const cadastrarPergunta = async (pergunta) => {  
  if (!pergunta.id_topico || !pergunta.descricao_pergunta || !pergunta.ordem_pergunta) {
    throw new Error('Dados obrigatórios faltando');
  }

  const existePergunta = await PerguntasModel.verificaPerguntaExistente(pergunta);
  if (existePergunta) {
    throw new Error('Pergunta já cadastrada para este tópico');
  }

  const novoPerguntaId = await PerguntasModel.cadastrarPergunta(pergunta);
  
  return {
    id: novoPerguntaId,
    ...pergunta
  };
}

const atualizarStatus = async (id, isActive) => {
  if (id === undefined || isActive === undefined) {
    return { error: true, message: 'ID da pergunta e status são obrigatórios.', statusCode: 400 };
  }
  
  const linhasAfetadas = await PerguntasModel.atualizarStatus(id, isActive);

  if (linhasAfetadas === 0) {
    return { error: true, message: 'Pergunta não encontrada.', statusCode: 404 };
  }
  
  return { mensagem: `Status da pergunta atualizado com sucesso.` };
};

module.exports = {
  cadastrarPergunta,
  atualizarStatus,
};