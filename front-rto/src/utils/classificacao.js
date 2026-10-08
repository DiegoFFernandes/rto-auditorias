// Regras de classificação de resultados usadas na tela da auditoria, no resumo (dashboard)
// e nos PDFs. Centralizadas aqui para os limites e as cores não divergirem entre telas.

export const LIMITE_SATISFATORIO = 80;
export const LIMITE_RISCO = 50;

export const NIVEL_SATISFATORIO = 'satisfatorio';
export const NIVEL_RISCO = 'risco';
export const NIVEL_INACEITAVEL = 'inaceitavel';

const STATUS_COM_PONTUACAO = ['CF', 'PC', 'NC'];

// Percentual (0-100) de um tópico: CF vale 1, PC vale 0,5, NC vale 0.
// NE e perguntas sem resposta ficam fora do cálculo. Retorna null se não houver respostas válidas.
export const calcularPercentualTopico = (perguntas = [], respostas = {}) => {
  const validas = perguntas.filter((p) => STATUS_COM_PONTUACAO.includes(respostas[p.id]));
  if (validas.length === 0) return null;

  const pontos = validas.reduce((soma, p) => {
    if (respostas[p.id] === 'CF') return soma + 1;
    if (respostas[p.id] === 'PC') return soma + 0.5;
    return soma;
  }, 0);

  return Math.round((pontos / validas.length) * 100);
};

export const nivelDoPercentual = (percentual) => {
  if (percentual === null || percentual === undefined) return null;
  if (percentual >= LIMITE_SATISFATORIO) return NIVEL_SATISFATORIO;
  if (percentual >= LIMITE_RISCO) return NIVEL_RISCO;
  return NIVEL_INACEITAVEL;
};

const CORES = {
  [NIVEL_SATISFATORIO]: { fundo: '#1ca41c', texto: '#ffffff' },
  [NIVEL_RISCO]: { fundo: '#f2c037', texto: '#333333' },
  [NIVEL_INACEITAVEL]: { fundo: '#dc3545', texto: '#ffffff' },
};
const COR_SEM_DADOS = { fundo: '#bfbfbf', texto: '#333333', grafico: '#999999' };

export const getBackgroundColor = (percentual) =>
  (CORES[nivelDoPercentual(percentual)] || COR_SEM_DADOS).fundo;

export const getTextColor = (percentual) =>
  (CORES[nivelDoPercentual(percentual)] || COR_SEM_DADOS).texto;

export const getChartColor = (percentual) => {
  const cores = CORES[nivelDoPercentual(percentual)];
  return cores ? cores.fundo : COR_SEM_DADOS.grafico;
};

// As imagens ficam em /public. Nos PDFs é preciso informar a origem completa (baseUrl).
export const getMascoteImage = (percentual, baseUrl = '') => {
  const nivel = nivelDoPercentual(percentual);
  if (nivel === NIVEL_SATISFATORIO) return `${baseUrl}/mascote2.png`;
  if (nivel === NIVEL_RISCO) return `${baseUrl}/mascote1.png`;
  if (nivel === NIVEL_INACEITAVEL) return `${baseUrl}/mascote3.png`;
  return null;
};
