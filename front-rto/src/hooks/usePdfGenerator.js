import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const PDF_IMAGE_MAX_DIMENSION = 1280;
const PDF_IMAGE_QUALITY = 0.62;

const sanitizePdfText = (value) => {
  if (typeof value !== 'string') return value || '';
  return value
    .replace(/\u2070/g, '°')
    .replace(/\u00B0/g, '°')
    .replace(/\u02DA/g, '°');
};

const softWrapPdfText = (value) => {
  if (typeof value !== 'string' || !value) return value || '';
  const withHints = value.replace(/[/_-]/g, (m) => `${m} `);
  return withHints.replace(/\S{35,}/g, (token) => token.replace(/(.{25})/g, '$1 '));
};

export const usePdfGenerator = () => {
  const resolveFotoUrl = (rawUrl) => {
    if (!rawUrl || typeof rawUrl !== 'string') {
      return null;
    }
    if (/^https?:\/\//i.test(rawUrl)) {
      return rawUrl;
    }
    const baseUrl = import.meta.env.VITE_API_URL;
    if (!baseUrl) {
      return rawUrl;
    }
    const normalizedBase = baseUrl.replace(/\/+$/, '');
    const normalizedPath = rawUrl.startsWith('/') ? rawUrl : `/${rawUrl}`;
    return `${normalizedBase}${normalizedPath}`;
  };

  const loadImageDimensions = (src) => new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve({ img, width: img.naturalWidth || img.width, height: img.naturalHeight || img.height });
    img.onerror = () => resolve(null);
    img.src = src;
  });

  const loadBitmapWithOrientation = async (blob) => {
    if (typeof createImageBitmap !== 'function') {
      return null;
    }

    try {
      return await createImageBitmap(blob, { imageOrientation: 'from-image' });
    } catch {
      return null;
    }
  };

  const toPdfImageData = async (url) => {
    if (!url) return null;
    try {
      const response = await fetch(url, { mode: 'cors' });
      if (!response.ok) throw new Error('Falha ao baixar imagem');
      const blob = await response.blob();

      const orientedBitmap = await loadBitmapWithOrientation(blob);
      if (orientedBitmap) {
        const width = orientedBitmap.width;
        const height = orientedBitmap.height;
        const scale = Math.min(PDF_IMAGE_MAX_DIMENSION / width, PDF_IMAGE_MAX_DIMENSION / height, 1);
        const targetWidth = Math.max(1, Math.round(width * scale));
        const targetHeight = Math.max(1, Math.round(height * scale));

        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;

        const context = canvas.getContext('2d', { alpha: false });
        if (!context) {
          orientedBitmap.close();
          return null;
        }

        context.fillStyle = '#ffffff';
        context.fillRect(0, 0, targetWidth, targetHeight);
        context.drawImage(orientedBitmap, 0, 0, targetWidth, targetHeight);
        orientedBitmap.close();

        const dataUrl = canvas.toDataURL('image/jpeg', PDF_IMAGE_QUALITY);
        return { dataUrl, width: targetWidth, height: targetHeight, format: 'JPEG' };
      }

      const objectUrl = URL.createObjectURL(blob);

      try {
        const imageInfo = await loadImageDimensions(objectUrl);
        if (!imageInfo) return null;

        const { img, width, height } = imageInfo;
        const scale = Math.min(PDF_IMAGE_MAX_DIMENSION / width, PDF_IMAGE_MAX_DIMENSION / height, 1);
        const targetWidth = Math.max(1, Math.round(width * scale));
        const targetHeight = Math.max(1, Math.round(height * scale));

        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;

        const context = canvas.getContext('2d', { alpha: false });
        if (!context) {
          return null;
        }

        context.fillStyle = '#ffffff';
        context.fillRect(0, 0, targetWidth, targetHeight);
        context.drawImage(img, 0, 0, targetWidth, targetHeight);

        const dataUrl = canvas.toDataURL('image/jpeg', PDF_IMAGE_QUALITY);
        return { dataUrl, width: targetWidth, height: targetHeight, format: 'JPEG' };
      } finally {
        URL.revokeObjectURL(objectUrl);
      }
    } catch (error) {
      console.error('Erro ao preparar imagem para PDF:', error);
      return null;
    }
  };

  const generatePdf = async (topicos, respostas, empresaInfo, auditoriaInfo, fotos, comentario) => {
    const doc = new jsPDF({ compress: true });
    let yOffset = 10;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;

    yOffset += 8;
    doc.setFontSize(16);
    doc.text("CONSULTECH", pageWidth / 2, yOffset, { align: "center" });
    yOffset += 8;

    if (empresaInfo) {
      doc.setFontSize(10);
      doc.text(`Empresa: ${empresaInfo.razao_social}`, pageWidth / 2, yOffset, { align: "center" });
      yOffset += 4;
      if (empresaInfo.cnpj) {
        doc.setFontSize(10)
        doc.text(`CNPJ: ${empresaInfo.cnpj}`, pageWidth / 2, yOffset, { align: "center" });
        yOffset += 4;
      }
      if (auditoriaInfo.auditorResponsavel) {
        doc.setFontSize(10);
        doc.text(`Auditor: ${auditoriaInfo.auditorResponsavel}`, pageWidth / 2, yOffset, { align: "center" });
        yOffset += 4;
      }
    }

    const dataAtual = new Date().toLocaleString();
    const dataAuditoria = new Date(auditoriaInfo.dt_auditoria)
      .toLocaleDateString('pt-BR', {
        timeZone: 'UTC'
      });

    doc.setFontSize(10);
    doc.text(`Gerado em: ${dataAtual}`, pageWidth / 2, yOffset, { align: "center" });
    yOffset += 8;

    if (auditoriaInfo.observacao || auditoriaInfo.dt_auditoria) {
      doc.setFontSize(10);

      if (auditoriaInfo.observacao) {
        doc.text(`Observação Geral: ${auditoriaInfo.observacao}`, margin, yOffset, { align: "left" });
      }

      if (auditoriaInfo.dt_auditoria) {
        const rightEdge = pageWidth - margin;
        doc.text(`Auditado em: ${dataAuditoria}`, rightEdge, yOffset, { align: "right" });
      }

      yOffset += 7;
    }

    const toOrdemTopicoNumber = (value) => {
      if (value == null) return null;
      const n = Number(value);
      return Number.isFinite(n) ? n : null;
    };

    const topicosOrdenados = Array.isArray(topicos)
      ? [...topicos].sort((a, b) => {
        const ordemA = toOrdemTopicoNumber(a?.ordem_topico);
        const ordemB = toOrdemTopicoNumber(b?.ordem_topico);

        if (ordemA == null && ordemB == null) {
          const nomeA = String(a?.nome_tema || '');
          const nomeB = String(b?.nome_tema || '');
          return nomeA.localeCompare(nomeB, 'pt-BR');
        }
        if (ordemA == null) return 1;
        if (ordemB == null) return -1;
        if (ordemA !== ordemB) return ordemA - ordemB;

        const nomeA = String(a?.nome_tema || '');
        const nomeB = String(b?.nome_tema || '');
        return nomeA.localeCompare(nomeB, 'pt-BR');
      })
      : [];

    let somaPercentuais = 0;
    let topicosComRespostas = 0;
    topicosOrdenados.forEach(topico => {
      const perguntasDoTopico = topico.perguntas || [];
      const respostasValidas = perguntasDoTopico.filter(p => {
        const resposta = respostas[p.id];
        return resposta === 'CF' || resposta === 'PC' || resposta === 'NC';
      });
      if (respostasValidas.length > 0) {
        const conformes = respostasValidas.filter(p => respostas[p.id] === 'CF').length;
        const conformidadeParcial = respostasValidas.filter(p => respostas[p.id] === 'PC').length;
        const pontuacaoTotal = conformes + (conformidadeParcial * 0.5);
        const percentual = Math.round((pontuacaoTotal / respostasValidas.length) * 100);
        somaPercentuais += percentual;
        topicosComRespostas++;
      }
    });

    const resultadoGeral = topicosComRespostas > 0 ? Math.round(somaPercentuais / topicosComRespostas) : 0;
    let corFundo = [255, 0, 0];
    if (resultadoGeral >= 80) corFundo = [0, 176, 80];
    else if (resultadoGeral >= 50) corFundo = [255, 255, 0];

    doc.setFillColor(...corFundo);
    doc.rect(margin, yOffset, pageWidth - (margin * 2), 10, "F");
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.text(`Resultado Geral: ${resultadoGeral}%`, pageWidth / 2, yOffset + 7, { align: "center" });
    yOffset += 20;

    for (let tIndex = 0; tIndex < topicosOrdenados.length; tIndex++) {
      const topico = topicosOrdenados[tIndex];
      if (tIndex > 0) {
        doc.addPage();
        yOffset = margin;
      }

      const ordemTopico = toOrdemTopicoNumber(topico.ordem_topico) ?? (tIndex + 1);

      doc.setFontSize(14);
      const temaTexto = doc.splitTextToSize(
        `${ordemTopico} - ${sanitizePdfText(topico.nome_tema)}`,
        pageWidth - margin * 2
      );
      doc.text(temaTexto, margin, yOffset);
      yOffset += temaTexto.length * 7;

      doc.setFontSize(11);
      const requisitoTexto = doc.splitTextToSize(
        sanitizePdfText(`${topico.requisitos}`),
        pageWidth - margin * 2
      );
      doc.text(requisitoTexto, margin, yOffset);
      yOffset += requisitoTexto.length * 6;

      const perguntasDoTopico = topico.perguntas || [];
      const respostasValidas = perguntasDoTopico.filter(p => {
        const resposta = respostas[p.id];
        return resposta === 'CF' || resposta === 'PC' || resposta === 'NC';
      });

      if (respostasValidas.length > 0) {
        const conformes = respostasValidas.filter(p => respostas[p.id] === 'CF').length;
        const conformidadeParcial = respostasValidas.filter(p => respostas[p.id] === 'PC').length;
        const pontuacaoTotal = conformes + (conformidadeParcial * 0.5);
        const percentual = Math.round((pontuacaoTotal / respostasValidas.length) * 100);
        let classificacao = '';
        let cor = [255, 0, 0];
        if (percentual >= 80) {
          classificacao = 'Processos Satisfatórios';
          cor = [0, 176, 80];
        } else if (percentual >= 50) {
          classificacao = 'Processos que podem gerar riscos';
          cor = [255, 255, 0];
        } else {
          classificacao = 'Processos Inaceitáveis';
          cor = [255, 0, 0];
        }
        doc.setFontSize(11);
        doc.setFillColor(...cor);
        doc.rect(margin, yOffset, 80, 6, "F");
        doc.setTextColor(0, 0, 0);
        doc.text(`${classificacao} (${percentual}%)`, margin + 2, yOffset + 4);
        yOffset += 10;
      }

      const tableWidth = pageWidth - margin * 2;
      const safeTableWidth = Math.max(tableWidth - 2, 80);
      const numeroColumnWidth = 10;
      const respostaColumnWidth = 45;
      const perguntaColumnWidth = Math.max(safeTableWidth - numeroColumnWidth - respostaColumnWidth, 60);

      const tableData = perguntasDoTopico.map(p => {
        const respostaTexto = respostas[p.id] === 'CF' ? 'Conforme'
          : respostas[p.id] == 'PC' ? 'Conformidade Parcial'
            : respostas[p.id] === 'NC' ? 'Não Conforme'
              : respostas[p.id] === 'NE' ? 'Não Existe'
                : 'Não Respondido';
        const comentarioDaPergunta = comentario[p.id] ? `\n(Obs: ${comentario[p.id]})` : '';
        const perguntaFormatada = doc.splitTextToSize(
          softWrapPdfText(sanitizePdfText(p.descricao_pergunta || '')),
          perguntaColumnWidth
        );
        const respostaFormatada = doc.splitTextToSize(
          softWrapPdfText(sanitizePdfText(`${respostaTexto}${comentarioDaPergunta}`)),
          respostaColumnWidth
        );
        return [p.ordem_pergunta, perguntaFormatada, respostaFormatada];
      });

      autoTable(doc, {
        head: [["#", "Pergunta", "Resposta"]],
        body: tableData,
        startY: yOffset,
        margin: { left: margin, right: margin },
        tableWidth: safeTableWidth,
        styles: {
          fontSize: 9,
          cellPadding: 1.5,
          textColor: [0, 0, 0],
          overflow: 'linebreak',
          cellWidth: 'wrap',
        },
        headStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], lineWidth: 0.3, lineColor: [200, 200, 200] },
        bodyStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], lineWidth: 0.2, lineColor: [220, 220, 220] },
        columnStyles: {
          0: { cellWidth: numeroColumnWidth, halign: 'center' },
          1: { cellWidth: perguntaColumnWidth },
          2: { cellWidth: respostaColumnWidth },
        },
      });
      yOffset = doc.lastAutoTable.finalY + 5;

      const fotosDoTopico = perguntasDoTopico.flatMap(p => {
        return (fotos[p.id.toString()] || []).map(fotoUrl => ({
          ordem: p.ordem_pergunta,
          url: fotoUrl
        }));
      });

      if (fotosDoTopico.length > 0) {
        const boxWidth = (pageWidth - (margin * 3)) / 2;
        const boxHeight = Math.min(90, (pageHeight - margin * 2) / 3);
        let rowMaxHeight = 0;

        if (yOffset + boxHeight + 20 > pageHeight - margin) {
          doc.addPage();
          yOffset = margin;
        }

        doc.setFontSize(10);
        doc.text(`Evidências`, margin, yOffset);
        yOffset += 5;

        for (let i = 0; i < fotosDoTopico.length; i++) {
          const foto = fotosDoTopico[i];
          const xPos = margin + (i % 2 === 1 ? boxWidth + margin : 0);
          const fotoUrl = resolveFotoUrl(foto.url);

          if (i % 2 === 0) {
            if (yOffset + boxHeight + 12 > pageHeight - margin) {
              doc.addPage();
              yOffset = margin;
            }
            rowMaxHeight = 0;
          }

          doc.setFontSize(8);
          doc.text(`Pergunta ${foto.ordem}`, xPos, yOffset);

          if (fotoUrl) {
            const imageData = await toPdfImageData(fotoUrl);
            if (imageData) {
              const { dataUrl, width, height, format } = imageData;
              const scale = Math.min(boxWidth / width, boxHeight / height, 1);
              const finalW = width * scale;
              const finalH = height * scale;
              const imgX = xPos + (boxWidth - finalW) / 2;
              const imgY = yOffset + 3;

              doc.addImage(dataUrl, format, imgX, imgY, finalW, finalH, undefined, 'MEDIUM');
              rowMaxHeight = Math.max(rowMaxHeight, finalH);
            } else {
              doc.text('Falha ao carregar imagem', xPos, yOffset + 10);
              rowMaxHeight = Math.max(rowMaxHeight, boxHeight * 0.5);
            }
          } else {
            doc.text('URL inválida', xPos, yOffset + 10);
            rowMaxHeight = Math.max(rowMaxHeight, boxHeight * 0.5);
          }

          if (i % 2 === 1) {
            yOffset += rowMaxHeight + 10;
          }
        }

        if (fotosDoTopico.length % 2 !== 0) {
          yOffset += rowMaxHeight + 10;
        }
      }
    }

    const finalY = pageHeight - 20;
    doc.setFontSize(8);
    doc.setTextColor(0, 0, 0);
    doc.text("__________________________________", pageWidth / 2, finalY, { align: "center" });
    doc.text("Assinatura do Auditor", pageWidth / 2, finalY + 5, { align: "center" });

    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    if (isSafari) {
      doc.save(`auditoria-${empresaInfo.razao_social}.pdf`);
    } else {
      const blob = doc.output("blob");
      const blobUrl = URL.createObjectURL(blob);
      window.open(blobUrl, "_blank");
    }
  };
  return { generatePdf };
};
