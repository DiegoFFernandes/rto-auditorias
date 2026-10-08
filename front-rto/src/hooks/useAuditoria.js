import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

import api from '../api/api';
import {
    calcularPercentualTopico,
    nivelDoPercentual,
    NIVEL_SATISFATORIO,
    NIVEL_RISCO,
    NIVEL_INACEITAVEL,
} from '../utils/classificacao';

const CLASSIFICACAO_PARCIAL = {
    [NIVEL_SATISFATORIO]: { classificacao: 'Satisfatório', cor: 'var(--success-color)' },
    [NIVEL_RISCO]: { classificacao: 'Risco', cor: 'var(--warning-color)' },
    [NIVEL_INACEITAVEL]: { classificacao: 'Crítico', cor: 'var(--error-color)' },
};


export const useAuditoria = () => {
    const navigate = useNavigate();
    const { id: auditIdFromUrl } = useParams();
    const debounceTimeoutRef = useRef(null);

    const [topicos, setTopicos] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState('');
    const [empresaInfo, setEmpresaInfo] = useState(null);
    const [auditoriaInfo, setAuditoriaInfo] = useState(null);
    const [currentAuditId, setCurrentAuditId] = useState(auditIdFromUrl ? parseInt(auditIdFromUrl) : null);

    const [respostas, setRespostas] = useState({});
    const [fotos, setFotos] = useState({});
    const [observacoes, setObservacoes] = useState({});
    const [activeTopicIndex, setActiveTopicIndex] = useState(0);
    const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
    const [showFinalizeModal, setShowFinalizeModal] = useState(false);

    const fileInputRef = useRef(null);
    const isSavingRef = useRef(false);
    const saveQueue = useRef(Promise.resolve());
    const respostasRef = useRef(respostas);
    const observacoesRef = useRef(observacoes);
    const fotosRef = useRef(fotos);

    useEffect(() => {
        respostasRef.current = respostas;
        observacoesRef.current = observacoes;
        fotosRef.current = fotos;
    }, [respostas, observacoes, fotos]);


    const fetchAuditData = useCallback(async (auditId) => {
        setIsLoading(true);
        try {
            const response = await api.get(`/auditorias/listar/${auditId}`);
            const { topicos: fetchedTopicos, respostas: fetchedRespostas, auditoriaInfo: fetchedAuditoriaInfo, clienteInfo: fetchedClienteInfo, fotos: fetchedFotos, observacoes: fetchedObservacoes } = response.data;

            if (!fetchedAuditoriaInfo || !fetchedTopicos) {
                toast.error("Dados da auditoria inválidos recebidos do servidor.");
                navigate('/listar-auditorias');
                return;
            }

            if (fetchedAuditoriaInfo.st_auditoria === 'F') {
                toast.warn("Esta auditoria já foi finalizada.");
                navigate('/listar-auditorias');
                return;
            }

            if (fetchedAuditoriaInfo.st_auditoria === 'C') {
                toast.warn("Esta auditoria foi cancelada.");
                navigate('/listar-auditorias');
                return;
            }

            setTopicos(fetchedTopicos || []);
            setRespostas(fetchedRespostas || {});
            setAuditoriaInfo(fetchedAuditoriaInfo);
            setEmpresaInfo(fetchedClienteInfo);
            setFotos(fetchedFotos || {});
            setObservacoes(fetchedObservacoes || {});
            setCurrentAuditId(auditId);

        } catch (error) {
            console.error(`Erro ao buscar dados da auditoria ${auditId}:`, error);
            toast.error(error.response?.data?.mensagem || "Falha ao carregar dados da auditoria.");
            navigate('/listar-auditorias');
        } finally {
            setIsLoading(false);
        }
    }, [navigate]);

    useEffect(() => {
        if (auditIdFromUrl) {
            fetchAuditData(parseInt(auditIdFromUrl));
        } else {
            toast.error("ID da auditoria não encontrado na URL.");
            navigate('/');
        }
    }, [auditIdFromUrl, fetchAuditData, navigate]);


    const saveProgress = useCallback(async (perguntaId) => {
        if (!currentAuditId || isSavingRef.current) return;

        const currentStPergunta = respostasRef.current[perguntaId];

        if (!currentStPergunta) {
            console.warn(`Tentativa de salvar progresso para pergunta ${perguntaId} sem st_pergunta definido. Salvamento abortado.`);
            return;
        }

        isSavingRef.current = true;
        setIsSaving(true);
        setSaveMessage('Salvando...');


        const currentObservacao = observacoesRef.current[perguntaId] || '';
        const currentFotos = fotosRef.current[perguntaId] || [];

        const payload = {
            id_pergunta: perguntaId,
            st_pergunta: currentStPergunta,
            comentario: currentObservacao,
            fotos: currentFotos,
        };

        try {
            await api.patch(`/auditorias/progresso/${currentAuditId}`, payload);
            setSaveMessage('Salvo!');
            setTimeout(() => setSaveMessage(''), 1500);
        } catch (error) {
            console.error('Erro ao salvar progresso:', error);
            setSaveMessage('Erro ao salvar.');
            toast.error(error.response?.data?.mensagem || 'Falha ao salvar o progresso.');
            setTimeout(() => setSaveMessage(''), 3000);
        } finally {
            setIsSaving(false);
            isSavingRef.current = false;
        }
    }, [currentAuditId]);

    const queuedSaveProgress = useCallback((perguntaId) => {
        saveQueue.current = saveQueue.current.then(() => saveProgress(perguntaId));
        return saveQueue.current;
    }, [saveProgress]);


    const handleRespostaChange = (perguntaId, valor) => {
        setRespostas((prev) => {
            const newState = { ...prev, [perguntaId]: valor };
            respostasRef.current = newState;
            queuedSaveProgress(perguntaId);
            return newState;
        });
    };

    const handleObservacaoChange = (perguntaId, text) => {
        setObservacoes((prev) => {
            const newState = { ...prev, [perguntaId]: text };
            observacoesRef.current = newState;
            return newState;
        });

        if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current);
        }

        debounceTimeoutRef.current = setTimeout(() => {
            queuedSaveProgress(perguntaId);
        }, 1000);
    };

    useEffect(() => {
        return () => {
            if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current);
            }
        };
    }, []);

    const handleFotoChange = async (perguntaId, file) => {
        if (!currentAuditId || isSavingRef.current) return;

        if (!respostasRef.current[perguntaId]) {
            toast.warn("Selecione uma resposta (Conforme, Não Conforme, etc.) antes de adicionar fotos.");
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
            return;
        }


        isSavingRef.current = true;
        setIsSaving(true);
        setSaveMessage('Enviando foto...');

        const formDataApi = new FormData();
        formDataApi.append('foto', file);


        try {
            const uploadResponse = await api.post('/evidencias/upload', formDataApi);
            const { url } = uploadResponse.data;

            if (!url) {
                throw new Error('Upload não retornou uma URL válida.');
            }

            setFotos((prev) => {
                const fotosAtuais = prev[perguntaId] || [];
                const newState = { ...prev, [perguntaId]: [...fotosAtuais, url] };
                fotosRef.current = newState;
                queuedSaveProgress(perguntaId);
                return newState;
            });
            toast.success('Foto adicionada!');

        } catch (error) {
            const errorMessage = error.response?.data?.mensagem || 'Erro no upload da foto.';
            toast.error(errorMessage);
        } finally {
            setIsSaving(false);
            setSaveMessage('');
            isSavingRef.current = false;
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };


    const handleRemoveFoto = async (perguntaId, fotoIndex) => {
        if (!currentAuditId || isSavingRef.current) return;

        isSavingRef.current = true;
        setIsSaving(true);
        setSaveMessage('Removendo foto...');

        const fotosAtuaisDoEstado = fotosRef.current[perguntaId] || [];
        const fotoCaminhoParaDeletar = fotosAtuaisDoEstado[fotoIndex];

        if (fotoCaminhoParaDeletar) {
            try {
                await api.delete('/evidencias/apagar', { data: { caminho: fotoCaminhoParaDeletar } });

                setFotos((prev) => {
                    const fotosFiltradas = (prev[perguntaId] || []).filter((_, index) => index !== fotoIndex);
                    const newState = { ...prev, [perguntaId]: fotosFiltradas };
                    fotosRef.current = newState;
                    queuedSaveProgress(perguntaId);
                    return newState;
                });
                toast.success('Foto removida com sucesso.');
            } catch (error) {
                console.error('Erro ao deletar foto:', error);
                const errorMessage = error.response?.data?.mensagem || 'Falha ao remover a foto.';
                toast.error(errorMessage);
            } finally {
                setIsSaving(false);
                setSaveMessage('');
                isSavingRef.current = false;
            }
        } else {
            toast.warn('Caminho da foto não encontrado.');
            setIsSaving(false);
            setSaveMessage('');
            isSavingRef.current = false;
        }
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleFinalSubmit = async () => {
        if (!currentAuditId || isSavingRef.current) return;

        setShowFinalizeModal(false);

        isSavingRef.current = true;
        setIsSaving(true);
        setSaveMessage('Finalizando auditoria...');

        try {
            await saveQueue.current;
            await api.put(`/auditorias/finalizar/${currentAuditId}`);
            setSaveMessage('Auditoria finalizada com sucesso!');
            setIsSaving(false);
            isSavingRef.current = false;

        } catch (error) {
            console.error('Erro ao finalizar auditoria:', error);
            setSaveMessage(error.response?.data?.mensagem || 'Erro ao finalizar auditoria.');
            setTimeout(() => setSaveMessage(''), 3000);
            setIsSaving(false);
            isSavingRef.current = false;
        }
    };


    const handleNext = async () => {
        if (isSavingRef.current) {
            toast.info('Aguarde o salvamento anterior...');
            return;
        }

        const currentTopic = topicos[activeTopicIndex];
        if (!currentTopic || !currentTopic.perguntas) return;
        const totalQuestionsInTopic = currentTopic.perguntas.length;

        const isLastQuestionInTopic = activeQuestionIndex === totalQuestionsInTopic - 1;
        const isLastTopic = activeTopicIndex === topicos.length - 1;

        if (isLastQuestionInTopic && isLastTopic) {
            setShowFinalizeModal(true);
            return;
        } else if (activeQuestionIndex < totalQuestionsInTopic - 1) {
            setActiveQuestionIndex((prev) => prev + 1);
        } else if (activeTopicIndex < topicos.length - 1) {
            setActiveTopicIndex((prev) => prev + 1);
            setActiveQuestionIndex(0);
        }
    };


    const handleBack = async () => {
        if (isSavingRef.current) {
            toast.info('Aguarde o salvamento anterior...');
            return;
        }

        if (activeQuestionIndex > 0) {
            setActiveQuestionIndex((prev) => prev - 1);
        } else if (activeTopicIndex > 0) {
            setActiveTopicIndex((prev) => prev - 1);
            const prevTopic = topicos[activeTopicIndex - 1];
            setActiveQuestionIndex(prevTopic.perguntas.length - 1);
        }
    };

    const currentTopic = useMemo(() => topicos[activeTopicIndex], [topicos, activeTopicIndex]);
    const currentQuestion = useMemo(() => currentTopic?.perguntas[activeQuestionIndex], [currentTopic, activeQuestionIndex]);

    const progressoGeral = useMemo(() => {
        const totalPerguntasGeral = topicos.reduce((total, topico) => total + (topico.perguntas?.length || 0), 0);
        const totalPerguntasRespondidas = Object.keys(respostas).filter(key => respostas[key]).length;
        return totalPerguntasGeral > 0 ? Math.round((totalPerguntasRespondidas / totalPerguntasGeral) * 100) : 0;
    }, [topicos, respostas]);


    const progressoDoTopico = useMemo(() => {
        if (!currentTopic || !currentTopic.perguntas) return 0;
        const perguntasDoTopico = currentTopic.perguntas;
        const perguntasRespondidasDoTopico = perguntasDoTopico.filter(pergunta => respostas[pergunta.id]).length;
        return perguntasDoTopico.length > 0 ? Math.round((perguntasRespondidasDoTopico / perguntasDoTopico.length) * 100) : 0;
    }, [currentTopic, respostas]);


    const resultadoParcialTopico = useMemo(() => {
        if (!currentTopic || !respostas || !currentTopic.perguntas) return null;

        const percentual = calcularPercentualTopico(currentTopic.perguntas, respostas);
        if (percentual === null) return null;

        const nivel = nivelDoPercentual(percentual);
        const { classificacao, cor } = CLASSIFICACAO_PARCIAL[nivel];

        return { percentual, classificacao, cor };
    }, [currentTopic, respostas]);


    const isLastQuestion = useMemo(() => activeQuestionIndex === (currentTopic?.perguntas?.length ?? 0) - 1, [activeQuestionIndex, currentTopic]);
    const isLastTopic = useMemo(() => activeTopicIndex === topicos.length - 1, [activeTopicIndex, topicos]);

    const buttonText = isLastQuestion && isLastTopic ? 'Finalizar' : 'Avançar';
    const isButtonDisabled = !respostas[currentQuestion?.id] || isSaving;

    const confirmFinalize = () => handleFinalSubmit();
    const cancelFinalize = () => setShowFinalizeModal(false);

    return {
        topicos, respostas, isLoading, isSaving, saveMessage, activeTopicIndex,
        activeQuestionIndex, currentTopic, currentQuestion, progressoGeral, progressoDoTopico,
        resultadoParcialTopico, buttonText, isButtonDisabled, empresaInfo, auditoriaInfo,
        fotos, observacoes, fileInputRef, currentAuditId, showFinalizeModal,
        handleNext, handleBack, handleRespostaChange, handleFotoChange, handleObservacaoChange, handleRemoveFoto,
        confirmFinalize, cancelFinalize,
    };
};
