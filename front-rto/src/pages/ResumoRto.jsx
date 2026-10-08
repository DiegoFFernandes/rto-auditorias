import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import api from "../api/api";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { FaFilePdf, FaSpinner } from "react-icons/fa";
import usePdfExport from "../hooks/usePdfExport";
import { getBackgroundColor, getTextColor, getChartColor, getMascoteImage } from "../utils/classificacao";
import ChartDataLabels from 'chartjs-plugin-datalabels';
import PageCabecalho from "../components/Botoes/PageCabecalho";
import SelecionarEmpresa from "../components/SelecionarEmpresa";
import LoadingIndicator from "../components/LoadingIndicator";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import 'jspdf-autotable';
import logo from "../assets/logo3.png";

import "../styles/ResumoRto/index.css";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, ChartDataLabels);

const ResumoRto = () => {
  const [empresas, setEmpresas] = useState([]);
  const [anos, setAnos] = useState([]);
  const [empresaSelecionada, setEmpresaSelecionada] = useState("");
  const [anoSelecionado, setAnoSelecionado] = useState("");
  const [dadosConsolidados, setDadosConsolidados] = useState(null);
  const [loading, setLoading] = useState({ empresas: false, anos: false, dashboard: false });
  const { exportToPDF, isExporting, exportError } = usePdfExport();
  const [mensagemAviso, setMensagemAviso] = useState('');

  const doughnutChartRef = useRef(null);
  const barChartRef = useRef(null);
  const [isMobile, setIsMobile] = useState(() => (typeof window !== 'undefined' ? window.innerWidth <= 768 : false));

  const isLoading = loading.empresas || loading.anos || loading.dashboard;

  useEffect(() => {
    const handleResize = () => {
      if (typeof window === 'undefined') return;
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchEmpresas = async () => {
      setLoading(prev => ({ ...prev, empresas: true }));
      try {
        const res = await api.get("/clientes");
        setEmpresas(res.data);
      } catch (err) {
        console.error("Erro ao carregar clientes:", err);
      } finally {
        setLoading(prev => ({ ...prev, empresas: false }));
      }
    };
    fetchEmpresas();
  }, []);

  useEffect(() => {
    if (!empresaSelecionada) {
      setAnos([]);
      setAnoSelecionado("");
      setMensagemAviso('');
      setDadosConsolidados(null);
      return;
    }
    const fetchAnos = async () => {
      setLoading(prev => ({ ...prev, anos: true }));
      setAnoSelecionado("");
      setDadosConsolidados(null);
      try {
        const res = await api.get(`/auditorias/data-auditoria/${empresaSelecionada}`);
        const anosDisponiveis = res.data.map(item => item.ano).sort();
        setAnos(anosDisponiveis);
        if (anosDisponiveis.length === 0) {
          const nomeEmpresa = empresas.find(emp => emp.id.toString() === empresaSelecionada)?.razao_social;
          const aviso = nomeEmpresa
            ? `${nomeEmpresa} ainda não possui dados de auditorias.`
            : 'Esta empresa ainda não possui dados de auditorias.';
          setMensagemAviso(aviso);
        } else {
          setMensagemAviso('');
        }
      } catch (err) {
        console.error("Erro ao buscar anos da auditoria:", err);
        setAnos([]);
        setDadosConsolidados(null);
        setMensagemAviso('Não foi possível carregar os anos desta empresa.');
      } finally {
        setLoading(prev => ({ ...prev, anos: false }));
      }
    };
    fetchAnos();
  }, [empresaSelecionada, empresas]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!empresaSelecionada || !anoSelecionado) {
        setDadosConsolidados(null);
        setMensagemAviso('');
        return;
      }
      setLoading(prev => ({ ...prev, dashboard: true }));
      try {
        const res = await api.get(`/auditorias/listar-dashboard`, {
          params: { clienteId: empresaSelecionada, ano: anoSelecionado }
        });
        const resultado = res.data;
        if (resultado.processos?.length === 0) {
          const nomeEmpresa = empresas.find(emp => emp.id.toString() === empresaSelecionada)?.razao_social;
          const aviso = nomeEmpresa
            ? `${nomeEmpresa} ainda não possui dados de auditorias para ${anoSelecionado}.`
            : 'Nenhum dado disponível para a combinação selecionada.';
          setMensagemAviso(aviso);
        } else {
          setMensagemAviso('');
        }
        setDadosConsolidados(resultado);
        
      } catch (err) {
        console.error("Erro ao buscar dados do dashboard:", err);
        setMensagemAviso('Não foi possível carregar os dados para esta empresa.');
        setDadosConsolidados(null);
      } finally {
        setLoading(prev => ({ ...prev, dashboard: false }));
      }
    };
    fetchDashboardData();
  }, [empresaSelecionada, anoSelecionado, empresas]);

  const overallResult = useMemo(() => {
    if (!dadosConsolidados) return null;
    const validResults = dadosConsolidados.resultadosMensais
      .map(r => r.resultado)
      .filter(r => typeof r === 'number');

    if (validResults.length === 0) return null;
    const sum = validResults.reduce((acc, curr) => acc + curr, 0);
    return Math.round(sum / validResults.length);
  }, [dadosConsolidados]);

  const chartData = useMemo(() => ({
    labels: dadosConsolidados?.resultadosMensais.map(item => item.mes) || [],
    datasets: [{
      label: 'Resultado de Auditoria (%)',
      data: dadosConsolidados?.resultadosMensais.map(item => item.resultado ?? 0) || [],
      backgroundColor: dadosConsolidados?.resultadosMensais.map(item => getChartColor(item.resultado)) || [],
    }],
  }), [dadosConsolidados]);

  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    layout: {
      padding: {
        right: 8,
      }
    },
    scales: {
      y: { beginAtZero: true, max: 100, title: { display: true, text: 'Porcentagem (%)' } },
      x: {
        title: { display: true, text: 'Mês' },
        offset: true,
        ticks: {
          autoSkip: isMobile,
          source: 'data',
          maxRotation: isMobile ? 45 : 0,
          minRotation: 0,
          padding: isMobile ? 2 : 6,
          font: {
            size: isMobile ? 9 : 12,
          },
          callback(value) {
            const label = this.getLabelForValue ? this.getLabelForValue(value) : value;
            if (!label) return label;
            return isMobile ? label.toString().slice(0, 3) : label;
          }
        },
      }
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => (context.parsed.y !== 0 ? `${context.parsed.y}%` : "N/A"),
        }
      },
      datalabels: {
        anchor: 'center',
        align: 'center',
       
        formatter: (value) => {
          if (value > 0) {
            return `${value}%`;
          }
          return null;
        },
        
        color: (context) => {         
          const value = context.dataset.data[context.dataIndex];
          return getTextColor(value);
        },

        font: {
          weight: 'bold',
          size: isMobile ? 10 : 13,
        }
      }
    }
  }), [isMobile]);

  const exportChartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    layout: {
      padding: {
        right: 8,
      }
    },
    scales: {
      y: { beginAtZero: true, max: 100, title: { display: true, text: 'Porcentagem (%)' } },
      x: {
        title: { display: true, text: 'Mês' },
        offset: true,
        ticks: {
          autoSkip: false,
          source: 'data',
          maxRotation: 0,
          minRotation: 0,
          padding: 6,
          font: {
            size: 12,
          },
        },
      }
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => (context.parsed.y !== 0 ? `${context.parsed.y}%` : "N/A"),
        }
      },
      datalabels: {
        anchor: 'center',
        align: 'center',
        formatter: (value) => {
          if (value > 0) {
            return `${value}%`;
          }
          return null;
        },
        color: (context) => {
          const value = context.dataset?.data?.[context.dataIndex];
          return getTextColor(value);
        },
        font: {
          weight: 'bold',
          size: 13,
        }
      }
    }
  }), []);

  const handleExportPDF = useCallback(async () => {
    if (!doughnutChartRef.current || !barChartRef.current || !dadosConsolidados) {
      console.error("Referências dos gráficos ou dados não estão prontos.");
      return;
    }

    const empresaNome = empresas.find(emp => emp.id.toString() === empresaSelecionada)?.razao_social || "Relatorio";
    const filename = `RTO_${empresaNome.replace(/[^a-zA-Z0-9]/g, '_')}_${anoSelecionado}.pdf`;

    const relatorioData = {
      dadosConsolidados,
      empresaNome,
      anoSelecionado,
      overallResult,
      logo
    };
    const chartConfig = {
      type: 'bar',
      data: chartData,
      options: exportChartOptions,
    };
    const chartRefs = {
      doughnutCanvas: doughnutChartRef.current.canvas,
      barCanvas: barChartRef.current.canvas,
      barChartConfig: chartConfig,
    };

    await exportToPDF(relatorioData, chartRefs, filename);
    
  }, [exportToPDF, empresaSelecionada, anoSelecionado, empresas, dadosConsolidados, overallResult, chartData, exportChartOptions]);

  return (
    <main className="rto-conteudo">
      <PageCabecalho title="RTO - Relatório Técnico Operacional" backTo="/" />
      <section className="rto-bloco-geral">
        <header className="rto-cabecalho-principal">
          <div className="rto-filtros destacado">
            <div className="rto-campo rto-campo-empresa">
              <label htmlFor="rto-empresa">Empresa:</label>
              <SelecionarEmpresa
                id="rto-empresa"
                empresas={empresas}
                value={empresaSelecionada}
                onChange={(empresa) => setEmpresaSelecionada(empresa ? String(empresa.id) : "")}
                ariaLabel="Empresa"
                placeholder="Buscar empresa..."
              />
            </div>
            <label>
              Ano:
              <select value={anoSelecionado} onChange={e => setAnoSelecionado(e.target.value)} disabled={!empresaSelecionada || anos.length === 0}>
                <option value="">Selecione</option>
                {anos.map(ano => (
                  <option key={ano} value={ano}>{ano}</option>
                ))}
              </select>
            </label>
          </div>
          <div className="rto-acoes-exportar">
            <button
              onClick={handleExportPDF}
              disabled={isExporting || !dadosConsolidados || dadosConsolidados.processos?.length === 0}
            >
              {isExporting ? <FaSpinner className="fa-spin" /> : <FaFilePdf />}
              {isExporting ? 'Gerando PDF...' : 'Exportar PDF'}
            </button>
          </div>
        </header>

        {exportError && <div className="rto-error-message">Erro ao exportar PDF: {exportError}</div>}

        {isLoading ? (
          <LoadingIndicator message={mensagemAviso || 'Carregando dados...'} fullHeight />
        ) : !dadosConsolidados ? (
          <p className="rto-status-message">{mensagemAviso || 'Selecione uma empresa e um ano para exibir os dados.'}</p>
        ) : dadosConsolidados.processos?.length === 0 ? (
          <p className="rto-status-message">{mensagemAviso || 'Não encontramos auditorias concluídas para esta empresa no ano selecionado.'}</p>
        ) : (
          <div id="rto-relatorio" className="rto-conteudo-relatorio">
            <div className="rto-pdf-header">
              <div className="rto-pdf-header-left">
                <img src={logo} alt="Logo" className="rto-pdf-logo" />
                <span>Consultech - Gestão de Cozinhas</span>
              </div>
              <div className="rto-pdf-header-center">
                <h2>{empresas.find(emp => emp.id.toString() === empresaSelecionada)?.razao_social} - {anoSelecionado}</h2>
              </div>
              <div className="rto-pdf-header-right"></div>
            </div>
            <div className="rto-tabela-scroll">
              <table className="rto-tabela">
                <thead>
                  <tr>
                    <th>Processos</th>
                    {dadosConsolidados.resultadosMensais.map((item, i) => <th key={i}>{item.mes}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {dadosConsolidados.processos.map((processo, index) => {
                    const ordem = processo.ordem_topico ?? (index + 1);
                    return (
                      <tr key={processo.id}>
                        <td>{`${ordem} - ${processo.nome_tema}`}</td>
                        {dadosConsolidados.resultadosMensais.map(item => {
                          const mesKey = item.mes.toLowerCase().substring(0, 3);
                          const valor = processo[mesKey];
                          return (
                            <td key={mesKey} style={{ backgroundColor: getBackgroundColor(valor), color: getTextColor(valor) }}>
                              {valor === null ? '-' : `${valor}%`}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="rto-accordion-mobile">
              {dadosConsolidados.processos.map((processo, index) => {                
                const ordem = processo.ordem_topico ?? (index + 1);
                return (
                  <Accordion
                    key={processo.id}
                    disableGutters
                    elevation={0}
                    square
                    className="rto-accordion-item"
                  >
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
                      className="rto-accordion-summary"
                    >
                      <span className="rto-accordion-title">{`${ordem} - ${processo.nome_tema}`}</span>
                    </AccordionSummary>
                    <AccordionDetails className="rto-accordion-details">
                      <div className="rto-accordion-meses">
                        {dadosConsolidados.resultadosMensais.map((item) => {
                          const mesKey = item.mes.toLowerCase().substring(0, 3);
                          const valor = processo[mesKey];
                          return (
                            <span
                              key={mesKey}
                              className="rto-accordion-mes"
                              style={{ backgroundColor: getBackgroundColor(valor), color: getTextColor(valor) }}
                            >
                              <small>{item.mes}</small>
                              <strong>{valor === null ? '-' : `${valor}%`}</strong>
                            </span>
                          );
                        })}
                      </div>
                    </AccordionDetails>
                  </Accordion>
                );
              })}
            </div>

            <div className="rto-graficos-wrapper">
              <div className="rto-anual-result-chart">
                <div className="rto-anual-header">
                  <h3>Resultado Anual</h3>
                  {getMascoteImage(overallResult) && (
                    <img
                      src={getMascoteImage(overallResult)}
                      alt="Mascote"
                      className="rto-mascote-header"
                    />
                  )}
                </div>
                <div className="resultado-anual-conteudo">
                  <div className="rto-mini-grafico-container">
                    {overallResult !== null ? (
                      <>
                        <Doughnut
                          ref={doughnutChartRef}
                          data={{
                            datasets: [{
                              data: [overallResult, 100 - overallResult],
                              backgroundColor: ['#660c39', '#e0e0e0'],
                              borderColor: ['#660c39', '#e0e0e0'],
                              borderWidth: 0,
                            }],
                          }}
                          options={{
                            cutout: '70%',
                            responsive: true,
                            maintainAspectRatio: false,
                            animation: false,
                            plugins: {
                              legend: { display: false },
                              tooltip: { enabled: false },
                              datalabels: { display: false }
                            }
                          }}
                        />
                        <div className="progress-text">{overallResult}%</div>
                      </>
                    ) : (
                      <div className="progress-text">N/A</div>
                    )}
                  </div>
                </div>
              </div>
              <div className="rto-bar-chart-container">
                <h3>Desempenho</h3>
                <div className="rto-bar-chart">
                  <Bar ref={barChartRef} data={chartData} options={chartOptions} /> 
                </div>
                <div className="rto-legenda-inline">
                  <strong>Legenda:</strong>
                  <div className="rto-legenda-item"><span className="rto-cor rto-verde"></span> Satisfatório (≥ 80%)</div>
                  <div className="rto-legenda-item"><span className="rto-cor rto-amarelo"></span> Risco (50% a 79%)</div>
                  <div className="rto-legenda-item"><span className="rto-cor rto-vermelho"></span> Crítico (≤ 49%)</div>
                  <div className="rto-legenda-item"><span className="rto-cor rto-cinza"></span> Inativo (-)</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    </main>
  );
};

export default ResumoRto;
