import { useAuditoria } from '../hooks/useAuditoria';
import { usePdfGenerator } from '../hooks/usePdfGenerator';

import AuditoriasLoading from '../components/Auditoria/AuditoriasLoading';
import AuditoriaConcluida from '../components/Auditoria/AuditoriaConcluida';
import AuditoriaTopicos from '../components/Auditoria/AuditoriaTopicos';
import AuditoriaPerguntas from '../components/Auditoria/AuditoriaPerguntas';
import AuditoriaEvidencias from '../components/Auditoria/AuditoriaEvidencias';
import AuditoriaNavegacao from '../components/Auditoria/AuditoriaNavegacao';
import CabecalhoAuditoria from '../components/CabecalhoAuditoria';
import PageCabecalho from '../components/Botoes/PageCabecalho';
import LoadingIndicator from '../components/LoadingIndicator';


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
    empresaInfo,
    auditoriaInfo,
    fotos,
    observacoes,
    handleRespostaChange,
    handleNext,
    handleBack,
    handleFotoChange,
    handleObservacaoChange,
    handleRemoveFoto,
    fileInputRef,
    showFinalizeModal,
    confirmFinalize,
    cancelFinalize,
  } = useAuditoria();

  const { generatePdf } = usePdfGenerator();

  if (isLoading || !empresaInfo || !auditoriaInfo) {
    return <AuditoriasLoading />;
  }

  if (saveMessage === 'Auditoria finalizada com sucesso!') {
    const handleGerarPdf = async () => {
      await generatePdf(topicos, respostas, empresaInfo, auditoriaInfo, fotos, observacoes);
    };
    return <AuditoriaConcluida onGerarPdf={handleGerarPdf} />;
  }

  if (!topicos || topicos.length === 0) {
    return (
      <div className="auditorias-page">
        <CabecalhoAuditoria empresaInfo={empresaInfo} auditoriaInfo={auditoriaInfo} />
        <div className="auditorias-container">
          <p className="loading-text">Nenhum tópico de auditoria encontrado.</p>
        </div>
      </div>
    );
  }

  return (
    <><PageCabecalho title="Auditoria" backTo="/listar-auditorias" />
      <div className="auditorias-page">
        <CabecalhoAuditoria empresaInfo={empresaInfo} auditoriaInfo={auditoriaInfo} />
        <div className="global-progress-bar">
          <div className="global-progress-bar-fill" style={{ width: `${progressoGeral}%` }}></div>
        </div>

        <div className="auditorias-container">
          <div className="auditoria-card">
            <AuditoriaTopicos
              topico={currentTopic}
              totalTopicos={topicos.length}
              progressoTopico={progressoDoTopico}
            />
            <hr className="divider" />
            {currentQuestion ? (
              <>
                <div className="auditoria-corpo">
                <AuditoriaPerguntas
                  pergunta={currentQuestion}
                  respostaSelecionada={respostas[currentQuestion.id]}
                  onRespostaChange={handleRespostaChange}
                />
                <AuditoriaEvidencias
                  questionId={currentQuestion.id}
                  fotos={fotos?.[currentQuestion.id] || []}
                  observacao={observacoes?.[currentQuestion.id] || ""}
                  handleFotoChange={handleFotoChange}
                  handleObservacaoChange={handleObservacaoChange}
                  handleRemoveFoto={handleRemoveFoto}
                  fileInputRef={fileInputRef}
                />
                </div>
                <AuditoriaNavegacao
                  onVoltar={handleBack}
                  onAvancar={handleNext}
                  voltarDesabilitado={activeTopicIndex === 0 && activeQuestionIndex === 0}
                  avancarDesabilitado={isButtonDisabled}
                  textoBotaoAvancar={buttonText}
                  salvando={isSaving}
                  indicePergunta={activeQuestionIndex}
                  totalPerguntas={currentTopic?.perguntas.length}
                />
              </>
            ) : (
              <LoadingIndicator message="Carregando pergunta..." size={32} />
            )}
            {resultadoParcialTopico && (
              <div className="resultado-parcial-container" style={{ backgroundColor: resultadoParcialTopico.cor }}>
                <div className="resultado-parcial-conteudo">
                  <span className="resultado-classificacao">{resultadoParcialTopico.classificacao}</span>
                  <span className="resultado-percentual">{resultadoParcialTopico.percentual}%</span>
                </div>
              </div>
            )}
            {saveMessage && saveMessage !== 'Auditoria finalizada com sucesso!' && <div className="save-message"><span>{saveMessage}</span></div>}
          </div>
        </div>
      </div>
      {showFinalizeModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Confirmar Finalização</h2>
            <p>Tem certeza que deseja finalizar a auditoria? Após finalizar, não será possível editar as respostas.</p>
            <div className="modal-actions">
              <button onClick={cancelFinalize} className="btn-cancelar">Cancelar</button>
              <button onClick={confirmFinalize} className="btn-excluir" disabled={isSaving}>
                {isSaving ? 'Finalizando...' : 'Finalizar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Auditorias;
