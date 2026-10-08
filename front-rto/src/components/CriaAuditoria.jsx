import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';
import { toast } from 'react-toastify';
import PageCabecalho from './Botoes/PageCabecalho';
import LoadingIndicator from './LoadingIndicator';
import SelecionarEmpresa from './SelecionarEmpresa';
import { useAuth } from '../contexts/AuthContext.jsx';
import { FaBuilding, FaClipboardList } from 'react-icons/fa';

import '../styles/CriaAuditoria/index.css';

// Data de hoje no fuso local (toISOString usaria UTC e poderia devolver o dia seguinte à noite).
const hojeLocal = () => {
  const agora = new Date();
  const mes = String(agora.getMonth() + 1).padStart(2, '0');
  const dia = String(agora.getDate()).padStart(2, '0');
  return `${agora.getFullYear()}-${mes}-${dia}`;
};

const CriaAuditoria = () => {
  const navigate = useNavigate();
  const { userData } = useAuth();

  const [clientes, setClientes] = useState([]);
  const [empresaSelecionada, setEmpresaSelecionada] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isStarting, setIsStarting] = useState(false);
  const [isResolvingConflict, setIsResolvingConflict] = useState(false);
  const [error, setError] = useState(null);
  const [showCompetenciaModal, setShowCompetenciaModal] = useState(false);
  const [payloadPendente, setPayloadPendente] = useState(null);
  const [dadosAuditoria, setDadosAuditoria] = useState({
    tipoAuditoria: '',
    auditorResponsavel: '',
    dataInicio: hojeLocal(),
    observacoes: '',
  });

  useEffect(() => {
    const fetchClientes = async () => {
      setIsLoading(true);
      try {
        const { data } = await api.get('/clientes');
        setClientes(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Erro ao buscar clientes:", error);
        setError('Não foi possível carregar a lista de clientes.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchClientes();

    if (userData) {
      setDadosAuditoria((prev) => ({
        ...prev,
        auditorResponsavel: userData.nome,
      }));
    }
  }, [userData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setDadosAuditoria((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!empresaSelecionada) {
      toast.error('Por favor, selecione uma empresa.');
      return;
    }
    if (!dadosAuditoria.dataInicio) {
        toast.error('Por favor, informe a data de início.');
        return;
    }

    setIsStarting(true);

    const payload = {
      cliente: empresaSelecionada,
      auditoria: {
        tipoAuditoria: dadosAuditoria.tipoAuditoria,
        auditorResponsavel: dadosAuditoria.auditorResponsavel,
        dataInicio: dadosAuditoria.dataInicio,
        observacao_geral: dadosAuditoria.observacoes,
      },
    };

    try {
      const response = await api.post('/auditorias/iniciar', payload);

      if (response?.data?.requiresConfirmation) {
        setPayloadPendente(payload);
        setShowCompetenciaModal(true);
        setIsStarting(false);
        return;
      }

      const newAuditId = response.data.auditoria.id;
      toast.success('Auditoria iniciada com sucesso!');
      navigate(`/auditorias/${newAuditId}`);
    } catch (err) {
      toast.error(err.response?.data?.mensagem || 'Ocorreu um erro ao iniciar a auditoria');
      setIsStarting(false);
    }
  };

  const handleCloseCompetenciaModal = () => {
    if (isResolvingConflict) {
      return;
    }
    setShowCompetenciaModal(false);
    setPayloadPendente(null);
  };

  const handleConfirmarCancelarAnteriorESeguir = async () => {
    if (!payloadPendente) {
      toast.error('Não foi possível continuar. Refaça o início da auditoria.');
      setShowCompetenciaModal(false);
      return;
    }

    setIsResolvingConflict(true);
    try {
      const response = await api.post('/auditorias/iniciar', {
        ...payloadPendente,
        forceCancelPrevious: true,
      });
      const newAuditId = response.data.auditoria.id;
      toast.success('Auditoria iniciada com sucesso!');
      navigate(`/auditorias/${newAuditId}`);
      setShowCompetenciaModal(false);
      setPayloadPendente(null);
    } catch (err) {
      toast.error(err.response?.data?.mensagem || 'Ocorreu um erro ao iniciar a auditoria');
    } finally {
      setIsResolvingConflict(false);
      setIsStarting(false);
    }
  };

  const handleRedirectToCadastro = () => {
    navigate('/administracao/clientes');
  };

  if (isLoading) {
    return (
      <div className="ca-page">
        <LoadingIndicator message="Carregando clientes..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="ca-page ca-estado-erro">
        <h2>Erro ao Carregar</h2>
        <p>{error}</p>
      </div>
    );
  }

  const ehAdmin = userData?.role === 'ADM';
  const resumoEmpresa = empresaSelecionada
    ? [
        ['CNPJ', empresaSelecionada.cnpj],
        ['Responsável', empresaSelecionada.responsavel],
        ['Telefone', empresaSelecionada.telefone],
      ].filter(([, valor]) => Boolean(valor))
    : [];

  return (
    <div className="ca-page">
      <PageCabecalho
        title="Criar Auditoria"
        backTo="/"
      />

      <form onSubmit={handleSubmit} className="ca-form">
        <div className="ca-layout">
          <section className="ca-card ca-card--empresa">
            <h2 className="ca-card-titulo">
              <span className="ca-card-icone"><FaBuilding /></span>
              Empresa
            </h2>

            {clientes.length > 0 ? (
              <>
                <SelecionarEmpresa
                  id="empresa"
                  empresas={clientes}
                  value={empresaSelecionada?.id ?? ''}
                  onChange={setEmpresaSelecionada}
                  ariaLabel="Empresa da auditoria"
                />

                {empresaSelecionada && (
                  <dl className="ca-empresa-resumo">
                    {resumoEmpresa.map(([rotulo, valor]) => (
                      <div key={rotulo}>
                        <dt>{rotulo}</dt>
                        <dd>{valor}</dd>
                      </div>
                    ))}
                  </dl>
                )}
              </>
            ) : (
              <div className="campo-vazio">
                <p>Nenhum cliente cadastrado.</p>
                {ehAdmin ? (
                  <button
                    type="button"
                    className="btn-enviar"
                    onClick={handleRedirectToCadastro}
                  >
                    Cadastrar Cliente
                  </button>
                ) : (
                  <p className="ca-dica">Peça a um administrador para cadastrar o cliente.</p>
                )}
              </div>
            )}
          </section>

          <div className="ca-coluna-dados">
            {empresaSelecionada ? (
              <>
                <section className="ca-card">
                  <h2 className="ca-card-titulo">
                    <span className="ca-card-icone"><FaClipboardList /></span>
                    Dados da auditoria
                  </h2>

                  <div className="ca-grade">
                    <div className="ca-campo ca-campo--cheio">
                      <label htmlFor="tipoAuditoria">Serviços</label>
                      <input
                        type="text"
                        id="tipoAuditoria"
                        name="tipoAuditoria"
                        value={dadosAuditoria.tipoAuditoria}
                        onChange={handleInputChange}
                        placeholder="Ex.: Auditoria de boas práticas"
                      />
                    </div>

                    <div className="ca-campo">
                      <label htmlFor="auditorResponsavel">Auditor responsável</label>
                      <input
                        type="text"
                        id="auditorResponsavel"
                        name="auditorResponsavel"
                        value={dadosAuditoria.auditorResponsavel}
                        readOnly
                      />
                    </div>

                    <div className="ca-campo">
                      <label htmlFor="dataInicio">Data de início *</label>
                      <input
                        type="date"
                        id="dataInicio"
                        name="dataInicio"
                        value={dadosAuditoria.dataInicio}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div className="ca-campo ca-campo--cheio">
                      <label htmlFor="observacoes">Observações gerais</label>
                      <textarea
                        id="observacoes"
                        name="observacoes"
                        value={dadosAuditoria.observacoes}
                        onChange={handleInputChange}
                        rows="3"
                        placeholder="Opcional"
                      />
                    </div>
                  </div>
                </section>

                <div className="ca-acoes">
                  <button type="submit" className="ca-btn-iniciar" disabled={isStarting}>
                    {isStarting ? 'Iniciando...' : 'Iniciar Auditoria'}
                  </button>
                </div>
              </>
            ) : (
              clientes.length > 0 && (
                <div className="ca-aguardando">
                  <FaClipboardList aria-hidden="true" />
                  <p>Selecione uma empresa para preencher os dados e iniciar a auditoria.</p>
                </div>
              )
            )}
          </div>
        </div>
      </form>

      {showCompetenciaModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Atenção!</h2>
            <p>
              Já existe uma validação dentro do mês de competência. Você deseja cancelar a anterior e seguir com uma nova?
            </p>
            <div className="modal-actions">
              <button
                type="button"
                onClick={handleCloseCompetenciaModal}
                className="btn-cancelar"
                disabled={isResolvingConflict}
              >
                Manter Auditoria
              </button>
              <button
                type="button"
                onClick={handleConfirmarCancelarAnteriorESeguir}
                className="btn-excluir"
                disabled={isResolvingConflict}
              >
                {isResolvingConflict ? 'Cancelando...' : 'Cancelar Auditoria'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CriaAuditoria;