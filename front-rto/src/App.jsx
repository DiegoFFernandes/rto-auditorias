import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import Cabecalho from "./components/Cabecalho";
import TelaInicial from "./pages/TelaInicial";
import CriaAuditoria from "./components/CriaAuditoria";
import Auditorias from "./pages/Auditorias";
import Clientes from "./pages/Clientes";
import ListaAuditorias from "./pages/ListaAuditorias";
import Login from "./pages/Login";
import ResumoRto from "./pages/ResumoRto";
import Usuarios from "./pages/Usuarios";
import RotaPrivada from "./components/RotasPrivadas";
import AgendaAuditorias from "./pages/AgendaAuditorias";
import Administracao from "./pages/Administracao";
import GerenciarTopicos from "./components/GerenciarTopicos";

import { ToastContainer } from "react-toastify";
import { AuthProvider } from "./contexts/AuthContext";


function LayoutComCabecalho() {
  return (
    <>
      <Cabecalho />
      <Outlet />
    </>
  );
}

function App() {
  return (
    <AuthProvider >
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<RotaPrivada />}>
            <Route element={<LayoutComCabecalho />}>
              <Route path="/" element={<TelaInicial />} />
              <Route path="/auditorias" element={<Auditorias />} />
              <Route path="/administracao/clientes" element={<Clientes />} />
              <Route path="/administracao/usuarios" element={<Usuarios />} />
              <Route path="/criar-auditoria" element={<CriaAuditoria />} />
              <Route path="/listar-auditorias" element={<ListaAuditorias />} />
              <Route path="/resumo-rto" element={<ResumoRto />} />
              <Route path="/agenda-auditorias" element={<AgendaAuditorias />} />
              <Route path="/administracao" element={<Administracao />} />
              <Route path="/administracao/topicos-perguntas" element={<GerenciarTopicos />} />
            </Route>
          </Route>
        </Routes>
        <ToastContainer />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
