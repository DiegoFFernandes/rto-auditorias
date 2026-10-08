import '../../styles/Auditorias/index.css';

const AuditoriaTopico = ({ topico, totalTopicos, progressoTopico }) => (
  <div className="card-header-v2">
    <div className="topic-topo">
      <span className="topic-number">Tópico {topico.ordem_topico}/{totalTopicos}</span>
      <span className="topic-progress-text">{progressoTopico}%</span>
    </div>
    <h1 className="topic-title">{`${topico.ordem_topico} - ${topico.nome_tema}`}</h1>
    {topico.requisitos && <p className="topic-subtitle">{topico.requisitos}</p>}
    <div
      className="topic-progress-bar-container"
      role="progressbar"
      aria-valuenow={progressoTopico}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Progresso do tópico"
    >
      <div className="topic-progress-bar-fill" style={{ width: `${progressoTopico}%` }}></div>
    </div>
  </div>
);

export default AuditoriaTopico;
