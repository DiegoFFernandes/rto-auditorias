import { useNavigate } from 'react-router-dom';
import '../../styles/PageCabecalho/index.css'

const ArrowLeftIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    fill="currentColor"
    viewBox="0 0 16 16"
    aria-hidden="true"
  >
    <path
      fillRule="evenodd"
      d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z"
    />
  </svg>
);

const PageCabecalho = ({ title, backTo = "/", onBackClick }) => {
  const navigate = useNavigate();

  const handleBack = (e) => {
    e.preventDefault()
    if (onBackClick) onBackClick()
    else navigate(backTo)
  }

  return (
    <header className="page-header">
      <button type="button" onClick={handleBack} className="voltar" aria-label="Voltar">
        <ArrowLeftIcon />
        <span className="voltar-texto">Voltar</span>
      </button>
      <h1>{title}</h1>
    </header>
  )
}

export default PageCabecalho
