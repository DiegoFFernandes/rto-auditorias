import '../../styles/Auditorias/index.css';

const AuditoriaTopico = ({ topico, indiceTopico, totalTopicos, progressoTopico }) => (
  <div className="card-header-v2">
    <h2 className="topic-number">Tópico {indiceTopico + 1}/{totalTopicos}</h2>
    <h1 className="topic-title">{topico.nome_tema}</h1>
    <p className="topic-subtitle">{topico.requisitos}</p>
    <div className="topic-progress-bar-container">
      <div className="topic-progress-bar-label">
        <span className="topic-progress-text">{progressoTopico}%</span>
      </div>
      <div className="topic-progress-bar-fill" style={{ width: `${progressoTopico}%` }}></div>
    </div>
  </div>
);

export default AuditoriaTopico;