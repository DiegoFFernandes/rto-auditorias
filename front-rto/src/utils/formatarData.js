// Datas de auditoria/agendamento são "dia do calendário" (coluna DATE), sem hora nem fuso.
// Por isso lemos o dia direto do texto "AAAA-MM-DD", sem passar por new Date(), que aplicaria o
// fuso do navegador e poderia mostrar o dia anterior. Aceita também o formato antigo da API
// ("2026-10-26T00:00:00.000Z"), usando apenas a parte da data.
const DIA_DO_CALENDARIO = /^(\d{4})-(\d{2})-(\d{2})/;

const formatarData = (data) => {
    if (!data) return '';

    if (typeof data === 'string') {
        const partes = data.match(DIA_DO_CALENDARIO);
        if (partes) {
            const [, ano, mes, dia] = partes;
            return `${dia}/${mes}/${ano}`;
        }
    }

    const d = new Date(data);
    if (isNaN(d.getTime())) return 'Data inválida';
    const dia = String(d.getDate()).padStart(2, '0');
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    const ano = d.getFullYear();
    return `${dia}/${mes}/${ano}`;
};

// Date à meia-noite local do dia do calendário informado (para date-fns e afins).
const dataLocal = (data) => {
    const partes = typeof data === 'string' ? data.match(DIA_DO_CALENDARIO) : null;
    if (partes) {
        const [, ano, mes, dia] = partes;
        return new Date(Number(ano), Number(mes) - 1, Number(dia));
    }
    return new Date(data);
};

export { formatarData, dataLocal };
