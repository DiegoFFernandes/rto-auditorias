import { useState, useRef, useEffect } from 'react';
import { FaUserCircle, FaBars, FaTimes } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { usePwaInstall } from '../contexts/PwaInstallContext';
import logo from '../assets/logo.png';
import '../styles/Cabecalho/index.css';

function Cabecalho() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isAuthenticated, userData, logout } = useAuth();
  const { podeInstalar, instalar } = usePwaInstall();
  const sidebarRef = useRef(null);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleInstalarApp = async () => {
    await instalar();
    setSidebarOpen(false);
  };

  const handleLogout = () => {
    logout();
    setSidebarOpen(false);
  };

  const handleClickOutside = (event) => {
    if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
      setSidebarOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="cabecalho">
      <div className="espacador"></div>
      
      <div className="logo-container">
        <img src={logo} alt="Logo Consultech" className="logo" />
      </div>
      
      <div className="perfil-usuario-container">
        {isAuthenticated && userData ? (
          <>
            <div className="perfil-usuario" onClick={toggleSidebar}>
              <FaUserCircle className="icone-usuario" />
              <span className="nome-usuario">{userData.nome}</span>
              {sidebarOpen ? <FaTimes className="icone-toggle" /> : <FaBars className="icone-toggle" />}
            </div>

            <div ref={sidebarRef} className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
              <p className="sidebar-nome-usuario">Olá, {userData.nome}</p>
              {podeInstalar && (
                <button onClick={handleInstalarApp} className="botao-instalar-app">
                  Instalar aplicativo
                </button>
              )}
              <button onClick={handleLogout} className="botao-logout">
                Logout
              </button>
            </div>
          </>
        ) : (
          <span className="nome-visitante">Visitante</span>
        )}
      </div>
    </header>
  );
}

export default Cabecalho;
