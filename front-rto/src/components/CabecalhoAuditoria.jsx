import React from 'react';
import { FaBuilding, FaUserTie, FaRegCalendarAlt } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext.jsx';
import '../styles/CabecalhoAuditoria/index.css';
import { formatarData } from '../utils/formatarData';

const CabecalhoAuditoria = ({ empresaInfo, auditoriaInfo }) => {
  const { userData } = useAuth();

  if (!empresaInfo || !auditoriaInfo || !userData) {
    return null;
  }

  const dataFormatada = auditoriaInfo.dt_auditoria
    ? formatarData(auditoriaInfo.dt_auditoria)
    : 'Data inválida';

  // O auditor da auditoria, e não quem está logado (um ADM pode abrir a auditoria de outra pessoa).
  const auditor = auditoriaInfo.auditorResponsavel || userData.nome;

  const detalhes = [
    ['Responsável', empresaInfo.responsavel],
    ['Contato', empresaInfo.telefone],
    ['Observações gerais', auditoriaInfo.observacao],
  ].filter(([, valor]) => Boolean(valor));

  return (
    <section className="cab-aud" aria-label="Dados da auditoria">
      <div className="cab-aud-topo">
        <span className="cab-aud-icone"><FaBuilding /></span>
        <div className="cab-aud-titulos">
          <h1 className="cab-aud-nome">{empresaInfo.razao_social}</h1>
          {empresaInfo.cnpj && <p className="cab-aud-cnpj">CNPJ {empresaInfo.cnpj}</p>}
        </div>
      </div>

      <ul className="cab-aud-chips">
        <li><FaUserTie aria-hidden="true" /> <span>{auditor}</span></li>
        <li><FaRegCalendarAlt aria-hidden="true" /> <span>{dataFormatada}</span></li>
      </ul>

      {detalhes.length > 0 && (
        <details className="cab-aud-mais">
          <summary>Mais informações</summary>
          <dl>
            {detalhes.map(([rotulo, valor]) => (
              <div key={rotulo}>
                <dt>{rotulo}</dt>
                <dd>{valor}</dd>
              </div>
            ))}
          </dl>
        </details>
      )}
    </section>
  );
};

export default CabecalhoAuditoria;
