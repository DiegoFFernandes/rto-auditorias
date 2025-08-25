import React from 'react';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

import '../../styles/Auditorias/index.css';

const AuditoriaNavegacao = ({ onVoltar, onAvancar, voltarDesabilitado, avancarDesabilitado, textoBotaoAvancar, salvando, indicePergunta, totalPerguntas }) => (
  <div className="navigation-container">
    <button
      onClick={onVoltar}
      disabled={voltarDesabilitado || salvando}
      className={`nav-button back ${voltarDesabilitado || salvando ? 'disabled' : ''}`}
    >
      <ArrowBackIosIcon className="nav-icon" /> Voltar
    </button>
    <div className="question-counter">
      Pergunta {indicePergunta + 1} de {totalPerguntas}
    </div>
    <button
      onClick={onAvancar}
      disabled={avancarDesabilitado}
      className={`nav-button next ${avancarDesabilitado ? 'disabled' : ''}`}
    >
      {salvando ? 'Salvando...' : textoBotaoAvancar}
      {!salvando && <ArrowForwardIosIcon className="nav-icon" />}
    </button>
  </div>
);

export default AuditoriaNavegacao;