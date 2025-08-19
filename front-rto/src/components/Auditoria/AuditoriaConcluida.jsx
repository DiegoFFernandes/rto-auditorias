import React from 'react';
import { Link } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';

import '../../styles/Auditorias/index.css';

const AuditoriaConcluida = ({ onGerarPdf }) => (
  <div className="auditorias-page">
    <div className="auditorias-container">
      <div className="success-card">
        <h1 className="success-title">Auditoria Concluída!</h1>
        <p className="success-message">A sua auditoria foi salva com sucesso no sistema.</p>
        <div className="success-actions">
          <Link to="/" className="nav-button back">
            <HomeIcon className="nav-icon" />
            Ir para a Home
          </Link>
          <button onClick={onGerarPdf} className="nav-button next">
            <PictureAsPdfIcon className="nav-icon" />
            Gerar PDF
          </button>
        </div>
      </div>
    </div>
  </div>
);

export default AuditoriaConcluida;