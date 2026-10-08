import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import logoUrl from "../assets/logo.png";
import {
  calcularPercentualTopico,
  nivelDoPercentual,
  NIVEL_SATISFATORIO,
  NIVEL_RISCO,
  NIVEL_INACEITAVEL,
} from "../utils/classificacao";

const PDF_IMAGE_MAX_DIMENSION = 1280;
const PDF_IMAGE_QUALITY = 0.62;
const LOGO_MAX_WIDTH = 800;

const COR_MARCA = [102, 12, 57];
const COR_MARCA_SUAVE = [140, 52, 90];
const COR_DESTAQUE = [245, 121, 92];
const COR_TEXTO = [33, 37, 41];
const COR_TEXTO_SUAVE = [108, 117, 125];
const COR_BORDA = [222, 214, 218];
const COR_FUNDO_SUAVE = [247, 243, 245];

const CLASSE_SATISFATORIA = { rotulo: 'Processos Satisfatórios', fundo: [220, 242, 229], barra: [34, 154, 84], texto: [20, 83, 45] };
const CLASSE_RISCO = { rotulo: 'Processos que podem gerar riscos', fundo: [254, 243, 199], barra: [217, 160, 20], texto: [120, 53, 15] };
const CLASSE_INACEITAVEL = { rotulo: 'Processos Inaceitáveis', fundo: [254, 226, 226], barra: [200, 50, 50], texto: [127, 29, 29] };
const CLASSE_SEM_DADOS = { rotulo: 'Sem respostas', fundo: [238, 238, 240], barra: [150, 150, 158], texto: [90, 90, 98] };

const CLASSE_POR_NIVEL = {
  [NIVEL_SATISFATORIO]: CLASSE_SATISFATORIA,
  [NIVEL_RISCO]: CLASSE_RISCO,
  [NIVEL_INACEITAVEL]: CLASSE_INACEITAVEL,
};

const classificar = (percentual) => CLASSE_POR_NIVEL[nivelDoPercentual(percentual)] || CLASSE_SEM_DADOS;

const STATUS_RESPOSTA = {
  CF: { rotulo: 'Conforme', fundo: CLASSE_SATISFATORIA.fundo, texto: CLASSE_SATISFATORIA.texto },
  PC: { rotulo: 'Conformidade Parcial', fundo: CLASSE_RISCO.fundo, texto: CLASSE_RISCO.texto },
  NC: { rotulo: 'Não Conforme', fundo: CLASSE_INACEITAVEL.fundo, texto: CLASSE_INACEITAVEL.texto },
  NE: { rotulo: 'Não Existe', fundo: [238, 238, 240], texto: [90, 90, 98] },
  default: { rotulo: 'Não Respondido', fundo: [255, 255, 255], texto: [150, 150, 158] },
};

const sanitizePdfText = (value) => {
  if (typeof value !== 'string') return value || '';
  return value
    .replace(/⁰/g, '°')
    .replace(/°/g, '°')
    .replace(/˚/g, '°');
};

// Só insere espaços em "palavras" gigantes (ex.: URLs) para o autoTable conseguir quebrá-las.
const softWrapPdfText = (value) => {
  if (typeof value !== 'string' || !value) return value || '';
  return value.replace(/\S{35,}/g, (token) => token.replace(/(.{25})/g, '$1 '));
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

  const loadLogoData = async () => {
    try {
      const response = await fetch(logoUrl);
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      try {
        const imageInfo = await loadImageDimensions(objectUrl);
        if (!imageInfo) return null;
        const { img, width, height } = imageInfo;
        const scale = Math.min(LOGO_MAX_WIDTH / width, 1);
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(width * scale);
        canvas.height = Math.round(height * scale);
        const context = canvas.getContext('2d');
        if (!context) return null;
        context.drawImage(img, 0, 0, canvas.width, canvas.height);
        return { dataUrl: canvas.toDataURL('image/png'), ratio: width / height };
      } finally {
        URL.revokeObjectURL(objectUrl);
      }
    } catch (error) {
      console.error('Erro ao carregar logo para PDF:', error);
      return null;
    }
  };

  const generatePdf = async (topicos, respostas, empresaInfo, auditoriaInfo, fotos, comentario) => {
    const doc = new jsPDF({ compress: true });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    const contentWidth = pageWidth - margin * 2;
    const topY = 26;
    const contentBottom = pageHeight - 18;
    let yOffset = 0;

    const logo = await loadLogoData();
    const nomeEmpresa = sanitizePdfText(empresaInfo?.razao_social || '');
    const textoOuTraco = (valor) => (valor ? sanitizePdfText(String(valor)) : '—');

    const dataImpressao = new Date().toLocaleString('pt-BR');
    const dataAuditoria = auditoriaInfo?.dt_auditoria
      ? new Date(auditoriaInfo.dt_auditoria).toLocaleDateString('pt-BR', { timeZone: 'UTC' })
      : '—';

    const drawLogo = (x, y, height) => {
      if (!logo) return;
      doc.addImage(logo.dataUrl, 'PNG', x, y, height * logo.ratio, height);
    };

    const novaPagina = () => {
      doc.addPage();
      yOffset = topY;
    };

    // ---- Cabeçalho da primeira página ----
    doc.setFillColor(...COR_MARCA);
    doc.rect(0, 0, pageWidth, 38, 'F');
    doc.setFillColor(...COR_DESTAQUE);
    doc.rect(0, 38, pageWidth, 1.5, 'F');
    drawLogo(margin, 9, 20);

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.text('RELATÓRIO DE AUDITORIA RTO', pageWidth - margin, 18, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('Responsabilidade Técnica Operacional', pageWidth - margin, 24, { align: 'right' });
    doc.text(`Auditoria nº ${auditoriaInfo?.id ?? '—'}`, pageWidth - margin, 29, { align: 'right' });

    yOffset = 48;

    // ---- Cartão de informações da empresa ----
    const infoLinhas = [
      [['Empresa', nomeEmpresa]],
      [['CNPJ', empresaInfo?.cnpj], ['Responsável', empresaInfo?.responsavel]],
      [['Telefone', empresaInfo?.telefone], ['Auditor', auditoriaInfo?.auditorResponsavel]],
      [['Data da auditoria', dataAuditoria], ['Emitido em', dataImpressao]],
    ];
    const alturaLinha = 12;
    const alturaCartao = infoLinhas.length * alturaLinha + 6;

    doc.setFillColor(...COR_FUNDO_SUAVE);
    doc.setDrawColor(...COR_BORDA);
    doc.roundedRect(margin, yOffset, contentWidth, alturaCartao, 2, 2, 'FD');
    doc.setFillColor(...COR_MARCA);
    doc.rect(margin, yOffset + 2, 1.2, alturaCartao - 4, 'F');

    infoLinhas.forEach((linha, rIndex) => {
      const baseY = yOffset + 6 + rIndex * alturaLinha;
      linha.forEach(([rotulo, valor], cIndex) => {
        const x = margin + 6 + cIndex * (contentWidth / 2);
        const larguraMax = linha.length === 1 ? contentWidth - 12 : contentWidth / 2 - 8;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(...COR_TEXTO_SUAVE);
        doc.text(rotulo.toUpperCase(), x, baseY);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(...COR_TEXTO);
        doc.text(doc.splitTextToSize(textoOuTraco(valor), larguraMax)[0], x, baseY + 5);
      });
    });
    yOffset += alturaCartao + 6;

    if (auditoriaInfo?.observacao) {
      const linhasObs = doc.splitTextToSize(sanitizePdfText(auditoriaInfo.observacao), contentWidth - 8);
      const alturaObs = linhasObs.length * 4.5 + 11;
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(...COR_BORDA);
      doc.roundedRect(margin, yOffset, contentWidth, alturaObs, 2, 2, 'FD');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(...COR_TEXTO_SUAVE);
      doc.text('OBSERVAÇÃO GERAL', margin + 4, yOffset + 5);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.5);
      doc.setTextColor(...COR_TEXTO);
      doc.text(linhasObs, margin + 4, yOffset + 10.5);
      yOffset += alturaObs + 6;
    }

    // ---- Cálculo de resultados ----
    const toOrdemTopicoNumber = (value) => {
      if (value == null) return null;
      const n = Number(value);
      return Number.isFinite(n) ? n : null;
    };

    const topicosOrdenados = Array.isArray(topicos)
      ? [...topicos].sort((a, b) => {
        const ordemA = toOrdemTopicoNumber(a?.ordem_topico);
        const ordemB = toOrdemTopicoNumber(b?.ordem_topico);
        const nomeA = String(a?.nome_tema || '');
        const nomeB = String(b?.nome_tema || '');

        if (ordemA == null && ordemB == null) return nomeA.localeCompare(nomeB, 'pt-BR');
        if (ordemA == null) return 1;
        if (ordemB == null) return -1;
        if (ordemA !== ordemB) return ordemA - ordemB;
        return nomeA.localeCompare(nomeB, 'pt-BR');
      })
      : [];

    const resumoTopicos = topicosOrdenados.map((topico, tIndex) => {
      const perguntas = topico.perguntas || [];
      const percentual = calcularPercentualTopico(perguntas, respostas);
      return {
        topico,
        perguntas,
        ordem: toOrdemTopicoNumber(topico.ordem_topico) ?? (tIndex + 1),
        percentual,
        classe: classificar(percentual),
      };
    });

    const comResultado = resumoTopicos.filter(t => t.percentual !== null);
    const resultadoGeral = comResultado.length > 0
      ? Math.round(comResultado.reduce((soma, t) => soma + t.percentual, 0) / comResultado.length)
      : 0;
    const classeGeral = classificar(comResultado.length > 0 ? resultadoGeral : null);

    // ---- Cartão de resultado geral ----
    const alturaResultado = 24;
    doc.setFillColor(...classeGeral.fundo);
    doc.setDrawColor(...classeGeral.barra);
    doc.roundedRect(margin, yOffset, contentWidth, alturaResultado, 2, 2, 'FD');
    doc.setFillColor(...classeGeral.barra);
    doc.rect(margin, yOffset + 2, 2.5, alturaResultado - 4, 'F');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...classeGeral.texto);
    doc.text('RESULTADO GERAL', margin + 8, yOffset + 8);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text(classeGeral.rotulo, margin + 8, yOffset + 16);
    doc.setFontSize(26);
    doc.text(comResultado.length > 0 ? `${resultadoGeral}%` : '—', pageWidth - margin - 8, yOffset + 16, { align: 'right' });
    yOffset += alturaResultado + 8;

    // ---- Resumo por processo ----
    if (resumoTopicos.length > 0) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(...COR_MARCA);
      doc.text('Resumo por processo', margin, yOffset);
      yOffset += 3;

      autoTable(doc, {
        head: [['#', 'Processo', 'Resultado', 'Classificação']],
        body: resumoTopicos.map(t => [
          t.ordem,
          sanitizePdfText(t.topico.nome_tema || ''),
          {
            content: t.percentual === null ? '—' : `${t.percentual}%`,
            styles: { halign: 'center', fontStyle: 'bold', fillColor: t.classe.fundo, textColor: t.classe.texto },
          },
          {
            content: t.classe.rotulo,
            styles: { fillColor: t.classe.fundo, textColor: t.classe.texto },
          },
        ]),
        startY: yOffset,
        margin: { left: margin, right: margin, top: topY, bottom: 18 },
        theme: 'grid',
        styles: { fontSize: 9, cellPadding: 2, textColor: COR_TEXTO, lineColor: COR_BORDA, lineWidth: 0.2, overflow: 'linebreak' },
        headStyles: { fillColor: COR_MARCA, textColor: [255, 255, 255], fontStyle: 'bold', lineColor: COR_MARCA },
        alternateRowStyles: { fillColor: [252, 250, 251] },
        columnStyles: {
          0: { cellWidth: 10, halign: 'center' },
          2: { cellWidth: 24 },
          3: { cellWidth: 58 },
        },
        rowPageBreak: 'avoid',
      });
      yOffset = doc.lastAutoTable.finalY + 6;
    }

    // ---- Detalhamento por processo ----
    for (let tIndex = 0; tIndex < resumoTopicos.length; tIndex++) {
      const { topico, perguntas: perguntasDoTopico, ordem, percentual, classe } = resumoTopicos[tIndex];
      novaPagina();

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12.5);
      const temaTexto = doc.splitTextToSize(
        `${ordem} - ${sanitizePdfText(topico.nome_tema)}`,
        contentWidth - 10
      );
      const alturaTitulo = temaTexto.length * 6 + 5;
      doc.setFillColor(...COR_MARCA);
      doc.roundedRect(margin, yOffset, contentWidth, alturaTitulo, 1.5, 1.5, 'F');
      doc.setFillColor(...COR_DESTAQUE);
      doc.rect(margin, yOffset + 1.5, 1.8, alturaTitulo - 3, 'F');
      doc.setTextColor(255, 255, 255);
      doc.text(temaTexto, margin + 6, yOffset + 6.5);
      yOffset += alturaTitulo + 4;

      if (topico.requisitos) {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(9.5);
        doc.setTextColor(...COR_TEXTO_SUAVE);
        const requisitoTexto = doc.splitTextToSize(sanitizePdfText(`${topico.requisitos}`), contentWidth);
        doc.text(requisitoTexto, margin, yOffset);
        yOffset += requisitoTexto.length * 4.6 + 3;
      }

      if (percentual !== null) {
        const rotuloBadge = `${classe.rotulo} (${percentual}%)`;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9.5);
        const larguraBadge = doc.getTextWidth(rotuloBadge) + 10;
        doc.setFillColor(...classe.fundo);
        doc.setDrawColor(...classe.barra);
        doc.roundedRect(margin, yOffset, larguraBadge, 7, 3.5, 3.5, 'FD');
        doc.setTextColor(...classe.texto);
        doc.text(rotuloBadge, margin + 5, yOffset + 4.8);
        yOffset += 11;
      }

      const numeroColumnWidth = 10;
      const respostaColumnWidth = 30;
      const observacaoColumnWidth = 62;
      const perguntaColumnWidth = contentWidth - numeroColumnWidth - respostaColumnWidth - observacaoColumnWidth;

      const tableData = perguntasDoTopico.map(p => {
        const status = STATUS_RESPOSTA[respostas[p.id]] || STATUS_RESPOSTA.default;
        return [
          p.ordem_pergunta,
          softWrapPdfText(sanitizePdfText(p.descricao_pergunta || '')),
          {
            content: status.rotulo,
            styles: { fontStyle: 'bold', halign: 'center', valign: 'middle', textColor: status.texto, fillColor: status.fundo },
          },
          softWrapPdfText(sanitizePdfText(comentario?.[p.id] || '')),
        ];
      });

      autoTable(doc, {
        head: [['#', 'Pergunta', 'Resposta', 'Observação']],
        body: tableData,
        startY: yOffset,
        margin: { left: margin, right: margin, top: topY, bottom: 18 },
        theme: 'grid',
        styles: { fontSize: 9, cellPadding: 2, textColor: COR_TEXTO, overflow: 'linebreak', lineColor: COR_BORDA, lineWidth: 0.2 },
        headStyles: { fillColor: COR_MARCA_SUAVE, textColor: [255, 255, 255], fontStyle: 'bold', lineColor: COR_MARCA_SUAVE },
        alternateRowStyles: { fillColor: [252, 250, 251] },
        columnStyles: {
          0: { cellWidth: numeroColumnWidth, halign: 'center' },
          1: { cellWidth: perguntaColumnWidth },
          2: { cellWidth: respostaColumnWidth },
          3: { cellWidth: observacaoColumnWidth },
        },
        rowPageBreak: 'avoid',
      });
      yOffset = doc.lastAutoTable.finalY + 6;

      const fotosDoTopico = perguntasDoTopico.flatMap(p => {
        return (fotos?.[p.id.toString()] || []).map(fotoUrl => ({
          ordem: p.ordem_pergunta,
          url: fotoUrl
        }));
      });

      if (fotosDoTopico.length > 0) {
        const gap = 6;
        const boxWidth = (contentWidth - gap) / 2;
        const boxHeight = Math.min(85, (contentBottom - topY) / 3);
        let rowMaxHeight = 0;

        if (yOffset + boxHeight + 20 > contentBottom) {
          novaPagina();
        }

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(...COR_MARCA);
        doc.text('Evidências fotográficas', margin, yOffset);
        doc.setDrawColor(...COR_DESTAQUE);
        doc.setLineWidth(0.5);
        doc.line(margin, yOffset + 1.5, margin + 38, yOffset + 1.5);
        doc.setLineWidth(0.2);
        yOffset += 7;

        for (let i = 0; i < fotosDoTopico.length; i++) {
          const foto = fotosDoTopico[i];
          const xPos = margin + (i % 2 === 1 ? boxWidth + gap : 0);
          const fotoUrl = resolveFotoUrl(foto.url);

          if (i % 2 === 0) {
            if (yOffset + boxHeight + 12 > contentBottom) {
              novaPagina();
            }
            rowMaxHeight = 0;
          }

          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8);
          doc.setTextColor(...COR_TEXTO_SUAVE);
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
              doc.setDrawColor(...COR_BORDA);
              doc.rect(imgX, imgY, finalW, finalH);
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

    // ---- Assinatura e data da impressão ----
    const alturaAssinatura = 42;
    if (resumoTopicos.length === 0 || yOffset + alturaAssinatura > contentBottom) {
      novaPagina();
    }
    const assinaturaY = Math.min(yOffset + 28, contentBottom - 14);
    const larguraAssinatura = 80;

    doc.setDrawColor(...COR_TEXTO);
    doc.setLineWidth(0.3);
    doc.line(margin, assinaturaY, margin + larguraAssinatura, assinaturaY);
    doc.setLineWidth(0.2);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...COR_TEXTO);
    doc.text('Assinatura do Auditor', margin, assinaturaY + 5);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...COR_TEXTO_SUAVE);
    if (auditoriaInfo?.auditorResponsavel) {
      doc.text(sanitizePdfText(auditoriaInfo.auditorResponsavel), margin, assinaturaY + 9.5);
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...COR_TEXTO);
    doc.text('Data da impressão', pageWidth - margin, assinaturaY + 5, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...COR_TEXTO_SUAVE);
    doc.text(dataImpressao, pageWidth - margin, assinaturaY + 9.5, { align: 'right' });

    // ---- Cabeçalho corrido e rodapé com numeração em todas as páginas ----
    const totalPaginas = doc.getNumberOfPages();
    for (let pagina = 1; pagina <= totalPaginas; pagina++) {
      doc.setPage(pagina);

      if (pagina > 1) {
        doc.setFillColor(...COR_MARCA);
        doc.rect(0, 0, pageWidth, 14, 'F');
        doc.setFillColor(...COR_DESTAQUE);
        doc.rect(0, 14, pageWidth, 0.8, 'F');
        drawLogo(margin, 3.5, 7);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(255, 255, 255);
        doc.text(
          doc.splitTextToSize(nomeEmpresa, contentWidth - 50)[0] || '',
          pageWidth - margin,
          8.5,
          { align: 'right' }
        );
      }

      doc.setDrawColor(...COR_BORDA);
      doc.setLineWidth(0.3);
      doc.line(margin, pageHeight - 13, pageWidth - margin, pageHeight - 13);
      doc.setLineWidth(0.2);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(...COR_TEXTO_SUAVE);
      doc.text('Consultech · Relatório de Auditoria RTO', margin, pageHeight - 8);
      doc.text(`Página ${pagina} de ${totalPaginas}`, pageWidth - margin, pageHeight - 8, { align: 'right' });
    }

    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    if (isSafari) {
      doc.save(`auditoria-${nomeEmpresa || auditoriaInfo?.id || 'relatorio'}.pdf`);
    } else {
      const blob = doc.output("blob");
      const blobUrl = URL.createObjectURL(blob);
      window.open(blobUrl, "_blank");
    }
  };
  return { generatePdf };
};
