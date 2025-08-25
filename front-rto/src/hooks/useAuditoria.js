import { useState, useEffect, useMemo, useRef } from 'react';
import { toast } from 'react-toastify';

import api from '../api/api';
const idUsuarioExemplo = 1;
let idClienteFinal = 0;

const LOCAL_STORAGE_RESPOSTAS_KEY = 'auditoria-respostas-em-andamento';
const LOCAL_STORAGE_POSICAO_KEY = 'auditoria-posicao-em-andamento';
const LOCAL_STORAGE_FOTOS_KEY = 'auditoria-fotos-em-andamento';
const LOCAL_STORAGE_OBSERVACOES_KEY = 'auditoria-observacoes-em-andamento';
const EMPRESA_SELECIONADA = 'empresa-selecionada';

export const useAuditoria = () => {
  const [topicos, setTopicos] = useState([]);
  const [respostas, setRespostas] = useState(() => {
    try {
      const savedRespostas = localStorage.getItem(LOCAL_STORAGE_RESPOSTAS_KEY);
      return savedRespostas ? JSON.parse(savedRespostas) : {};
    } catch (error) {
      console.error('Erro ao carregar respostas do localStorage:', error);
      return {};
    }
  });

  const [activeTopicIndex, setActiveTopicIndex] = useState(() => {
    try {
      const savedPosition = localStorage.getItem(LOCAL_STORAGE_POSICAO_KEY);
      return savedPosition ? JSON.parse(savedPosition).activeTopicIndex : 0;
    } catch (error) {
      console.error('Erro ao carregar posição do localStorage:', error);
      return 0;
    }
  });
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(() => {
    try {
      const savedPosition = localStorage.getItem(LOCAL_STORAGE_POSICAO_KEY);
      return savedPosition ? JSON.parse(savedPosition).activeQuestionIndex : 0;
    } catch (error) {
      console.error('Erro ao carregar posição do localStorage:', error);
      return 0;
    }
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [empresaInfo, setEmpresaInfo] = useState(null);
  const [auditoriaInfo, setAuditoriaInfo] = useState(null);

  const [fotos, setFotos] = useState(() => {
    try {
      const savedFotos = localStorage.getItem(LOCAL_STORAGE_FOTOS_KEY);
      return savedFotos ? JSON.parse(savedFotos) : {};
    } catch (error) {
      console.error('Erro ao carregar fotos do localStorage:', error);
      return {};
    }
  });

  const [observacoes, setObservacoes] = useState(() => {
    try {
      const savedObservacoes = localStorage.getItem(LOCAL_STORAGE_OBSERVACOES_KEY);
      return savedObservacoes ? JSON.parse(savedObservacoes) : {};
    } catch (error) {
      console.error('Erro ao carregar observações do localStorage:', error);
      return {};
    }
  });

  const fileInputRef = useRef(null);

  const handleFotoChange = async (perguntaId, file) => {
    setIsSaving(true);
    setSaveMessage('Enviando foto...');

    const formData = new FormData();
    formData.append('foto', file);

    try {
      // Faz o upload do arquivo para a nova rota '/upload'
      const uploadResponse = await api.post('/evidencias/upload', formData);
      const { url } = uploadResponse.data;

      if (!url) {
        toast.error('Upload não retornou uma URL válida.');
        return;
      }

      // Atualiza o estado local de fotos com a URL retornada
      setFotos((prev) => {
        const fotosAtuais = prev[perguntaId] || [];
        return { ...prev, [perguntaId]: [...fotosAtuais, url] };
      });

      toast.success('Foto enviada e pronta para ser salva!');

    } catch (error) {
      const errorMessage = error.response && error.response.data && error.response.data.mensagem
        ? error.response.data.mensagem
        : 'Erro no upload da foto.';
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
      setSaveMessage('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveFoto = async (perguntaId, fotoIndex) => {
    setIsSaving(true);

    const fotosAtuaisDoEstado = fotos[perguntaId] || [];
    const fotoCaminhoParaDeletar = fotosAtuaisDoEstado[fotoIndex];

    setFotos((prev) => {
      const fotosAtuais = prev[perguntaId] || [];
      const fotosAtualizadas = fotosAtuais.filter((_, index) => index !== fotoIndex);
      return { ...prev, [perguntaId]: fotosAtualizadas };
    });

    try {
      if (fotoCaminhoParaDeletar) {
        await api.delete('/evidencias/apagar', { data: { caminho: fotoCaminhoParaDeletar } });
        toast.success('Evidencia removida com sucesso.');
      } else {
        toast.warn('Caminho da foto não encontrado para remoção no servidor.');
      }
    } catch (error) {
      console.error('Erro ao deletar foto do servidor:', error);
      const errorMessage = error.response && error.response.data && error.response.data.mensagem
        ? error.response.data.mensagem
        : 'Falha ao remover a foto do servidor.';
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleObservacaoChange = (perguntaId, text) => {
    setObservacoes((prev) => ({ ...prev, [perguntaId]: text }));
  };

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_RESPOSTAS_KEY, JSON.stringify(respostas));
    } catch (error) {
      console.error('Erro ao salvar respostas no localStorage:', error);
    }
  }, [respostas]);

  useEffect(() => {
    try {
      localStorage.setItem(
        LOCAL_STORAGE_POSICAO_KEY,
        JSON.stringify({ activeTopicIndex, activeQuestionIndex })
      );
    } catch (error) {
      console.error('Erro ao salvar posição no localStorage:', error);
    }
  }, [activeTopicIndex, activeQuestionIndex]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_FOTOS_KEY, JSON.stringify(fotos));
    } catch (error) {
      console.error('Erro ao salvar fotos no localStorage:', error);
    }
  }, [fotos]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_OBSERVACOES_KEY, JSON.stringify(observacoes));
    } catch (error) {
      console.error('Erro ao salvar observacoes no localStorage:', error);
    }
  }, [observacoes]);

  useEffect(() => {
    const iniciarAuditoria = () => {
      try {
        const clienteStorage = localStorage.getItem('empresa-selecionada');
        if (clienteStorage) {
          const parsed = JSON.parse(clienteStorage);
          setEmpresaInfo(parsed.cliente);
          setAuditoriaInfo(parsed.auditoria);
        }
      } catch (err) {
        console.error('Erro ao iniciar auditoria:', err);
      }
    };
    iniciarAuditoria();

    const fetchTopicos = async () => {
      try {
        const response = await api.get('/topicos/com-perguntas');
        setTopicos(response.data);
      } catch (error) {
        console.error('Erro ao buscar tópicos:', error);
        setSaveMessage('Erro ao carregar tópicos. Tente novamente.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchTopicos();
  }, []);

  const handleRespostaChange = (perguntaId, valor) => {
    setRespostas((prev) => ({
      ...prev,
      [perguntaId]: valor,
    }));
  };

  const handleSubmitAudit = async () => {
    setIsSaving(true);
    setSaveMessage('Salvando auditoria...');

    try {
      const clienteStorage = localStorage.getItem('empresa-selecionada');
      if (clienteStorage) {
        const parsed = JSON.parse(clienteStorage);
        if (parsed?.cliente?.id) {
          idClienteFinal = parsed.cliente.id;
        }
      }

      const payload = {
        auditoriaData: {
          id_usuario: idUsuarioExemplo,
          id_cliente: idClienteFinal,
          observacao: auditoriaInfo.observacao_geral,
          dt_auditoria: new Date().toISOString().split('T')[0],
        },
        respostas: Object.keys(respostas).map((perguntaId) => ({
          id_pergunta: parseInt(perguntaId),
          st_pergunta: respostas[perguntaId],
          comentario: observacoes[perguntaId] || '',
          fotos: fotos[perguntaId] || [],
        })),
      };

      await api.post('/auditorias', payload);

      setSaveMessage('Auditoria salva com sucesso!');

      localStorage.removeItem(LOCAL_STORAGE_RESPOSTAS_KEY);
      localStorage.removeItem(LOCAL_STORAGE_POSICAO_KEY);
      localStorage.removeItem(LOCAL_STORAGE_FOTOS_KEY);
      localStorage.removeItem(LOCAL_STORAGE_OBSERVACOES_KEY);
      localStorage.removeItem(EMPRESA_SELECIONADA);

    } catch (error) {
      console.error('Erro ao salvar auditoria:', error);
      setSaveMessage('Erro ao salvar auditoria. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleNext = () => {
    const currentTopic = topicos[activeTopicIndex];
    const totalQuestionsInTopic = currentTopic.perguntas.length;
    const isLastQuestionInTopic = activeQuestionIndex === totalQuestionsInTopic - 1;
    const isLastTopic = activeTopicIndex === topicos.length - 1;

    if (isLastQuestionInTopic && isLastTopic) {
      handleSubmitAudit();
    } else if (activeQuestionIndex < totalQuestionsInTopic - 1) {
      setActiveQuestionIndex((prev) => prev + 1);
    } else if (activeTopicIndex < topicos.length - 1) {
      setActiveTopicIndex((prev) => prev + 1);
      setActiveQuestionIndex(0);
    }
  };

  const handleBack = () => {
    if (activeQuestionIndex > 0) {
      setActiveQuestionIndex((prev) => prev - 1);
    } else if (activeTopicIndex > 0) {
      setActiveTopicIndex((prev) => prev - 1);
      const prevTopic = topicos[activeTopicIndex - 1];
      setActiveQuestionIndex(prevTopic.perguntas.length - 1);
    }
  };

  const currentTopic = useMemo(
    () => topicos[activeTopicIndex],
    [topicos, activeTopicIndex]
  );
  const currentQuestion = useMemo(
    () => currentTopic?.perguntas[activeQuestionIndex],
    [currentTopic, activeQuestionIndex]
  );

  const progressoGeral = useMemo(() => {
    const totalPerguntasGeral = topicos.reduce(
      (total, topico) => total + (topico.perguntas?.length || 0),
      0
    );
    const totalPerguntasRespondidas = Object.keys(respostas).length;
    return totalPerguntasGeral > 0
      ? Math.round((totalPerguntasRespondidas / totalPerguntasGeral) * 100)
      : 0;
  }, [topicos, respostas]);

  const progressoDoTopico = useMemo(() => {
    const perguntasDoTopico = currentTopic?.perguntas || [];
    const perguntasRespondidasDoTopico = perguntasDoTopico.filter(
      (pergunta) => respostas[pergunta.id]
    ).length;
    return perguntasDoTopico.length > 0
      ? Math.round((perguntasRespondidasDoTopico / perguntasDoTopico.length) * 100)
      : 0;
  }, [currentTopic, respostas]);

  const resultadoParcialTopico = useMemo(() => {
    if (!currentTopic || !respostas) {
      return null;
    }
    const perguntasDoTopico = currentTopic.perguntas || [];
    const respostasDoTopico = perguntasDoTopico.filter((p) => respostas[p.id]);

    if (respostasDoTopico.length === 0) {
      return null;
    }

    const conformes = respostasDoTopico.filter(
      (p) => respostas[p.id] === 'CF'
    ).length;
    const conformidadeParcial = respostasDoTopico.filter(
      (p) => respostas[p.id] === 'PC'
    ).length;
    const totalPontos = conformes + conformidadeParcial * 0.5;

    const percentual = Math.round((totalPontos / respostasDoTopico.length) * 100);

    let classificacao = '';
    let cor = '';

    if (percentual >= 80) {
      classificacao = 'Processos Satisfatórios';
      cor = 'var(--success-color)';
    } else if (percentual >= 50) {
      classificacao = 'Processos que podem gerar riscos';
      cor = 'var(--warning-color)';
    } else {
      classificacao = 'Processos Inaceitáveis';
      cor = 'var(--error-color)';
    }

    return { percentual, classificacao, cor };
  }, [currentTopic, respostas]);

  const isLastQuestion = useMemo(
    () => activeQuestionIndex === currentTopic?.perguntas.length - 1,
    [activeQuestionIndex, currentTopic]
  );
  const isLastTopic = useMemo(
    () => activeTopicIndex === topicos.length - 1,
    [activeTopicIndex, topicos]
  );

  const buttonText = isLastQuestion && isLastTopic ? 'Enviar' : 'Avançar';
  const isButtonDisabled = !respostas[currentQuestion?.id] || isSaving;

  return {
    topicos,
    respostas,
    isLoading,
    isSaving,
    saveMessage,
    activeTopicIndex,
    activeQuestionIndex,
    currentTopic,
    currentQuestion,
    progressoGeral,
    progressoDoTopico,
    resultadoParcialTopico,
    buttonText,
    isButtonDisabled,
    empresaInfo,
    auditoriaInfo,
    fotos,
    observacoes,
    fileInputRef,
    handleNext,
    handleBack,
    handleRespostaChange,
    handleFotoChange,
    handleObservacaoChange,
    handleRemoveFoto,
  };
};