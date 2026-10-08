import React from 'react';
import {
  faListCheck,
  faUsersGear,
  faBuilding,
} from '@fortawesome/free-solid-svg-icons';
import PageCabecalho from '../components/Botoes/PageCabecalho';
import MenuOpcoes from '../components/MenuOpcoes';

import '../styles/Administracao/index.css';

const OPCOES = [
  {
    to: '/administracao/topicos-perguntas',
    icone: faListCheck,
    titulo: 'Tópicos e Perguntas',
    descricao: 'Gerencie o modelo de auditorias e suas perguntas.',
  },
  {
    to: '/administracao/usuarios',
    icone: faUsersGear,
    titulo: 'Gerenciar Usuários',
    descricao: 'Gerencie os usuários e permissões do sistema.',
  },
  {
    to: '/administracao/clientes',
    icone: faBuilding,
    titulo: 'Gerenciar Clientes',
    descricao: 'Adicione, edite ou remova os clientes do sistema.',
  },
];

const Administracao = () => {
  return (
    <div className="administracao-page">
      <PageCabecalho title="Administração do Sistema" backTo="/" />
      <MenuOpcoes opcoes={OPCOES} ariaLabel="Menu de administração" />
    </div>
  );
};

export default Administracao;
