import React, { useEffect, useState, useCallback, useMemo } from "react";
import api from "../api/api";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { FaFilePdf, FaSpinner } from "react-icons/fa";
import PageCabecalho from "../components/Botoes/PageCabecalho";
import usePdfExport from "../hooks/usePdfExport";
import ChartDataLabels from 'chartjs-plugin-datalabels';

import "../styles/ResumoRto/index.css";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, ChartDataLabels);

const getTextColor = (value) => {
  if (value === null) return '#333';
  if (value >= 80) return '#fff';
  if (value >= 50) return '#333';
  return '#fff';
};

const getBackgroundColor = (value) => {
  if (value === null) return '#999';
  if (value >= 80) return '#1ca41c';
  if (value >= 50) return '#f2c037';
  return '#dc3545';
};

const getChartColor = (value) => {
  if (value === null) return '#999';
  if (value >= 80) return '#1ca41c';
  if (value >= 50) return '#f2c037';
  return '#dc3545';
};

const ResumoRto = () => {
  const [empresas, setEmpresas] = useState([]);
  const [anos, setAnos] = useState([]);
  const [empresaSelecionada, setEmpresaSelecionada] = useState("");
  const [anoSelecionado, setAnoSelecionado] = useState("");
  const [dadosConsolidados, setDadosConsolidados] = useState(null);
  const [loading, setLoading] = useState({ empresas: false, anos: false, dashboard: false });
  const { exportToPDF, isExporting, exportError } = usePdfExport();

  const isLoading = loading.empresas || loading.anos || loading.dashboard;

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
      return;
    }
    const fetchAnos = async () => {
      setLoading(prev => ({ ...prev, anos: true }));
      setAnoSelecionado("");
      try {
        const res = await api.get(`/auditorias/data-auditoria/${empresaSelecionada}`);
        const anosDisponiveis = res.data.map(item => item.ano).sort();
        setAnos(anosDisponiveis);
      } catch (err) {
        console.error("Erro ao buscar anos da auditoria:", err);
        setAnos([]);
      } finally {
        setLoading(prev => ({ ...prev, anos: false }));
      }
    };
    fetchAnos();
  }, [empresaSelecionada]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!empresaSelecionada || !anoSelecionado) {
        setDadosConsolidados(null);
        return;
      }
      setLoading(prev => ({ ...prev, dashboard: true }));
      try {
        const res = await api.get(`/auditorias/listar-dashboard`, {
          params: { clienteId: empresaSelecionada, ano: anoSelecionado }
        });
        setDadosConsolidados(res.data);
        
      } catch (err) {
        console.error("Erro ao buscar dados do dashboard:", err);
        setDadosConsolidados(null);
      } finally {
        setLoading(prev => ({ ...prev, dashboard: false }));
      }
    };
    fetchDashboardData();
  }, [empresaSelecionada, anoSelecionado]);

  const overallResult = useMemo(() => {
    if (!dadosConsolidados) return null;
    const validResults = dadosConsolidados.resultadosMensais
      .map(r => r.resultado)
      .filter(r => typeof r === 'number');

    if (validResults.length === 0) return null;
    const sum = validResults.reduce((acc, curr) => acc + curr, 0);
    return Math.round(sum / validResults.length);
  }, [dadosConsolidados]);

  const handleExportPDF = useCallback(async () => {
    const empresaNome = empresas.find(emp => emp.id.toString() === empresaSelecionada)?.razao_social || "Relatorio";
    const filename = `RTO_${empresaNome.replace(/[^a-zA-Z0-9]/g, '_')}_${anoSelecionado}.pdf`;
    await exportToPDF('rto-relatorio', filename);
  }, [exportToPDF, empresaSelecionada, anoSelecionado, empresas]);

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
    scales: {
      y: { beginAtZero: true, max: 100, title: { display: true, text: 'Porcentagem (%)' } },
      x: { title: { display: true, text: 'Mês' } }
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
          size: 13,
        }
      }
    }
  }), []);

  return (
    <main className="rto-conteudo">
      <PageCabecalho title="RTO - Relatório Técnico Operacional" backTo="/" />
      <section className="rto-bloco-geral">
        <header className="rto-cabecalho-principal">
          <div className="rto-filtros destacado">
            <label>
              Empresa:
              <select value={empresaSelecionada} onChange={e => setEmpresaSelecionada(e.target.value)}>
                <option value="">Selecione</option>
                {empresas.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.razao_social}</option>
                ))}
              </select>
            </label>
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
            <button onClick={handleExportPDF} disabled={isExporting || !dadosConsolidados}>
              {isExporting ? <FaSpinner className="fa-spin" /> : <FaFilePdf />}
              {isExporting ? 'Gerando PDF...' : 'Exportar PDF'}
            </button>
          </div>
        </header>

        {exportError && <div className="rto-error-message">Erro ao exportar PDF: {exportError}</div>}

        {isLoading ? (
          <p className="rto-status-message">Carregando dados...</p>
        ) : !dadosConsolidados ? (
          <p className="rto-status-message">Selecione uma empresa e um ano para exibir os dados.</p>
        ) : (
          <div id="rto-relatorio">
            <div className="rto-pdf-header">
              <h2>{empresas.find(emp => emp.id.toString() === empresaSelecionada)?.razao_social} - {anoSelecionado}</h2>
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
                  {dadosConsolidados.processos.map((processo) => (
                    <tr key={processo.id}>
                      <td>{processo.nome_tema}</td>
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
                  ))}
                </tbody>
              </table>
            </div>

            <div className="rto-graficos-wrapper">
              <div className="rto-anual-result-chart">
                <h3>Resultado Anual</h3>
                <div className="resultado-anual-conteudo">
                  <div className="rto-mini-grafico-container">
                    {overallResult !== null ? (
                      <>
                        <Doughnut
                          data={{
                            datasets: [{
                              data: [overallResult, 100 - overallResult],
                              backgroundColor: ['#580f34', '#e0e0e0'],
                              borderColor: ['#580f34', '#e0e0e0'],
                              borderWidth: 0,
                            }],
                          }}
                          options={{
                            cutout: '70%',
                            responsive: true,
                            maintainAspectRatio: false,
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
                <div className="rto-bar-chart">
                  <Bar data={chartData} options={chartOptions} />
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