import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { isIos } from '../utils/dispositivo';

const STORAGE_KEY = 'pwaInstall';
const DIA_MS = 24 * 60 * 60 * 1000;
// Cada vez que o usuário recusa, esperamos mais antes de sugerir de novo: 7, 30 e depois 90 dias.
const SONECA_EM_DIAS = [7, 30, 90];

const lerEstado = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
};

const salvarEstado = (estado) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(estado));
  } catch {
    // localStorage indisponível (modo privado, etc.): apenas não lembramos a escolha.
  }
};

const isStandalone = () =>
  typeof window !== 'undefined' &&
  (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true);

const PwaInstallContext = createContext(null);

export const PwaInstallProvider = ({ children }) => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [estado, setEstado] = useState(lerEstado);
  const [emStandalone, setEmStandalone] = useState(isStandalone);

  // Não gravamos "instalado" no navegador: se o usuário desinstalar o app, deve poder instalar de novo.
  // Com o app instalado o próprio navegador deixa de disparar o beforeinstallprompt.
  const jaInstalado = emStandalone;

  useEffect(() => {
    const aoReceberPrompt = (event) => {
      // Impede o mini-aviso automático do Chrome: quem decide quando perguntar somos nós.
      event.preventDefault();
      setDeferredPrompt(event);
    };

    const aoInstalar = () => {
      setDeferredPrompt(null);
      setEmStandalone(true);
    };

    window.addEventListener('beforeinstallprompt', aoReceberPrompt);
    window.addEventListener('appinstalled', aoInstalar);
    return () => {
      window.removeEventListener('beforeinstallprompt', aoReceberPrompt);
      window.removeEventListener('appinstalled', aoInstalar);
    };
  }, []);

  // Registra que o usuário não quis agora e só volta a sugerir depois da "soneca".
  const adiarSugestao = useCallback(() => {
    setEstado((atual) => {
      const recusas = (atual.recusas || 0) + 1;
      const dias = SONECA_EM_DIAS[Math.min(recusas - 1, SONECA_EM_DIAS.length - 1)];
      const novo = { ...atual, recusas, ate: Date.now() + dias * DIA_MS };
      salvarEstado(novo);
      return novo;
    });
  }, []);

  const instalar = useCallback(async () => {
    if (!deferredPrompt) return false;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    // O evento só pode ser usado uma vez.
    setDeferredPrompt(null);

    if (outcome === 'accepted') {
      return true;
    }

    adiarSugestao();
    return false;
  }, [deferredPrompt, adiarSugestao]);

  const value = useMemo(() => ({
    jaInstalado,
    podeInstalar: Boolean(deferredPrompt) && !jaInstalado,
    mostrarDicaIos: isIos() && !jaInstalado,
    sugestaoLiberada: !estado.ate || Date.now() > estado.ate,
    instalar,
    adiarSugestao,
  }), [jaInstalado, deferredPrompt, estado.ate, instalar, adiarSugestao]);

  return <PwaInstallContext.Provider value={value}>{children}</PwaInstallContext.Provider>;
};

export const usePwaInstall = () => {
  const context = useContext(PwaInstallContext);
  if (!context) {
    throw new Error('usePwaInstall deve ser usado dentro de PwaInstallProvider.');
  }
  return context;
};
