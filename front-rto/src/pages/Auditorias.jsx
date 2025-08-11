import React from 'react';
import { Link } from 'react-router-dom';
import { useAuditoria } from '../hooks/useAuditoria';
import { usePdfGenerator } from '../hooks/usePdfGenerator'

import Radio from '@mui/material/Radio';
import FormControlLabel from '@mui/material/FormControlLabel';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import HomeIcon from '@mui/icons-material/Home';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import CabecalhoAuditoria from '../components/CabecalhoAuditoria';

import '../styles/Auditorias/index.css';

const Auditorias = () => {
  const {
    topicos,
    isLoading,
    isSaving,
    saveMessage,
    activeTopicIndex,
    activeQuestionIndex,
    currentTopic,
    currentQuestion,
    progressoGeral,
    progressoDoTopico,
    resultadoParcialTopico,
    buttonText,
    isButtonDisabled,
    respostas,
    handleRespostaChange,
    handleNext,
    handleBack,
  } = useAuditoria();

  const { generatePdf } = usePdfGenerator();

  if (saveMessage === 'Auditoria salva com sucesso!') {
    return (
      <div className="auditorias-page">
        <div className="auditorias-container">
          <div className="success-card">
            <h1 className="success-title">Auditoria Concluída!</h1>
            <p className="success-message">A sua auditoria foi salva com sucesso no sistema.</p>
            <div className="success-actions">
              <Link to="/" className="nav-button back">
                <HomeIcon className="nav-icon" />
                Ir para a Home
              </Link>
              <button
                onClick={() => generatePdf(topicos, respostas)}
                className="nav-button next"
              >
                <PictureAsPdfIcon className="nav-icon" />
                Gerar PDF
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="auditorias-page">
        <div className="auditorias-container">
          <div className="loading-card">
            <p className="loading-text">Carregando...</p>
            <div className="progress-bar-container">
              <div className="progress-bar" style={{ width: `${0}%` }}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (topicos.length === 0) {
    return (
      <div className="auditorias-page">
        <div className="auditorias-container">
          <div className="loading-card">
            <p className="loading-text">Nenhum tópico de auditoria encontrado.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auditorias-page">
      <CabecalhoAuditoria />
      <div className="global-progress-bar">
        <div className="global-progress-bar-fill" style={{ width: `${progressoGeral}%` }}></div>
      </div>
      <div className="auditorias-container">
        <div className="auditoria-card">
          <div className="card-header-v2">
            <h2 className="topic-number">Tópico {activeTopicIndex + 1}/{topicos.length}</h2>
            <h1 className="topic-title">{currentTopic.requisitos}</h1>
            <p className="topic-subtitle">{currentTopic.requisitos}</p>
            <div className="topic-progress-bar-container">
              <div className="topic-progress-bar-label">
                <span className="topic-progress-text">{progressoDoTopico}%</span>
              </div>
              <div className="topic-progress-bar-fill" style={{ width: `${progressoDoTopico}%` }}></div>
            </div>
          </div>
          <hr className="divider" />
          <div className="card-content">
            <h2 className="question-title">
              {currentQuestion.ordem_pergunta} - {currentQuestion.descricao_pergunta}
            </h2>
            <div className="options-container">
              {['CF', 'NC', 'NE'].map(opcao => (
                <div
                  key={opcao}
                  className={`option-item ${respostas[currentQuestion.id] === opcao ? 'selected' : ''}`}
                  onClick={() => handleRespostaChange(currentQuestion.id, opcao)}
                >
                  <FormControlLabel
                    control={
                      <Radio
                        checked={respostas[currentQuestion.id] === opcao}
                        value={opcao}
                        icon={<RadioButtonUncheckedIcon className="radio-icon" />}
                        checkedIcon={<RadioButtonCheckedIcon className="radio-icon checked" />}
                      />
                    }
                    label={
                      <span className="option-label">
                        {opcao === 'CF' ? 'Conforme' : opcao === 'NC' ? 'Não Conforme' : 'Não Existe'}
                      </span>
                    }
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="navigation-container">
            <button
              onClick={handleBack}
              disabled={activeTopicIndex === 0 && activeQuestionIndex === 0 || isSaving}
              className={`nav-button back ${activeTopicIndex === 0 && activeQuestionIndex === 0 || isSaving ? 'disabled' : ''}`}
            >
              <ArrowBackIosIcon className="nav-icon" /> Voltar
            </button>
            <div className="question-counter">
              Pergunta {activeQuestionIndex + 1} de {currentTopic?.perguntas.length}
            </div>
            <button
              onClick={handleNext}
              disabled={isButtonDisabled}
              className={`nav-button next ${isButtonDisabled ? 'disabled' : ''}`}
            >
              {isSaving ? 'Salvando...' : buttonText}
              {!isSaving && <ArrowForwardIosIcon className="nav-icon" />}
            </button>
          </div>
          {resultadoParcialTopico && (
            <div className="resultado-parcial-container" style={{ backgroundColor: resultadoParcialTopico.cor }}>
              <div className="resultado-parcial-conteudo">
                <span className="resultado-classificacao">{resultadoParcialTopico.classificacao}</span>
                <span className="resultado-percentual">{resultadoParcialTopico.percentual}%</span>
              </div>
            </div>
          )}
          {saveMessage && (
            <div className="save-message">
              <span>{saveMessage}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auditorias;