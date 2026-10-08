import React from 'react';
import {
  faFileCirclePlus,
  faMagnifyingGlass,
  faChartColumn,
  faCalendarDays,
  faGear,
} from '@fortawesome/free-solid-svg-icons';

import { useAuth } from '../contexts/AuthContext';
import MenuOpcoes from '../components/MenuOpcoes';
import '../styles/TelaInicial/index.css';

const OPCOES = [
  {
    to: '/criar-auditoria',
    icone: faFileCirclePlus,
    titulo: 'Criar Auditoria',
    descricao: 'Selecione a empresa e o período da nova auditoria.',
    destaque: true,
  },
  {
    to: '/listar-auditorias',
    icone: faMagnifyingGlass,
    titulo: 'Consultar Auditorias',
    descricao: 'Consulte, continue ou gere o PDF das auditorias.',
  },
  {
    to: '/resumo-rto',
    icone: faChartColumn,
    titulo: 'Relatórios',
    descricao: 'Veja o resultado anual por empresa e processo.',
  },
  {
    to: '/agenda-auditorias',
    icone: faCalendarDays,
    titulo: 'Agenda de Auditorias',
    descricao: 'Visualize e gerencie as auditorias agendadas.',
  },
  {
    to: '/administracao',
    icone: faGear,
    titulo: 'Administração',
    descricao: 'Tópicos, perguntas, clientes e usuários do sistema.',
    somenteAdmin: true,
  },
];

const NOME_DO_PERFIL = {
  ADM: 'Administrador',
  AUD: 'Auditor',
};

const primeiroNome = (nome) => (nome || '').trim().split(/\s+/)[0];

const TelaInicial = () => {
  const { userData } = useAuth();
  const ehAdmin = userData?.role === 'ADM';
  const opcoesVisiveis = OPCOES.filter((opcao) => !opcao.somenteAdmin || ehAdmin);
  const nome = primeiroNome(userData?.nome);

  return (
    <div className="home">
      <header className="home-saudacao">
        <div>
          <h2>{nome ? `Olá, ${nome}` : 'Olá'}</h2>
          <p>O que você deseja fazer hoje?</p>
        </div>
        {NOME_DO_PERFIL[userData?.role] && (
          <span className="home-perfil">{NOME_DO_PERFIL[userData.role]}</span>
        )}
      </header>

      <MenuOpcoes opcoes={opcoesVisiveis} ariaLabel="Menu principal" />
    </div>
  );
};

export default TelaInicial;
