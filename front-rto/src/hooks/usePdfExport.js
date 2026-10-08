import { useState, useCallback } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Chart as ChartJS } from "chart.js/auto";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { getBackgroundColor, getTextColor, getMascoteImage } from "../utils/classificacao";

ChartJS.register(ChartDataLabels);

const toDataURL = (url) => {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.onload = function () {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(xhr.response);
        };
        xhr.onerror = reject;
        xhr.open('GET', url);
        xhr.responseType = 'blob';
        xhr.send();
    });
};

const usePdfExport = () => {
    const [isExporting, setIsExporting] = useState(false);
    const [exportError, setExportError] = useState(null);

    const exportToPDF = useCallback(async (relatorioData, chartRefs, filename = "relatorio.pdf") => {
        setIsExporting(true);
        setExportError(null);

        const { dadosConsolidados, empresaNome, anoSelecionado, overallResult, logo } = relatorioData;
        const { doughnutCanvas, barCanvas, barChartConfig } = chartRefs;

        if (!dadosConsolidados || !doughnutCanvas || !barCanvas) {
            setExportError("Dados ou referências dos gráficos ausentes.");
            setIsExporting(false);
            return;
        }

        const createNormalizedBarChart = (desiredRatio) => {
            if (!barChartConfig?.data) return null;

            const canvas = document.createElement('canvas');
            let targetWidth = 1800;
            let targetHeight = desiredRatio ? Math.max(200, Math.round(1800 / desiredRatio)) : 1200;

            const ratio = 1;
            canvas.width = Math.round(targetWidth * ratio);
            canvas.height = Math.round(targetHeight * ratio);
            canvas.style.width = `${targetWidth}px`;
            canvas.style.height = `${targetHeight}px`;

            const context = canvas.getContext('2d');
            if (!context) return null;

            context.setTransform(ratio, 0, 0, ratio, 0, 0);

            const normalizeAxis = (axisOptions = {}) => ({
                ...axisOptions,
                ticks: {
                    ...(axisOptions.ticks || {}),
                    font: { size: 20, weight: '700' },
                    color: '#333333'
                },
                title: axisOptions.title
                    ? { ...axisOptions.title, display: true, font: { size: 24, weight: '800' }, color: '#333333' }
                    : undefined
            });

            const normalizedOptions = {
                ...(barChartConfig.options || {}),
                responsive: false,
                animation: false,
                maintainAspectRatio: false,
                layout: { padding: 20 },
                plugins: {
                    legend: { display: false },
                    datalabels: {
                        display: true,
                        anchor: 'end',
                        align: 'top',
                        font: { size: 22, weight: '700' },
                        color: '#333333',
                        formatter: v => (v == null ? '' : `${v}%`)
                    },
                    tooltip: {
                        enabled: true,
                        bodyFont: { size: 14 },
                        titleFont: { size: 16 },
                        padding: 10
                    }
                },
                scales: {
                    x: normalizeAxis(barChartConfig.options?.scales?.x),
                    y: {
                        ...normalizeAxis(barChartConfig.options?.scales?.y),
                        min: 0,
                        max: 100,
                        ticks: {
                            callback: v => `${v}%`,
                            font: { size: 22, weight: '700' },
                            color: '#333333'
                        }
                    }
                }
            };

            try {
                const clonedData = JSON.parse(JSON.stringify(barChartConfig.data));
                clonedData?.datasets?.forEach(ds => ds.label = '');

                const config = { type: barChartConfig.type || 'bar', data: clonedData, options: normalizedOptions };
                const chartInstance = new ChartJS(context, config);

                const image = canvas.toDataURL('image/png', 1.0);
                chartInstance.destroy();

                return { image, width: targetWidth, height: targetHeight };
            } catch {
                return null;
            }
        };

        try {
            const doc = new jsPDF('l', 'mm', 'a3');
            const margin = 4;
            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();

            doc.setTextColor(0, 0, 0);

            const headerY = 20;

            const logoDataUrl = await toDataURL(logo);

            doc.addImage(logoDataUrl, 'PNG', margin, headerY - 6, 15, 12);
            doc.setFont("helvetica", "bold");

            doc.setFontSize(12);
            doc.text("Consultech - Relatório Técnico Operacional", margin + 20, headerY, { baseline: 'middle' });

            doc.setFontSize(14);
            const safeEmpresaNome = empresaNome.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            const titleCenter = `${safeEmpresaNome} - ${anoSelecionado}`;
            doc.text(titleCenter, pageWidth / 2, headerY, { align: 'center', baseline: 'middle' });

            const head = [['Processos', ...dadosConsolidados.resultadosMensais.map(m => m.mes)]];
            const body = dadosConsolidados.processos.map((processo, index) => {
                const ordem = processo.ordem_topico ?? (index + 1);
                const nome = processo.nome_tema.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                const row = [`${ordem} - ${nome}`];

                dadosConsolidados.resultadosMensais.forEach(item => {
                    const valor = processo[item.mes.toLowerCase().slice(0, 3)];
                    row.push(valor == null ? '-' : `${valor}%`);
                });

                return row;
            });

            const numCols = head[0].length;
            const tableWidth = pageWidth - margin * 2;
            const col1 = Math.max(40, Math.min(Math.round(tableWidth * 0.45), Math.round(tableWidth * 0.7)));
            const colRest = (tableWidth - col1) / (numCols - 1);

            const columnStyles = { 0: { halign: 'left', cellWidth: col1 } };
            for (let i = 1; i < numCols; i++) columnStyles[i] = { cellWidth: colRest };

            autoTable(doc, {
                head,
                body,
                startY: headerY + 20,
                theme: 'grid',
                margin: { left: margin, right: margin },
                headStyles: {
                    fillColor: '#660c39',
                    textColor: '#ffffff',
                    fontStyle: 'bold',
                    halign: 'center'
                },
                styles: { halign: 'center', fontSize: 10, cellPadding: 2 },
                columnStyles,
                willDrawCell: (data) => {
                    if (data.row.section === 'body' && data.column.index > 0) {
                        const processo = dadosConsolidados.processos[data.row.index];
                        const mes = dadosConsolidados.resultadosMensais[data.column.index - 1];
                        const valor = processo[mes.mes.toLowerCase().slice(0, 3)];

                        doc.setFillColor(getBackgroundColor(valor));
                        doc.setTextColor(getTextColor(valor));
                        doc.setFont("helvetica", "bold");
                        doc.setFontSize(10);
                    }
                }
            });

            let chartY = doc.lastAutoTable.finalY + 12;
            const usableHeight = pageHeight - chartY - margin;

            const chartGap = 10;
            const totalWidth = pageWidth - margin * 2;
            const doughnutW = totalWidth * 0.4;
            const barW = totalWidth * 0.6 - chartGap;

            const cardPadding = 8;
            const cardRadius = 4;
            const cardHeight = usableHeight;

            const drawCardWithShadow = (x, y, width, height) => {
                const shadowOffset = 1.2;

                doc.setFillColor(210, 210, 210);
                doc.roundedRect(
                    x + shadowOffset,
                    y + shadowOffset,
                    width,
                    height,
                    cardRadius,
                    cardRadius,
                    'F'
                );

                doc.setFillColor(255, 255, 255);
                doc.setDrawColor(206, 206, 206);
                doc.setLineWidth(0.10);
                doc.roundedRect(x, y, width, height, cardRadius, cardRadius, 'FD');
            };

            drawCardWithShadow(margin, chartY, doughnutW, cardHeight);
            
            drawCardWithShadow(margin + doughnutW + chartGap, chartY, barW, cardHeight);

            doc.setFontSize(16);
            doc.setTextColor('#660c39');

            const titleY = chartY + cardPadding + 4;
            doc.text("Resultado Anual", margin + doughnutW / 2, titleY, { align: 'center' });
            doc.text("Desempenho", margin + doughnutW + chartGap + barW / 2, titleY, { align: 'center' });

            chartY += cardPadding + 10;

            const mascoteImagePath = getMascoteImage(overallResult, window.location.origin);
            if (mascoteImagePath) {
                try {
                    const mascoteDataUrl = await toDataURL(mascoteImagePath);
                    const mascoteSize = 30;
                    const mascoteX = margin + doughnutW - mascoteSize - 5;
                    const mascoteY = chartY - cardPadding - 6;
                    doc.addImage(mascoteDataUrl, "PNG", mascoteX, mascoteY, mascoteSize, mascoteSize);
                } catch (err) {
                    console.warn("Erro ao adicionar mascote ao PDF:", err);
                }
            }

            const doughnutImg = doughnutCanvas.toDataURL("image/png", 1.0);
            const innerCardHeight = cardHeight - cardPadding * 2 - 14; // Espaço disponível dentro do card
            const doughnutSize = Math.min(Math.max(innerCardHeight - 10, 40), (doughnutW - cardPadding * 2) * 0.85);
            const doughnutX = margin + doughnutW / 2 - doughnutSize / 2;

            doc.addImage(doughnutImg, "PNG", doughnutX, chartY, doughnutSize, doughnutSize);

            doc.setFontSize(32);
            doc.text(
                overallResult != null ? `${overallResult}%` : "N/A",
                doughnutX + doughnutSize / 2,
                chartY + doughnutSize / 2,
                { align: "center", baseline: "middle" }
            );

            const barH = innerCardHeight - 14;
            const barInnerW = barW - cardPadding * 2;
            const ratio = barInnerW / barH;

            const barChart = createNormalizedBarChart(ratio) || {
                image: barCanvas.toDataURL('image/png'),
                width: barCanvas.width,
                height: barCanvas.height
            };

            const barX = margin + doughnutW + chartGap + cardPadding;

            doc.addImage(barChart.image, "PNG", barX, chartY, barInnerW, barH);

            const legendY = chartY + barH + 3;

            if (legendY + 10 < pageHeight - margin) {
                const legendData = [
                    { color: '#1ca41c', text: 'Satisfatorio (>= 80%)' },
                    { color: '#f2c037', text: 'Risco (50% a 79%)' },
                    { color: '#dc3545', text: 'Critico (<= 49%)' },
                    { color: '#999999', text: 'Inativo (-)' },
                ];

                doc.setFontSize(8);
                doc.setTextColor('#333333');

                const spacing = 15;
                const total = legendData.reduce((sum, l) => sum + 4 + doc.getTextWidth(l.text) + spacing, 0) - spacing;
                let posX = barX + barInnerW / 2 - total / 2;

                legendData.forEach(item => {
                    doc.setFillColor(item.color);
                    doc.rect(posX, legendY, 3, 3, "F");
                    doc.text(item.text, posX + 5, legendY + 2);
                    posX += doc.getTextWidth(item.text) + spacing;
                });
            }

            doc.save(filename);

        } catch (err) {
            setExportError(err.message);
        } finally {
            setIsExporting(false);
        }

    }, []);

    return { exportToPDF, isExporting, exportError };
};

export default usePdfExport;
