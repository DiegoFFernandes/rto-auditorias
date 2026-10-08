// Conteúdo do aviso exibido quando há uma nova versão do app (ver main.jsx).
const AvisoNovaVersao = ({ onAtualizar }) => (
  <div className="aviso-versao">
    <span>Nova versão disponível</span>
    <button type="button" onClick={onAtualizar}>Atualizar</button>
  </div>
);

export default AvisoNovaVersao;
