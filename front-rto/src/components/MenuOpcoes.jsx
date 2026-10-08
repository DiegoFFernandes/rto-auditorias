import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';

import '../styles/MenuOpcoes/index.css';

// Lista de atalhos em cartões (grade no computador, lista compacta no celular).
// Cada opção: { to, icone, titulo, descricao, destaque? }
const MenuOpcoes = ({ opcoes, ariaLabel = 'Menu' }) => (
  <nav className="menu-opcoes" aria-label={ariaLabel}>
    {opcoes.map(({ to, icone, titulo, descricao, destaque }) => (
      <Link
        key={to}
        to={to}
        className={`menu-card${destaque ? ' menu-card--destaque' : ''}`}
      >
        <span className="menu-card-icone">
          <FontAwesomeIcon icon={icone} />
        </span>
        <span className="menu-card-texto">
          <strong>{titulo}</strong>
          <small>{descricao}</small>
        </span>
        <FontAwesomeIcon icon={faChevronRight} className="menu-card-seta" />
      </Link>
    ))}
  </nav>
);

export default MenuOpcoes;
