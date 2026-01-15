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
    ChevronRight,
    ChevronLeft,
    Volume2,
    VolumeX,
    Award,
    Sparkles,
    RotateCcw,
    PauseCircle,
    Gift,
    MessageSquare,
    AlertCircle,
    Plus,
    History,
    Timer,
    Zap,
    Coffee,
} from 'lucide-react';
import {
    getPrograms,
    getPrompts,
    getReinforcers,
    startSession,
    endSession,
    addTrial,
    getActiveSession,
    getTrialsBySession,
    addBehaviorRecord,
    getBehaviors,
    getSettings,
    getPatient,
    addNote,
} from '@/lib/dataService';

const TrialResult = {
    CORRECT: 'correct',
    INCORRECT: 'incorrect',
    NO_RESPONSE: 'no_response',
};

export default function SessionController() {
    const [mounted, setMounted] = useState(false);
    const [session, setSession] = useState(null);
    const [programs, setPrograms] = useState([]);
    const [prompts, setPrompts] = useState([]);
    const [reinforcers, setReinforcers] = useState([]);
    const [behaviors, setBehaviors] = useState([]);
    const [settings, setSettings] = useState({});
    const [patient, setPatient] = useState(null);

    // Session state
    const [selectedProgram, setSelectedProgram] = useState(null);
    const [currentTrialIndex, setCurrentTrialIndex] = useState(0);
    const [sessionTrials, setSessionTrials] = useState([]);
    const [isPaused, setIsPaused] = useState(false);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [showProgramSelector, setShowProgramSelector] = useState(true);
    const [showReinforcer, setShowReinforcer] = useState(false);
    const [selectedReinforcer, setSelectedReinforcer] = useState(null);
    const [showCelebration, setShowCelebration] = useState(false);
    const [showBehaviorModal, setShowBehaviorModal] = useState(false);
    const [showNoteModal, setShowNoteModal] = useState(false);
    const [noteText, setNoteText] = useState('');
    const [selectedPrompt, setSelectedPrompt] = useState(null);
    const [sessionStats, setSessionStats] = useState({ correct: 0, total: 0 });

    // Task Timer State - NEW
    const [taskStartTime, setTaskStartTime] = useState(null);
    const [taskElapsedMs, setTaskElapsedMs] = useState(0);
    const [isTaskTimerRunning, setIsTaskTimerRunning] = useState(false);
    const [instructionGivenTime, setInstructionGivenTime] = useState(null);
    const [latencyMs, setLatencyMs] = useState(0);
    const [showTimeAlert, setShowTimeAlert] = useState(false);
    const [showFatigueAlert, setShowFatigueAlert] = useState(false);
    const [sessionTrialCount, setSessionTrialCount] = useState(0);
    const taskTimerRef = useRef(null);
    const timeAlertThreshold = 60000; // 60 seconds
    const fatigueThreshold = 15; // Show fatigue alert after 15 trials

    useEffect(() => {
        setMounted(true);
        loadData();

        // Check for active session
        const activeSession = getActiveSession();
        if (activeSession) {
            setSession(activeSession);
            setSessionTrials(getTrialsBySession(activeSession.id));
        }
    }, []);

    // Timer
    useEffect(() => {
        let interval;
        if (session && !isPaused) {
            interval = setInterval(() => {
                setElapsedTime((prev) => prev + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [session, isPaused]);

    // Task Timer Effect - NEW
    useEffect(() => {
        if (isTaskTimerRunning && taskStartTime) {
            taskTimerRef.current = setInterval(() => {
                const elapsed = Date.now() - taskStartTime;
                setTaskElapsedMs(elapsed);

                // Check for time alert
                if (elapsed >= timeAlertThreshold && !showTimeAlert) {
                    setShowTimeAlert(true);
                }
            }, 100);
        } else {
            if (taskTimerRef.current) {
                clearInterval(taskTimerRef.current);
            }
        }
        return () => {
            if (taskTimerRef.current) {
                clearInterval(taskTimerRef.current);
            }
        };
    }, [isTaskTimerRunning, taskStartTime, showTimeAlert]);

    const loadData = () => {
        setPrograms(getPrograms().filter(p => p.status === 'active'));
        setPrompts(getPrompts());
        setReinforcers(getReinforcers());
        setBehaviors(getBehaviors());
        setSettings(getSettings());
        setPatient(getPatient());
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Format milliseconds to display - NEW
    const formatTaskTime = (ms) => {
        const totalSecs = Math.floor(ms / 1000);
        const mins = Math.floor(totalSecs / 60);
        const secs = totalSecs % 60;
        const tenths = Math.floor((ms % 1000) / 100);
        if (mins > 0) {
            return `${mins}:${secs.toString().padStart(2, '0')}.${tenths}`;
        }
        return `${secs}.${tenths}s`;
    };

    // Start task timer (when instruction is given) - NEW
    const handleStartTaskTimer = () => {
        const now = Date.now();
        setInstructionGivenTime(now);
        setTaskStartTime(now);
        setTaskElapsedMs(0);
        setLatencyMs(0);
        setIsTaskTimerRunning(true);
    };

    // Record latency (when child starts responding) - NEW
    const handleRecordLatency = () => {
        if (instructionGivenTime) {
            const lat = Date.now() - instructionGivenTime;
            setLatencyMs(lat);
        }
    };

    // Stop and reset task timer - NEW
    const resetTaskTimer = () => {
        setIsTaskTimerRunning(false);
        setTaskStartTime(null);
        setTaskElapsedMs(0);
        setLatencyMs(0);
        setInstructionGivenTime(null);
        setShowTimeAlert(false);
    };

    const handleStartSession = () => {
        const newSession = startSession();
        setSession(newSession);
        setElapsedTime(0);
        setSessionTrials([]);
        setSessionStats({ correct: 0, total: 0 });
        setSessionTrialCount(0);
        setShowFatigueAlert(false);
        setShowProgramSelector(true);
        resetTaskTimer();
    };

    const handleEndSession = () => {
        if (session) {
            endSession(session.id, '');
            setSession(null);
            setSelectedProgram(null);
            setCurrentTrialIndex(0);
            setShowProgramSelector(true);
            resetTaskTimer();
        }
    };

    const handleSelectProgram = (program) => {
        setSelectedProgram(program);
        setCurrentTrialIndex(0);
        setShowProgramSelector(false);
        setSelectedPrompt(null);
        // Auto-start task timer when program is selected
        handleStartTaskTimer();
    };

    const handleTrialResponse = (result) => {
        if (!session || !selectedProgram) return;

        // Calculate final duration
        const finalDurationMs = taskStartTime ? Date.now() - taskStartTime : 0;
        const finalLatencyMs = latencyMs || 0;

        const trial = {
            sessionId: session.id,
            programId: selectedProgram.id,
            result,
            promptLevel: selectedPrompt?.id || 'ind',
            reinforcer: selectedReinforcer?.id || null,
            trialNumber: currentTrialIndex + 1,
            // Timing data - NEW
            durationMs: finalDurationMs,
            latencyMs: finalLatencyMs,
            taskStartTime: taskStartTime ? new Date(taskStartTime).toISOString() : null,
            taskEndTime: new Date().toISOString(),
        };

        addTrial(trial);

        const newTrials = [...sessionTrials, trial];
        setSessionTrials(newTrials);

        // Update stats
        const newStats = {
            correct: newTrials.filter(t => t.result === TrialResult.CORRECT).length,
            total: newTrials.length,
        };
        setSessionStats(newStats);

        // Show celebration for correct answers
        if (result === TrialResult.CORRECT && settings.showCelebrations) {
            triggerCelebration();
        }

        // Show reinforcer selection after correct answer
        if (result === TrialResult.CORRECT) {
            setShowReinforcer(true);
        }

        setCurrentTrialIndex((prev) => prev + 1);
        setSelectedPrompt(null);
        setSelectedReinforcer(null);

        // Track session trial count for fatigue detection
        const newTrialCount = sessionTrialCount + 1;
        setSessionTrialCount(newTrialCount);

        // Check for fatigue alert
        if (newTrialCount >= fatigueThreshold && !showFatigueAlert) {
            setShowFatigueAlert(true);
        }

        // Reset and restart task timer for next trial
        handleStartTaskTimer();
    };

    const triggerCelebration = () => {
        setShowCelebration(true);
        if (settings.soundEnabled) {
            // Play celebration sound (would need actual audio file)
            try {
                const audio = new Audio('/sounds/success.mp3');
                audio.volume = 0.5;
                audio.play().catch(() => { });
            } catch (e) { }
        }
        setTimeout(() => setShowCelebration(false), 2000);
    };

    const handleBehaviorRecord = (behavior) => {
        if (!session) return;

        addBehaviorRecord({
            sessionId: session.id,
            behaviorId: behavior.id,
            count: 1,
            context: 'during_session',
        });

        setShowBehaviorModal(false);
    };

    const handleSaveNote = () => {
        if (!session || !noteText.trim()) return;

        addNote({
            sessionId: session.id,
            programId: selectedProgram?.id,
            text: noteText,
            type: 'observation',
        });

        setNoteText('');
        setShowNoteModal(false);
    };

    const getCurrentAccuracy = () => {
        const programTrials = sessionTrials.filter(t => t.programId === selectedProgram?.id);
        if (programTrials.length === 0) return 0;
        const correct = programTrials.filter(t => t.result === TrialResult.CORRECT).length;
        return Math.round((correct / programTrials.length) * 100);
    };

    if (!mounted) {
        return <div className="animate-pulse p-8">Carregando...</div>;
    }

    return (
        <div className="min-h-[calc(100vh-4rem)]">
            {/* Session Header */}
            {session && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="session-card mb-6"
                >
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center">
                                <Clock className="w-7 h-7" />
                            </div>
                            <div>
                                <p className="text-white/70 text-sm">Tempo de Sessão</p>
                                <p className="text-3xl font-bold">{formatTime(elapsedTime)}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-6">
                            <div className="text-center">
                                <p className="text-white/70 text-sm">Tentativas</p>
                                <p className="text-2xl font-bold">{sessionStats.total}</p>
                            </div>
                            <div className="text-center">
                                <p className="text-white/70 text-sm">Acertos</p>
                                <p className="text-2xl font-bold text-green-300">{sessionStats.correct}</p>
                            </div>
                            <div className="text-center">
                                <p className="text-white/70 text-sm">Taxa</p>
                                <p className="text-2xl font-bold">
                                    {sessionStats.total > 0
                                        ? Math.round((sessionStats.correct / sessionStats.total) * 100)
                                        : 0}%
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setIsPaused(!isPaused)}
                                className="p-3 rounded-xl bg-white/20 hover:bg-white/30 transition-colors"
                                title={isPaused ? 'Continuar' : 'Pausar'}
                            >
                                {isPaused ? <PlayCircle size={24} /> : <PauseCircle size={24} />}
                            </button>
                            <button
                                onClick={handleEndSession}
                                className="p-3 rounded-xl bg-red-500/30 hover:bg-red-500/50 transition-colors"
                                title="Encerrar Sessão"
                            >
                                <StopCircle size={24} />
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Left Panel - Program Selector or Trial Controls */}
                <div className="lg:col-span-3">
                    {!session ? (
                        // No active session - Start button
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="chart-container text-center py-16"
                        >
                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center mx-auto mb-6 shadow-xl">
                                <PlayCircle className="w-12 h-12 text-white" />
                            </div>
                            <h2 className="text-2xl font-bold mb-2">Iniciar Nova Sessão</h2>
                            <p className="text-neutral-500 mb-6 max-w-md mx-auto">
                                Comece uma sessão de terapia para registrar tentativas e acompanhar o progresso.
                            </p>
                            <button onClick={handleStartSession} className="btn-primary text-lg px-8 py-4">
                                <PlayCircle size={24} />
                                Iniciar Sessão
                            </button>
                        </motion.div>
                    ) : showProgramSelector ? (
                        // Program Selector
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="chart-container"
                        >
                            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                                <Target className="w-5 h-5 text-primary-500" />
                                Selecione um Programa
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {programs.map((program) => (
                                    <motion.button
                                        key={program.id}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => handleSelectProgram(program)}
                                        className="p-4 rounded-xl border-2 border-neutral-200 hover:border-primary-300 hover:bg-primary-50 transition-all text-left"
                                    >
                                        <span className={`badge badge-${program.category === 'MAND' ? 'primary' :
                                            program.category === 'TACT' ? 'success' :
                                                program.category === 'RECEPTIVO' ? 'warning' :
                                                    program.category === 'MOTOR' ? 'purple' :
                                                        program.category === 'SOCIAL' ? 'error' : 'primary'
                                            } mb-2`}>
                                            {program.category}
                                        </span>
                                        <p className="font-semibold">{program.name}</p>
                                        <p className="text-sm text-neutral-500 mt-1">{program.description}</p>
                                        <div className="flex items-center justify-between mt-3">
                                            <span className="text-xs text-neutral-400">Meta: {program.targetAccuracy}%</span>
                                            <ChevronRight size={18} className="text-neutral-400" />
                                        </div>
                                    </motion.button>
                                ))}
                            </div>
                        </motion.div>
                    ) : (
                        // Trial Interface
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="space-y-6"
                        >
                            {/* Current Program Header */}
                            <div className="chart-container">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <button
                                            onClick={() => {
                                                setShowProgramSelector(true);
                                                resetTaskTimer();
                                            }}
                                            className="btn-icon"
                                        >
                                            <ChevronLeft size={20} />
                                        </button>
                                        <div>
                                            <span className={`badge badge-${selectedProgram?.category === 'MAND' ? 'primary' :
                                                selectedProgram?.category === 'TACT' ? 'success' : 'warning'
                                                }`}>
                                                {selectedProgram?.category}
                                            </span>
                                            <h2 className="text-xl font-bold mt-1">{selectedProgram?.name}</h2>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div className="text-center">
                                            <p className="text-sm text-neutral-500">Tentativa</p>
                                            <p className="text-2xl font-bold">{currentTrialIndex + 1}</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-sm text-neutral-500">Acurácia</p>
                                            <p className={`text-2xl font-bold ${getCurrentAccuracy() >= (selectedProgram?.targetAccuracy || 80)
                                                ? 'text-success-600'
                                                : 'text-neutral-600'
                                                }`}>
                                                {getCurrentAccuracy()}%
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Task Timer Card - MOBILE OPTIMIZED */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="chart-container bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border-l-4 border-purple-500"
                            >
                                {/* Mobile: Stack vertically, Desktop: Row */}
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                    {/* Timer Display */}
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                                            <Timer className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-neutral-500 font-medium">Tempo da Tarefa</p>
                                            <p className="text-2xl sm:text-3xl font-bold text-purple-700 dark:text-purple-300 tabular-nums">
                                                {formatTaskTime(taskElapsedMs)}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Controls Row */}
                                    <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-6 flex-wrap">
                                        {/* Latency indicator */}
                                        <div className="text-center min-w-[60px]">
                                            <p className="text-xs text-neutral-500 flex items-center justify-center gap-1">
                                                <Zap size={12} /> Latência
                                            </p>
                                            <p className="text-lg font-bold text-indigo-600">
                                                {latencyMs > 0 ? `${(latencyMs / 1000).toFixed(1)}s` : '--'}
                                            </p>
                                        </div>

                                        {/* Record latency button */}
                                        {latencyMs === 0 && isTaskTimerRunning && (
                                            <button
                                                onClick={handleRecordLatency}
                                                className="px-3 py-2 rounded-lg bg-indigo-500 text-white text-sm font-medium hover:bg-indigo-600 transition-colors flex items-center gap-2"
                                            >
                                                <Zap size={14} />
                                                <span className="hidden sm:inline">Marcar</span> Início
                                            </button>
                                        )}

                                        {/* Timer controls */}
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setIsTaskTimerRunning(!isTaskTimerRunning)}
                                                className={`p-3 rounded-xl transition-colors shadow-md ${isTaskTimerRunning
                                                    ? 'bg-orange-500 hover:bg-orange-600 text-white'
                                                    : 'bg-green-500 hover:bg-green-600 text-white'
                                                    }`}
                                                title={isTaskTimerRunning ? 'Pausar' : 'Continuar'}
                                            >
                                                {isTaskTimerRunning ? <PauseCircle size={22} /> : <PlayCircle size={22} />}
                                            </button>
                                            <button
                                                onClick={handleStartTaskTimer}
                                                className="p-3 rounded-xl bg-neutral-200 hover:bg-neutral-300 dark:bg-neutral-700 dark:hover:bg-neutral-600 text-neutral-700 dark:text-neutral-200 transition-colors shadow-md"
                                                title="Reiniciar"
                                            >
                                                <RotateCcw size={22} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Time Alert - Shows when task takes too long */}
                            <AnimatePresence>
                                {showTimeAlert && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="p-4 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white flex items-center gap-4"
                                    >
                                        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                                            <AlertCircle className="w-6 h-6" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-semibold">⏰ Tempo Excedido</p>
                                            <p className="text-sm text-white/80">
                                                Esta tarefa está demorando mais que o esperado. Considere simplificar ou pausar.
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => setShowTimeAlert(false)}
                                            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                                        >
                                            <X size={18} />
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Fatigue Alert - Shows after many trials */}
                            <AnimatePresence>
                                {showFatigueAlert && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="p-4 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 text-white flex items-center gap-4"
                                    >
                                        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                                            <Coffee className="w-6 h-6" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-semibold">☕ Hora de uma Pausa?</p>
                                            <p className="text-sm text-white/80">
                                                Já foram {sessionTrialCount} tentativas. Uma pausa pode ajudar a manter o foco.
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => {
                                                setShowFatigueAlert(false);
                                                setIsPaused(true);
                                            }}
                                            className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors text-sm font-medium"
                                        >
                                            Pausar
                                        </button>
                                        <button
                                            onClick={() => setShowFatigueAlert(false)}
                                            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                                        >
                                            <X size={18} />
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Prompt Selector */}
                            <div className="chart-container">
                                <h3 className="font-semibold mb-4 flex items-center gap-2">
                                    <Award className="w-5 h-5 text-warning-500" />
                                    Nível de Prompt
                                </h3>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                                    {prompts.map((prompt) => (
                                        <button
                                            key={prompt.id}
                                            onClick={() => setSelectedPrompt(prompt)}
                                            className={`p-3 rounded-xl font-medium transition-all text-center ${selectedPrompt?.id === prompt.id
                                                ? 'ring-2 ring-offset-2 shadow-lg'
                                                : 'hover:shadow-md'
                                                }`}
                                            style={{
                                                backgroundColor: selectedPrompt?.id === prompt.id ? prompt.color : 'rgba(30, 136, 229, 0.15)',
                                                color: selectedPrompt?.id === prompt.id ? 'white' : '#e5e7eb',
                                                border: `1px solid ${selectedPrompt?.id === prompt.id ? prompt.color : 'rgba(30, 136, 229, 0.3)'}`,
                                            }}
                                        >
                                            <span className="text-sm font-bold block mb-1">
                                                {prompt.abbrev}
                                            </span>
                                            <span className="text-xs opacity-80">
                                                {prompt.name}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Trial Response Buttons */}
                            <div className="chart-container">
                                <h3 className="font-semibold mb-4 flex items-center gap-2">
                                    <Target className="w-5 h-5 text-primary-500" />
                                    Resultado da Tentativa
                                </h3>
                                <div className="grid grid-cols-3 gap-3">
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => handleTrialResponse(TrialResult.CORRECT)}
                                        className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all min-h-[90px]"
                                    >
                                        <Check size={28} />
                                        <span className="text-sm">Correto</span>
                                    </motion.button>

                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => handleTrialResponse(TrialResult.INCORRECT)}
                                        className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all min-h-[90px]"
                                    >
                                        <X size={28} />
                                        <span className="text-sm">Incorreto</span>
                                    </motion.button>

                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => handleTrialResponse(TrialResult.NO_RESPONSE)}
                                        className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all min-h-[90px]"
                                    >
                                        <RotateCcw size={28} />
                                        <span className="text-xs sm:text-sm">Sem Resposta</span>
                                    </motion.button>
                                </div>
                            </div>

                            {/* Reinforcer Selection */}
                            <AnimatePresence>
                                {showReinforcer && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="chart-container"
                                    >
                                        <h3 className="font-semibold mb-4 flex items-center gap-2">
                                            <Gift className="w-5 h-5 text-purple-500" />
                                            Reforçador Utilizado
                                        </h3>
                                        <div className="flex flex-wrap gap-2">
                                            {reinforcers.map((reinforcer) => (
                                                <button
                                                    key={reinforcer.id}
                                                    onClick={() => {
                                                        setSelectedReinforcer(reinforcer);
                                                        setShowReinforcer(false);
                                                    }}
                                                    className={`px-4 py-2 rounded-lg border-2 flex items-center gap-2 transition-all ${selectedReinforcer?.id === reinforcer.id
                                                        ? 'border-purple-500 bg-purple-50'
                                                        : 'border-neutral-200 hover:border-neutral-300'
                                                        }`}
                                                >
                                                    <span className="text-xl">{reinforcer.icon}</span>
                                                    {reinforcer.name}
                                                </button>
                                            ))}
                                            <button
                                                onClick={() => setShowReinforcer(false)}
                                                className="px-4 py-2 rounded-lg border-2 border-neutral-200 hover:border-neutral-300 text-neutral-500"
                                            >
                                                Pular
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    )}
                </div>

                {/* Right Panel - Quick Actions & History */}
                <div className="space-y-6">
                    {session && (
                        <>
                            {/* Quick Actions */}
                            <div className="chart-container">
                                <h3 className="font-semibold mb-4">Ações Rápidas</h3>
                                <div className="space-y-2">
                                    <button
                                        onClick={() => setShowBehaviorModal(true)}
                                        className="w-full btn-secondary justify-start"
                                    >
                                        <AlertCircle size={18} />
                                        Registrar Comportamento
                                    </button>
                                    <button
                                        onClick={() => setShowNoteModal(true)}
                                        className="w-full btn-secondary justify-start"
                                    >
                                        <MessageSquare size={18} />
                                        Adicionar Nota
                                    </button>
                                </div>
                            </div>

                            {/* Session History */}
                            <div className="chart-container">
                                <h3 className="font-semibold mb-4 flex items-center gap-2">
                                    <History size={18} />
                                    Últimas Tentativas
                                </h3>
                                <div className="space-y-2 max-h-64 overflow-y-auto">
                                    {sessionTrials.slice(-10).reverse().map((trial, index) => {
                                        const program = programs.find(p => p.id === trial.programId);
                                        return (
                                            <div
                                                key={index}
                                                className={`p-3 rounded-lg flex items-center justify-between ${trial.result === TrialResult.CORRECT
                                                    ? 'bg-success-50'
                                                    : trial.result === TrialResult.INCORRECT
                                                        ? 'bg-error-50'
                                                        : 'bg-warning-50'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-2">
                                                    {trial.result === TrialResult.CORRECT ? (
                                                        <Check className="w-4 h-4 text-success-600" />
                                                    ) : trial.result === TrialResult.INCORRECT ? (
                                                        <X className="w-4 h-4 text-error-600" />
                                                    ) : (
                                                        <RotateCcw className="w-4 h-4 text-warning-600" />
                                                    )}
                                                    <span className="text-sm font-medium truncate max-w-[100px]">
                                                        {program?.name || 'Programa'}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    {/* Show duration if available */}
                                                    {trial.durationMs > 0 && (
                                                        <span className="text-xs text-purple-600 font-medium flex items-center gap-1">
                                                            <Timer size={12} />
                                                            {formatTaskTime(trial.durationMs)}
                                                        </span>
                                                    )}
                                                    <span className="text-xs text-neutral-500">
                                                        #{trial.trialNumber}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    {sessionTrials.length === 0 && (
                                        <p className="text-sm text-neutral-500 text-center py-4">
                                            Nenhuma tentativa ainda.
                                        </p>
                                    )}
                                </div>
                            </div>
                        </>
                    )}

                    {/* Patient Info */}
                    {patient && (
                        <div className="chart-container">
                            <div className="flex items-center gap-3">
                                <div className="avatar">
                                    {patient.name?.charAt(0) || 'P'}
                                </div>
                                <div>
                                    <p className="font-semibold">{patient.name || 'Paciente'}</p>
                                    <p className="text-sm text-neutral-500">
                                        {patient.age ? `${patient.age} anos` : ''}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Celebration Animation */}
            <AnimatePresence>
                {showCelebration && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        className="fixed inset-0 flex items-center justify-center pointer-events-none z-50"
                    >
                        <div className="text-center">
                            <motion.div
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ repeat: 2, duration: 0.3 }}
                                className="text-8xl mb-4"
                            >
                                🎉
                            </motion.div>
                            <motion.p
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                className="text-2xl font-bold text-success-600"
                            >
                                Excelente!
                            </motion.p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Behavior Modal */}
            <AnimatePresence>
                {showBehaviorModal && (
                    <div className="modal-overlay" onClick={() => setShowBehaviorModal(false)}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="modal-content"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h2 className="text-xl font-bold mb-4">Registrar Comportamento</h2>
                            <div className="space-y-2 max-h-80 overflow-y-auto">
                                {behaviors.map((behavior) => (
                                    <button
                                        key={behavior.id}
                                        onClick={() => handleBehaviorRecord(behavior)}
                                        className="w-full p-4 rounded-lg border-2 border-neutral-200 hover:border-primary-300 hover:bg-neutral-50 text-left transition-all"
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium">{behavior.name}</span>
                                            <span
                                                className={`badge ${behavior.type === 'increase' ? 'badge-success' :
                                                    behavior.severity === 'high' ? 'badge-error' : 'badge-warning'
                                                    }`}
                                            >
                                                {behavior.type === 'increase' ? '↑' : '↓'}
                                            </span>
                                        </div>
                                        <p className="text-sm text-neutral-500 mt-1">{behavior.description}</p>
                                    </button>
                                ))}
                            </div>
                            <button
                                onClick={() => setShowBehaviorModal(false)}
                                className="btn-secondary w-full mt-4"
                            >
                                Cancelar
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Note Modal */}
            <AnimatePresence>
                {showNoteModal && (
                    <div className="modal-overlay" onClick={() => setShowNoteModal(false)}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="modal-content"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h2 className="text-xl font-bold mb-4">Adicionar Nota</h2>
                            <textarea
                                value={noteText}
                                onChange={(e) => setNoteText(e.target.value)}
                                placeholder="Digite sua observação..."
                                className="input-field resize-none"
                                rows={4}
                                autoFocus
                            />
                            <div className="flex gap-3 mt-4">
                                <button
                                    onClick={() => setShowNoteModal(false)}
                                    className="btn-secondary flex-1"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleSaveNote}
                                    className="btn-primary flex-1"
                                    disabled={!noteText.trim()}
                                >
                                    Salvar
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
