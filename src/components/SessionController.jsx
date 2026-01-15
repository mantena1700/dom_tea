'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    PlayCircle,
    StopCircle,
    Clock,
    Target,
    Check,
    X,
    Pause,
    AlertCircle,
    ChevronRight,
    RotateCcw,
    Volume2,
    Star,
    Zap
} from 'lucide-react';
import {
    Card,
    Badge,
    Button,
    ProgressBar,
    PageHeader,
    EmptyState
} from '@/components/ui';
import {
    getPrograms,
    startSession,
    endSession,
    addTrial,
} from '@/lib/dataService';

const TrialResult = {
    CORRECT: 'correct',
    INCORRECT: 'incorrect',
    NO_RESPONSE: 'no_response',
};

export default function SessionController() {
    // Estados principais
    const [loading, setLoading] = useState(true);
    const [programs, setPrograms] = useState([]);
    const [sessionActive, setSessionActive] = useState(false);
    const [currentSession, setCurrentSession] = useState(null);
    const [selectedProgram, setSelectedProgram] = useState(null);

    // Contadores
    const [sessionTime, setSessionTime] = useState(0);
    const [trials, setTrials] = useState([]);
    const [consecutiveCorrect, setConsecutiveCorrect] = useState(0);

    // Feedback
    const [showCelebration, setShowCelebration] = useState(false);
    const [lastResult, setLastResult] = useState(null);

    // Timer
    const timerRef = useRef(null);

    useEffect(() => {
        loadData();
        return () => clearInterval(timerRef.current);
    }, []);

    // Timer da sessão
    useEffect(() => {
        if (sessionActive) {
            timerRef.current = setInterval(() => {
                setSessionTime(prev => prev + 1);
            }, 1000);
        }
        return () => clearInterval(timerRef.current);
    }, [sessionActive]);

    const loadData = async () => {
        try {
            const programsData = await getPrograms();
            setPrograms(programsData?.filter(p => p.active) || []);
        } catch (error) {
            console.error('Erro ao carregar programas:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleStartSession = async () => {
        try {
            const session = await startSession();
            setCurrentSession(session);
            setSessionActive(true);
            setSessionTime(0);
            setTrials([]);
        } catch (error) {
            console.error('Erro ao iniciar sessão:', error);
        }
    };

    const handleEndSession = async () => {
        try {
            if (currentSession?.id) {
                await endSession(currentSession.id, {
                    trialsCount: trials.length,
                    correctCount: trials.filter(t => t.result === TrialResult.CORRECT).length
                });
            }
            setSessionActive(false);
            setCurrentSession(null);
            setSelectedProgram(null);
            clearInterval(timerRef.current);
        } catch (error) {
            console.error('Erro ao finalizar sessão:', error);
        }
    };

    const handleTrialResponse = async (result) => {
        if (!selectedProgram || !currentSession) return;

        setLastResult(result);
        setTimeout(() => setLastResult(null), 600);

        const trial = {
            sessionId: currentSession.id,
            programId: selectedProgram.id,
            result,
            timestamp: new Date().toISOString(),
        };

        try {
            await addTrial(trial);
            setTrials(prev => [...prev, trial]);

            if (result === TrialResult.CORRECT) {
                const newStreak = consecutiveCorrect + 1;
                setConsecutiveCorrect(newStreak);

                if (newStreak >= 3) {
                    triggerCelebration();
                }
            } else {
                setConsecutiveCorrect(0);
            }
        } catch (error) {
            console.error('Erro ao registrar tentativa:', error);
        }
    };

    const triggerCelebration = () => {
        setShowCelebration(true);
        setTimeout(() => setShowCelebration(false), 1500);
    };

    const getCurrentStats = () => {
        const total = trials.filter(t => t.programId === selectedProgram?.id).length;
        const correct = trials.filter(t => t.programId === selectedProgram?.id && t.result === TrialResult.CORRECT).length;
        const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
        return { total, correct, accuracy };
    };

    const stats = getCurrentStats();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="w-10 h-10 border-4 border-[var(--primary-500)]/30 border-t-[var(--primary-500)] rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto px-4 py-4 min-h-screen">

            {/* Celebração */}
            <AnimatePresence>
                {showCelebration && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
                    >
                        <div className="text-center">
                            <motion.div
                                animate={{ rotate: [0, -10, 10, 0] }}
                                transition={{ repeat: 2, duration: 0.3 }}
                                className="text-8xl mb-4"
                            >
                                🎉
                            </motion.div>
                            <h2 className="text-2xl font-bold text-white">Excelente!</h2>
                            <p className="text-white/80">{consecutiveCorrect} acertos seguidos!</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header da Sessão */}
            {sessionActive && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-r from-[var(--primary-600)] to-[var(--primary-700)] rounded-2xl p-4 mb-4 text-white shadow-lg"
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <Clock size={20} />
                                <span className="text-2xl font-mono font-bold">{formatTime(sessionTime)}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                            <div className="text-center">
                                <div className="font-bold text-lg">{trials.length}</div>
                                <div className="text-white/70 text-xs">Tentativas</div>
                            </div>
                            <div className="text-center">
                                <div className="font-bold text-lg">{stats.accuracy}%</div>
                                <div className="text-white/70 text-xs">Acerto</div>
                            </div>
                        </div>
                        <button
                            onClick={handleEndSession}
                            className="p-2 rounded-xl bg-white/20 hover:bg-white/30 transition-colors"
                        >
                            <StopCircle size={24} />
                        </button>
                    </div>
                </motion.div>
            )}

            {/* Estado: Sessão NÃO ativa */}
            {!sessionActive && (
                <div className="space-y-6">
                    <PageHeader
                        title="Nova Sessão"
                        subtitle="Inicie uma sessão de treino"
                    />

                    {programs.length === 0 ? (
                        <EmptyState
                            icon={Target}
                            title="Nenhum programa ativo"
                            description="Você precisa ter programas ativos para iniciar uma sessão."
                        />
                    ) : (
                        <>
                            <Button
                                onClick={handleStartSession}
                                size="lg"
                                className="w-full py-5"
                            >
                                <PlayCircle size={24} />
                                Iniciar Sessão
                            </Button>

                            <div>
                                <h3 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-3">
                                    Programas Disponíveis
                                </h3>
                                <div className="space-y-2">
                                    {programs.map(program => (
                                        <Card key={program.id} className="p-3">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <Badge variant={
                                                        program.category === 'MAND' ? 'primary' :
                                                            program.category === 'TACT' ? 'success' :
                                                                program.category === 'RECEPTIVO' ? 'warning' : 'neutral'
                                                    } size="sm">
                                                        {program.category}
                                                    </Badge>
                                                    <span className="font-medium text-[var(--text-primary)]">{program.name}</span>
                                                </div>
                                                <span className="text-xs text-[var(--text-muted)]">
                                                    Meta: {program.targetAccuracy || 80}%
                                                </span>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* Estado: Sessão ATIVA */}
            {sessionActive && (
                <div className="space-y-4">

                    {/* Seleção de Programa */}
                    {!selectedProgram && (
                        <div>
                            <h3 className="font-semibold text-[var(--text-primary)] mb-3">
                                Selecione um Programa
                            </h3>
                            <div className="grid grid-cols-1 gap-2">
                                {programs.map(program => (
                                    <motion.button
                                        key={program.id}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => setSelectedProgram(program)}
                                        className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-default)] text-left hover:border-[var(--primary-500)] transition-all"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <Badge variant={
                                                    program.category === 'MAND' ? 'primary' :
                                                        program.category === 'TACT' ? 'success' :
                                                            program.category === 'RECEPTIVO' ? 'warning' : 'neutral'
                                                } size="sm">
                                                    {program.category}
                                                </Badge>
                                                <h4 className="font-semibold text-[var(--text-primary)] mt-2">{program.name}</h4>
                                                <p className="text-xs text-[var(--text-tertiary)] mt-0.5">{program.description}</p>
                                            </div>
                                            <ChevronRight className="text-[var(--text-muted)]" />
                                        </div>
                                    </motion.button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Interface de Registro de Tentativas */}
                    {selectedProgram && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="space-y-4"
                        >
                            {/* Programa atual */}
                            <Card className="p-3">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <Badge variant="primary" size="sm">{selectedProgram.category}</Badge>
                                        <h4 className="font-bold text-[var(--text-primary)] mt-1">{selectedProgram.name}</h4>
                                    </div>
                                    <button
                                        onClick={() => setSelectedProgram(null)}
                                        className="text-sm text-[var(--primary-500)] font-medium"
                                    >
                                        Trocar
                                    </button>
                                </div>

                                <div className="mt-3">
                                    <ProgressBar
                                        value={stats.accuracy}
                                        max={100}
                                        color={stats.accuracy >= 80 ? "success" : stats.accuracy >= 50 ? "warning" : "primary"}
                                    />
                                    <div className="flex justify-between text-xs text-[var(--text-muted)] mt-1">
                                        <span>{stats.correct}/{stats.total} corretas</span>
                                        <span>{stats.accuracy}% de acerto</span>
                                    </div>
                                </div>
                            </Card>

                            {/* Streak */}
                            {consecutiveCorrect > 0 && (
                                <div className="flex items-center justify-center gap-2 text-[var(--warning-600)]">
                                    <Zap size={18} />
                                    <span className="font-bold">{consecutiveCorrect} acertos seguidos!</span>
                                </div>
                            )}

                            {/* Feedback Visual do Último Resultado */}
                            <AnimatePresence>
                                {lastResult && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.8 }}
                                        className={`
                                            fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40
                                            w-32 h-32 rounded-full flex items-center justify-center
                                            ${lastResult === TrialResult.CORRECT
                                                ? 'bg-[var(--success-500)]'
                                                : 'bg-[var(--error-500)]'
                                            }
                                        `}
                                    >
                                        {lastResult === TrialResult.CORRECT
                                            ? <Check size={64} className="text-white" />
                                            : <X size={64} className="text-white" />
                                        }
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* BOTÕES DE RESPOSTA - GRANDES PARA TOUCH */}
                            <div className="mt-6 space-y-3">
                                <h3 className="text-center font-semibold text-[var(--text-secondary)] mb-4">
                                    Registrar Resposta
                                </h3>

                                {/* Botão CORRETO - Grande e Verde */}
                                <motion.button
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleTrialResponse(TrialResult.CORRECT)}
                                    className="w-full py-8 rounded-2xl bg-[var(--success-500)] hover:bg-[var(--success-600)] text-white font-bold text-xl shadow-lg shadow-[var(--success-500)]/30 transition-all flex items-center justify-center gap-3"
                                >
                                    <Check size={32} />
                                    CORRETO
                                </motion.button>

                                {/* Linha com Incorreto e Sem Resposta */}
                                <div className="grid grid-cols-2 gap-3">
                                    <motion.button
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => handleTrialResponse(TrialResult.INCORRECT)}
                                        className="py-6 rounded-2xl bg-[var(--error-500)] hover:bg-[var(--error-600)] text-white font-bold text-lg shadow-lg shadow-[var(--error-500)]/30 transition-all flex items-center justify-center gap-2"
                                    >
                                        <X size={24} />
                                        Incorreto
                                    </motion.button>

                                    <motion.button
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => handleTrialResponse(TrialResult.NO_RESPONSE)}
                                        className="py-6 rounded-2xl bg-[var(--bg-tertiary)] hover:bg-[var(--interactive-hover)] text-[var(--text-primary)] font-bold text-lg border border-[var(--border-default)] transition-all flex items-center justify-center gap-2"
                                    >
                                        <Pause size={24} />
                                        Sem Resp.
                                    </motion.button>
                                </div>
                            </div>

                            {/* Histórico Recente */}
                            {trials.filter(t => t.programId === selectedProgram.id).length > 0 && (
                                <div className="mt-6">
                                    <h4 className="text-sm font-semibold text-[var(--text-muted)] mb-2">Últimas tentativas</h4>
                                    <div className="flex gap-1.5 flex-wrap">
                                        {trials.filter(t => t.programId === selectedProgram.id).slice(-20).map((trial, idx) => (
                                            <div
                                                key={idx}
                                                className={`
                                                    w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold
                                                    ${trial.result === TrialResult.CORRECT
                                                        ? 'bg-[var(--success-500)]'
                                                        : trial.result === TrialResult.INCORRECT
                                                            ? 'bg-[var(--error-500)]'
                                                            : 'bg-[var(--neutral-400)]'
                                                    }
                                                `}
                                            >
                                                {trial.result === TrialResult.CORRECT ? '✓' : trial.result === TrialResult.INCORRECT ? '✗' : '–'}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}
                </div>
            )}
        </div>
    );
}
