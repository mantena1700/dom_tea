'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    PlayCircle,
    StopCircle,
    Clock,
    Target,
    Check,
    X,
    Pause,
    ChevronRight,
    Zap,
    RotateCcw
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
            setPrograms(programsData?.filter(p => p.active !== false) || []);
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
            setConsecutiveCorrect(0);
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
            setTrials([]);
            clearInterval(timerRef.current);
        } catch (error) {
            console.error('Erro ao finalizar sessão:', error);
        }
    };

    const handleTrialResponse = async (result) => {
        if (!selectedProgram || !currentSession) return;

        setLastResult(result);
        setTimeout(() => setLastResult(null), 500);

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

                if (newStreak >= 3 && newStreak % 3 === 0) {
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
        const programTrials = trials.filter(t => t.programId === selectedProgram?.id);
        const total = programTrials.length;
        const correct = programTrials.filter(t => t.result === TrialResult.CORRECT).length;
        const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
        return { total, correct, accuracy };
    };

    const stats = getCurrentStats();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-blue-200 dark:border-blue-900 border-t-blue-600 rounded-full animate-spin" />
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Carregando...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto px-4 py-4 pb-24 lg:pb-6 min-h-screen">

            {/* === CELEBRAÇÃO === */}
            <AnimatePresence>
                {showCelebration && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
                    >
                        <div className="text-center">
                            <motion.div
                                animate={{ rotate: [0, -15, 15, -10, 10, 0], scale: [1, 1.2, 1] }}
                                transition={{ duration: 0.6 }}
                                className="text-8xl mb-4"
                            >
                                🎉
                            </motion.div>
                            <h2 className="text-3xl font-bold text-white mb-2">Excelente!</h2>
                            <p className="text-white/80 text-lg">{consecutiveCorrect} acertos seguidos!</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* === HEADER DA SESSÃO ATIVA === */}
            {sessionActive && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 rounded-2xl p-4 mb-5 text-white shadow-lg shadow-blue-600/20"
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <Clock size={20} className="opacity-80" />
                                <span className="text-3xl font-mono font-bold tracking-tight">{formatTime(sessionTime)}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-5">
                            <div className="text-center">
                                <div className="font-bold text-xl">{trials.length}</div>
                                <div className="text-white/70 text-xs">Tentativas</div>
                            </div>
                            <div className="text-center">
                                <div className="font-bold text-xl">{stats.accuracy}%</div>
                                <div className="text-white/70 text-xs">Acerto</div>
                            </div>
                            <button
                                onClick={handleEndSession}
                                className="p-2.5 rounded-xl bg-white/20 hover:bg-white/30 active:bg-white/40 transition-colors"
                            >
                                <StopCircle size={24} />
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* === SESSÃO NÃO ATIVA === */}
            {!sessionActive && (
                <div className="space-y-6">
                    <PageHeader
                        title="Nova Sessão"
                        subtitle="Inicie uma sessão de treino ABA"
                    />

                    {programs.length === 0 ? (
                        <EmptyState
                            icon={Target}
                            title="Nenhum programa ativo"
                            description="Você precisa ter programas ativos para iniciar uma sessão de treino."
                        />
                    ) : (
                        <>
                            <motion.div whileTap={{ scale: 0.98 }}>
                                <Button
                                    onClick={handleStartSession}
                                    size="lg"
                                    className="w-full py-6 text-lg"
                                >
                                    <PlayCircle size={26} />
                                    Iniciar Sessão
                                </Button>
                            </motion.div>

                            <div>
                                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
                                    {programs.length} Programa{programs.length !== 1 ? 's' : ''} Disponíve{programs.length !== 1 ? 'is' : 'l'}
                                </h3>
                                <div className="space-y-2.5">
                                    {programs.map(program => (
                                        <Card key={program.id} className="p-3.5" hover={false}>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <Badge variant={
                                                        program.category === 'MAND' ? 'primary' :
                                                            program.category === 'TACT' ? 'success' :
                                                                program.category === 'RECEPTIVO' ? 'warning' : 'neutral'
                                                    } size="sm">
                                                        {program.category || 'Geral'}
                                                    </Badge>
                                                    <span className="font-medium text-slate-800 dark:text-white">{program.name}</span>
                                                </div>
                                                <span className="text-xs text-slate-400 dark:text-slate-500">
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

            {/* === SESSÃO ATIVA === */}
            {sessionActive && (
                <div className="space-y-5">

                    {/* SELEÇÃO DE PROGRAMA */}
                    {!selectedProgram && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            <h3 className="font-semibold text-slate-800 dark:text-white mb-3 text-lg">
                                Selecione um Programa
                            </h3>
                            <div className="grid grid-cols-1 gap-2.5">
                                {programs.map(program => (
                                    <motion.button
                                        key={program.id}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => setSelectedProgram(program)}
                                        className="p-4 rounded-xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-left hover:border-blue-400 dark:hover:border-blue-500 active:border-blue-500 transition-all shadow-sm"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <Badge variant={
                                                    program.category === 'MAND' ? 'primary' :
                                                        program.category === 'TACT' ? 'success' :
                                                            program.category === 'RECEPTIVO' ? 'warning' : 'neutral'
                                                } size="sm">
                                                    {program.category || 'Geral'}
                                                </Badge>
                                                <h4 className="font-semibold text-slate-800 dark:text-white mt-2">{program.name}</h4>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">{program.description}</p>
                                            </div>
                                            <ChevronRight className="text-slate-400" />
                                        </div>
                                    </motion.button>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* INTERFACE DE REGISTRO */}
                    {selectedProgram && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-5"
                        >
                            {/* Programa Atual */}
                            <Card className="p-4" hover={false}>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <Badge variant="primary" size="sm">{selectedProgram.category || 'Geral'}</Badge>
                                        <h4 className="font-bold text-slate-800 dark:text-white mt-1.5 text-lg">{selectedProgram.name}</h4>
                                    </div>
                                    <button
                                        onClick={() => setSelectedProgram(null)}
                                        className="flex items-center gap-1.5 text-sm text-blue-600 dark:text-blue-400 font-medium hover:underline"
                                    >
                                        <RotateCcw size={14} />
                                        Trocar
                                    </button>
                                </div>

                                <div className="mt-4">
                                    <ProgressBar
                                        value={stats.accuracy}
                                        max={100}
                                        color={stats.accuracy >= 80 ? "success" : stats.accuracy >= 50 ? "warning" : "primary"}
                                        size="md"
                                    />
                                    <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mt-2">
                                        <span>{stats.correct}/{stats.total} corretas</span>
                                        <span className="font-semibold">{stats.accuracy}% de acerto</span>
                                    </div>
                                </div>
                            </Card>

                            {/* Streak */}
                            {consecutiveCorrect > 0 && (
                                <motion.div
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="flex items-center justify-center gap-2 py-2 px-4 bg-amber-100 dark:bg-amber-900/30 rounded-xl"
                                >
                                    <Zap size={20} className="text-amber-600 dark:text-amber-400" />
                                    <span className="font-bold text-amber-700 dark:text-amber-300">{consecutiveCorrect} acertos seguidos!</span>
                                </motion.div>
                            )}

                            {/* Feedback Visual */}
                            <AnimatePresence>
                                {lastResult && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.6 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.6 }}
                                        className={`
                                            fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40
                                            w-36 h-36 rounded-full flex items-center justify-center shadow-2xl
                                            ${lastResult === TrialResult.CORRECT ? 'bg-emerald-500' : 'bg-red-500'}
                                        `}
                                    >
                                        {lastResult === TrialResult.CORRECT
                                            ? <Check size={72} className="text-white" strokeWidth={3} />
                                            : <X size={72} className="text-white" strokeWidth={3} />
                                        }
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* === BOTÕES DE RESPOSTA === */}
                            <div className="space-y-3">
                                <h3 className="text-center font-semibold text-slate-600 dark:text-slate-300">
                                    Registrar Resposta
                                </h3>

                                {/* BOTÃO CORRETO */}
                                <motion.button
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleTrialResponse(TrialResult.CORRECT)}
                                    className="w-full py-10 rounded-2xl bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white font-bold text-2xl shadow-lg shadow-emerald-500/30 hover:shadow-xl transition-all flex items-center justify-center gap-3"
                                >
                                    <Check size={36} strokeWidth={3} />
                                    CORRETO
                                </motion.button>

                                {/* INCORRETO E SEM RESPOSTA */}
                                <div className="grid grid-cols-2 gap-3">
                                    <motion.button
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => handleTrialResponse(TrialResult.INCORRECT)}
                                        className="py-7 rounded-2xl bg-red-500 hover:bg-red-600 active:bg-red-700 text-white font-bold text-lg shadow-lg shadow-red-500/30 transition-all flex items-center justify-center gap-2"
                                    >
                                        <X size={26} strokeWidth={3} />
                                        Incorreto
                                    </motion.button>

                                    <motion.button
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => handleTrialResponse(TrialResult.NO_RESPONSE)}
                                        className="py-7 rounded-2xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 active:bg-slate-400 dark:active:bg-slate-500 text-slate-700 dark:text-white font-bold text-lg border-2 border-slate-300 dark:border-slate-600 transition-all flex items-center justify-center gap-2"
                                    >
                                        <Pause size={26} />
                                        Sem Resp.
                                    </motion.button>
                                </div>
                            </div>

                            {/* HISTÓRICO RECENTE */}
                            {trials.filter(t => t.programId === selectedProgram.id).length > 0 && (
                                <div className="pt-4">
                                    <h4 className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-3">Últimas tentativas</h4>
                                    <div className="flex gap-1.5 flex-wrap">
                                        {trials.filter(t => t.programId === selectedProgram.id).slice(-15).map((trial, idx) => (
                                            <motion.div
                                                key={idx}
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                className={`
                                                    w-9 h-9 rounded-lg flex items-center justify-center text-white text-sm font-bold
                                                    ${trial.result === TrialResult.CORRECT
                                                        ? 'bg-emerald-500'
                                                        : trial.result === TrialResult.INCORRECT
                                                            ? 'bg-red-500'
                                                            : 'bg-slate-400 dark:bg-slate-500'
                                                    }
                                                `}
                                            >
                                                {trial.result === TrialResult.CORRECT ? '✓' : trial.result === TrialResult.INCORRECT ? '✗' : '–'}
                                            </motion.div>
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
