import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { usePwaInstall } from "../contexts/PwaInstallContext";
import { isDispositivoMovel } from "../utils/dispositivo";
import "../styles/InstalarPwa/index.css";

const ATRASO_MS = 3000;

// Rotas em que nunca interrompemos o usuário (login e auditoria em andamento).
const rotaPermiteSugestao = (pathname) =>
  pathname !== "/login" && !pathname.startsWith("/auditorias/");

function InstalarPwa() {
  const { isAuthenticated } = useAuth();
  const { pathname } = useLocation();
  const { podeInstalar, mostrarDicaIos, sugestaoLiberada, instalar, adiarSugestao } = usePwaInstall();
  const [instalando, setInstalando] = useState(false);
  const [atrasoCumprido, setAtrasoCumprido] = useState(false);

  // A sugestão automática só aparece no celular, para quem já entrou e não está no meio de uma auditoria.
  // No computador o botão "Instalar aplicativo" fica no menu do usuário, sem interromper ninguém.
  const deveSugerir =
    isAuthenticated &&
    isDispositivoMovel() &&
    sugestaoLiberada &&
    rotaPermiteSugestao(pathname) &&
    (podeInstalar || mostrarDicaIos);

  useEffect(() => {
    if (!deveSugerir) {
      setAtrasoCumprido(false);
      return undefined;
    }
    const timerId = window.setTimeout(() => setAtrasoCumprido(true), ATRASO_MS);
    return () => window.clearTimeout(timerId);
  }, [deveSugerir]);

  if (!deveSugerir || !atrasoCumprido) {
    return null;
  }

  const handleInstalar = async () => {
    setInstalando(true);
    await instalar();
    setInstalando(false);
  };

  // No iOS não existe o prompt nativo: orientamos o caminho manual pelo menu Compartilhar.
  const usarDicaIos = !podeInstalar && mostrarDicaIos;

  return (
    <div className="pwa-banner" role="dialog" aria-label="Instalar aplicativo">
      <img src="/pwa-192.png" alt="" className="pwa-banner-icone" />
      <div className="pwa-banner-texto">
        <strong>Instale o app Consultech</strong>
        <span>
          {usarDicaIos
            ? "Toque em Compartilhar e depois em “Adicionar à Tela de Início”."
            : "Acesso rápido, em tela cheia, direto da tela inicial."}
        </span>
      </div>
      <div className="pwa-banner-acoes">
        <button type="button" className="pwa-btn-secundario" onClick={adiarSugestao} disabled={instalando}>
          {usarDicaIos ? "Entendi" : "Agora não"}
        </button>
        {!usarDicaIos && (
          <button type="button" className="pwa-btn-primario" onClick={handleInstalar} disabled={instalando}>
            {instalando ? "Instalando..." : "Instalar"}
          </button>
        )}
      </div>
    </div>
  );
}

export default InstalarPwa;
