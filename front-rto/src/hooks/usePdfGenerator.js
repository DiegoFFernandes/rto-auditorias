import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import logo from "../assets/logo.png"; // logo da empresa

export const usePdfGenerator = () => {
  const generatePdf = (topicos, respostas) => {
    const doc = new jsPDF();
    let yOffset = 10;

    // === PEGA DADOS DA EMPRESA DO LOCALSTORAGE ===
    let empresaInfo = null;
    try {
      const empresaStorage = localStorage.getItem("empresaSelecionanda");
      if (empresaStorage) {
        const parsed = JSON.parse(empresaStorage);
        empresaInfo = parsed?.cliente || null;
      }
    } catch (err) {
      console.error("Erro ao recuperar empresa:", err);
    }

    // === LOGO ===
    doc.addImage(logo, "PNG", 10, yOffset, 30, 15);
    yOffset += 20;

    // === TÍTULO ===
    doc.setFontSize(16);
    doc.text("Relatório de Auditoria", 105, yOffset, { align: "center" });
    yOffset += 10;

    // === DADOS DA EMPRESA ===
    if (empresaInfo) {
      doc.setFontSize(12);
      doc.text(`Empresa: ${empresaInfo.razao_social || "N/D"}`, 10, yOffset);
      yOffset += 6;
      if (empresaInfo.cnpj) {
        doc.text(`CNPJ: ${empresaInfo.cnpj}`, 10, yOffset);
        yOffset += 6;
      }
      if (empresaInfo.endereco) {
        doc.text(`Endereço: ${empresaInfo.endereco}`, 10, yOffset);
        yOffset += 6;
      }
    }

    // === DATA ===
    const dataAtual = new Date().toLocaleString();
    doc.setFontSize(10);
    doc.text(`Gerado em: ${dataAtual}`, 105, yOffset, { align: "center" });
    yOffset += 10;

    // === CALCULAR RESULTADO GERAL ===
    let somaPercentuais = 0;
    let topicosComRespostas = 0;

   
    // Visualizar o PDF
    const pdfBlob = doc.output('blob');
    const url = URL.createObjectURL(pdfBlob);
    window.open(url);

  };

  return { generatePdf };
};
