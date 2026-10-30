import { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/api';

const AuthContext = createContext(null);

// Atualiza nome e perfil (ADM/AUD) com o que está no banco: se o tipo_usuario mudar,
// o menu e os botões refletem a mudança sem precisar sair e entrar de novo.
const atualizarDadosDoBanco = async (dadosAtuais, salvar) => {
  if (!dadosAtuais?.id) return;
  try {
    const { data } = await api.get(`/usuarios/${dadosAtuais.id}`);
    if (!data) return;
    const atualizados = { ...dadosAtuais, nome: data.nome, role: data.tipo_usuario };
    if (atualizados.nome !== dadosAtuais.nome || atualizados.role !== dadosAtuais.role) {
      salvar(atualizados);
    }
  } catch {
    // Sem conexão ou servidor indisponível: mantém os dados salvos. Token inválido já é
    // tratado pelo interceptor da API (desloga e leva ao login).
  }
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const authToken = localStorage.getItem('authToken');
    const userDataString = localStorage.getItem('userData');
    
    if (authToken && userDataString) {
      try {
        const parsedUserData = JSON.parse(userDataString);
        setIsAuthenticated(true);
        setUserData(parsedUserData);
        atualizarDadosDoBanco(parsedUserData, (atualizados) => {
          localStorage.setItem('userData', JSON.stringify(atualizados));
          setUserData(atualizados);
        });
      } catch (error) {
        console.error("Erro ao ler os dados de usuário do localStorage", error);
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
      }
    }
    setLoading(false);
  }, []);

  const login = (token, data) => {
    localStorage.setItem('authToken', token);
    localStorage.setItem('userData', JSON.stringify(data));
    setIsAuthenticated(true);
    setUserData(data);
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    setIsAuthenticated(false);
    setUserData(null);
  };

  const value = {
    isAuthenticated,
    userData,
    loading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};