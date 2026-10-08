import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client'
import { toast } from 'react-toastify';
import App from './App.jsx'
import AvisoNovaVersao from './components/AvisoNovaVersao.jsx';
import './styles/global.css'
import { registerSW } from 'virtual:pwa-register';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

const UMA_HORA_MS = 60 * 60 * 1000;

// O aviso não recarrega sozinho: quem está no meio de uma auditoria escolhe o momento de atualizar.
const updateSW = registerSW({
  onNeedRefresh() {
    toast.info(<AvisoNovaVersao onAtualizar={() => updateSW(true)} />, {
      toastId: 'nova-versao',
      autoClose: false,
      closeOnClick: false,
      position: 'bottom-center',
    });
  },
  onRegisteredSW(_swUrl, registration) {
    if (!registration) return;

    const procurarAtualizacao = () => {
      if (registration.installing || !navigator.onLine) return;
      registration.update().catch(() => {});
    };

    // O app instalado pode ficar aberto por dias: procura atualização a cada hora
    // e sempre que o usuário volta para ele.
    setInterval(procurarAtualizacao, UMA_HORA_MS);
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) procurarAtualizacao();
    });
  },
});
