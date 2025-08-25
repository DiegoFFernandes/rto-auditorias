const AuditoriasModel = require('../models/Auditorias.Model');
const ArquivosModel = require('../models/Arquivos.Model');

// Exemplo de como seu service deveria ser ajustado
const cadastrarAuditoria = async (data) => {
  const { auditoriaData, respostas } = data;

  try {
    const novaAuditoriaId = await AuditoriasModel.cadastrarAuditoria(auditoriaData);

    for (const resposta of respostas) {
      const novaRespostaId = await AuditoriasModel.cadastrarResposta({
        id_auditoria: novaAuditoriaId,
        id_pergunta: resposta.id_pergunta,
        st_pergunta: resposta.st_pergunta,
        comentario: resposta.comentario
      });

      if (resposta.fotos && resposta.fotos.length > 0) {
        const fotosValidas = resposta.fotos.filter(url => url);
        const promessasFotos = fotosValidas.map(url => {
          return ArquivosModel.inserirArquivos({
            id_resposta: novaRespostaId,
            tipo: 'Foto',
            caminho: url
          });
        });
        await Promise.all(promessasFotos);
      }
    }

    return {
      id: novaAuditoriaId,
      auditoriaData,
      respostas
    };

  } catch (error) {
    console.error('Erro no service ao cadastrar auditoria:', error);
    throw new Error('Erro ao salvar a auditoria e suas respostas.');
  }
};

const listaAuditorias = async () => {
  const auditorias = await AuditoriasModel.listaAuditorias()

  return auditorias
};

const listaAuditoriaPorID = async (id_auditoria) => {
  const dados = await AuditoriasModel.listaAuditoriaPorID(id_auditoria);

  if (!dados || dados.length === 0) {
    return null;
  }

  // Objeto para estruturar o resultado final
  const resultado = {
    auditoriaInfo: {
      id: dados[0].id_auditoria,
      dt_auditoria: dados[0].dt_auditoria,
      observacao: dados[0].observacao,
      auditorResponsavel: dados[0].nome_auditor,
    },
    clienteInfo: {
      id: dados[0].id_cliente,
      razao_social: dados[0].nome_cliente,
      cnpj: dados[0].cnpj,
    },
    topicos: [],
    respostas: {},
    observacoes: {}, // <- Mantém a chave 'observacoes'
    fotos: {},
  };

  const topicosMap = new Map();

  dados.forEach(row => {
    // Adiciona o tópico ao Map se ele ainda não existir
    if (!topicosMap.has(row.id_topico)) {
      topicosMap.set(row.id_topico, {
        id: row.id_topico,
        nome_tema: row.nome_tema,
        requisitos: row.requisitos,
        perguntas: [],
      });
    }

    // Adiciona a pergunta ao array de perguntas do tópico (apenas se ainda não estiver lá)
    if (!topicosMap.get(row.id_topico).perguntas.some(p => p.id === row.id_pergunta)) {
      topicosMap.get(row.id_topico).perguntas.push({
        id: row.id_pergunta,
        descricao_pergunta: row.descricao_pergunta,
        ordem_pergunta: row.ordem_pergunta,
      });
    }

    // Popula os dados de resposta e observação
    resultado.respostas[row.id_pergunta] = row.st_pergunta;
    resultado.observacoes[row.id_pergunta] = row.comentario || '';

    // Popula as fotos, dividindo a string do banco em um array
    resultado.fotos[row.id_pergunta] = row.caminhos_fotos
      ? row.caminhos_fotos.split(',')
      : [];
  });

  // Converte o Map em um array e ordena
  resultado.topicos = Array.from(topicosMap.values());
  resultado.topicos.sort((a, b) => a.id - b.id);

  return resultado;
};

module.exports = {
  cadastrarAuditoria,
  listaAuditorias,
  listaAuditoriaPorID
};