import React from 'react';

import '../../styles/Auditorias/index.css';

const opcoes = [
  { valor: 'CF', texto: 'Conforme' },
  { valor: 'PC', texto: 'Conformidade Parcial' },
  { valor: 'NC', texto: 'Não Conforme' },
  { valor: 'NE', texto: 'Não Existe' },
];

const AuditoriaPerguntas = ({ pergunta, respostaSelecionada, onRespostaChange }) => (
  <div className="card-content">
    <h2 className="question-title">
      <span className="question-numero">{pergunta.ordem_pergunta}</span>
      <span>{pergunta.descricao_pergunta}</span>
    </h2>
    <div className="options-container" role="radiogroup" aria-label="Resposta da pergunta">
      {opcoes.map(opcao => {
        const selecionada = respostaSelecionada === opcao.valor;
        return (
          <label
            key={opcao.valor}
            className={`option-item option-${opcao.valor}${selecionada ? ' selected' : ''}`}
          >
            <input
              type="radio"
              className="option-input"
              name={`resposta-${pergunta.id}`}
              value={opcao.valor}
              checked={selecionada}
              onChange={() => onRespostaChange(pergunta.id, opcao.valor)}
            />
            <span className="option-marca" aria-hidden="true" />
            <span className="option-label">{opcao.texto}</span>
          </label>
        );
      })}
    </div>
  </div>
);

export default AuditoriaPerguntas;
