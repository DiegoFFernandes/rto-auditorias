import { useMemo, useEffect } from "react";

import '../../styles/Evidencias/index.css';

const AuditoriaEvidencias = ({
  questionId,
  fotos = [],
  observacao = "",
  handleFotoChange,
  handleObservacaoChange,
  handleRemoveFoto,
  fileInputRef,
}) => {
  const previewSrcs = useMemo(() => {
    return fotos
      .map((foto) => {
        if (!foto) return null;
        if (typeof foto === "string") return foto;
        if (foto?.data) return foto.data;
        try {
          return URL.createObjectURL(foto);
        } catch {
          return null;
        }
      })
      .filter(Boolean);
  }, [fotos]);

  useEffect(() => {
    return () => {
      previewSrcs.forEach((url, index) => {
        if (fotos[index] instanceof File) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [previewSrcs, fotos]);

  return (
    <div className="evidencias-wrapper">
      <div className="foto-upload-container">
        <label htmlFor={`foto-upload-${questionId}`} className="foto-upload-label">
          <input
            id={`foto-upload-${questionId}`}
            type="file"
            accept="image/*"
            capture="environment" //abre a camera do celular
            multiple
            className="foto-upload-input"
            onChange={(e) => {
              const files = e.target.files;
              if (files) {
                Array.from(files).forEach((file) => {
                  handleFotoChange(questionId, file);
                });
              }
            }}
            ref={fileInputRef}
          />
          <span className="foto-upload-button">+ Adicionar Foto(s)</span>
        </label>

        {fotos.length > 0 && (
          <div className="foto-feedback">
            <span className="foto-status-badge">{fotos.length} foto(s) carregada(s)</span>
          </div>
        )}

        <div className="fotos-preview-grid">
          {previewSrcs.map((src, index) => (
            <div key={index} className="foto-preview-item">
              <img
                src={`${import.meta.env.VITE_API_URL}${src}`}
                alt={`Pré-visualização ${index + 1}`}
                className="foto-preview-img"
              />
              <button
                type="button"
                className="foto-remove-button"
                onClick={() => handleRemoveFoto(questionId, index)}
              >
                &times;
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="observacao-container">
        <label htmlFor={`observacao-${questionId}`} className="observacao-label">
          Observação:
        </label>
        <textarea
          id={`observacao-${questionId}`}
          className="observacao-textarea"
          placeholder="Digite aqui sua observação..."
          rows={3}
          value={observacao}
          onChange={(e) => handleObservacaoChange(questionId, e.target.value)}
        />
      </div>
    </div>
  );
};

export default AuditoriaEvidencias;