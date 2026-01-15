'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
    TrendingUp,
    TrendingDown,
    Minus,
    Target,
    Clock,
    Award,
    Activity,
    Brain,
    Sparkles,
    ChevronRight,
    PlayCircle,
    AlertCircle,
    CheckCircle2,
    Moon,
    Sun as SunIcon,
    Heart,
    Smile,
    Frown,
    Meh,
    Zap,
    Calendar,
} from 'lucide-react';
import {
    initializeData,
    getDashboardStats,
    getAllProgramsProgress,
    getTodayCheckin,
    saveDailyCheckin,
    getPatient,
    getSessions,
    getBehaviorRecords,
} from '@/lib/dataService';
import { generateInsights, getNextSessionRecommendations } from '@/lib/insightsService';

const moodEmojis = [
    { id: 'happy', emoji: '😊', label: 'Feliz', color: 'bg-success-100 border-success-500' },
    { id: 'excited', emoji: '🤩', label: 'Animado', color: 'bg-warning-100 border-warning-500' },
    { id: 'neutral', emoji: '😐', label: 'Neutro', color: 'bg-neutral-100 border-neutral-500' },
    { id: 'tired', emoji: '😴', label: 'Cansado', color: 'bg-primary-100 border-primary-500' },
    { id: 'sad', emoji: '😢', label: 'Triste', color: 'bg-error-100 border-error-500' },
    { id: 'angry', emoji: '😠', label: 'Irritado', color: 'bg-error-100 border-error-500' },
];

const healthOptions = [
    { id: 'normal', label: 'Normal', icon: CheckCircle2, color: 'text-success-500' },
    { id: 'flu', label: 'Gripe/Resfriado', icon: AlertCircle, color: 'text-warning-500' },
    { id: 'pain', label: 'Dor', icon: AlertCircle, color: 'text-error-500' },
    { id: 'other', label: 'Outro', icon: AlertCircle, color: 'text-neutral-500' },
];

export default function DashboardPage() {
    const [mounted, setMounted] = useState(false);
    const [stats, setStats] = useState(null);
    const [programsProgress, setProgramsProgress] = useState([]);
    const [insights, setInsights] = useState([]);
    const [recommendations, setRecommendations] = useState([]);
    const [patient, setPatient] = useState(null);
    const [checkin, setCheckin] = useState(null);
    const [showCheckinModal, setShowCheckinModal] = useState(false);
    const [checkinForm, setCheckinForm] = useState({
        sleep: 8,
        mood: 'neutral',
        health: 'normal',
        notes: '',
    });

    useEffect(() => {
        initializeData();
        setMounted(true);
        loadData();
    }, []);

    const loadData = () => {
        setStats(getDashboardStats());
        setProgramsProgress(getAllProgramsProgress().slice(0, 6));
        setInsights(generateInsights().slice(0, 4));
        setRecommendations(getNextSessionRecommendations().slice(0, 3));
        setPatient(getPatient());

        const todayCheckin = getTodayCheckin();
        setCheckin(todayCheckin);
        if (!todayCheckin) {
            setShowCheckinModal(true);
        }
    };

    const handleSaveCheckin = () => {
        saveDailyCheckin(checkinForm);
        setCheckin(checkinForm);
        setShowCheckinModal(false);
        loadData();
    };

    const getTrendIcon = (trend) => {
        switch (trend) {
            case 'increasing':
                return <TrendingUp className="w-4 h-4 text-success-500" />;
            case 'decreasing':
                return <TrendingDown className="w-4 h-4 text-error-500" />;
            default:
                return <Minus className="w-4 h-4 text-neutral-400" />;
        }
    };

    const getAccuracyColor = (accuracy, target) => {
        if (accuracy >= target) return 'success';
        if (accuracy >= target * 0.7) return 'warning';
        return 'error';
    };

    if (!mounted) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-pulse flex flex-col items-center gap-4">
                    <Brain className="w-16 h-16 text-primary-500" />
                    <p className="text-neutral-500">Carregando...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            {/* Page Header */}
            <div className="page-header flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
                <div>
                    <h1 className="page-title">Olá! 👋</h1>
                    <p className="page-subtitle mb-4 md:mb-0">
                        Acompanhe o progresso das terapias e insights importantes.
                    </p>
                </div>

                {/* Desktop Only: New Session Button */}
                <div className="hidden lg:flex shrink-0">
                    <Link href="/session" className="btn-primary whitespace-nowrap shadow-lg shadow-primary-500/20">
                        <PlayCircle size={20} />
                        Nova Sessão
                    </Link>
                </div>
            </div>

            {/* Check-in Status - Mobile Friendly */}
            {checkin && (
                <div className="mb-8 flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-neutral-800 shadow-sm border border-neutral-100 dark:border-neutral-700 max-w-md">
                    <span className="text-3xl filter drop-shadow-sm">{moodEmojis.find(m => m.id === checkin.mood)?.emoji || '😐'}</span>
                    <div className="flex-1">
                        <p className="font-semibold text-sm text-neutral-900 dark:text-white">{patient?.name || 'Paciente'}</p>
                        <p className="text-xs text-neutral-500 mt-1 flex items-center gap-2">
                            <span>🌙 {checkin.sleep}h sono</span>
                            <span>•</span>
                            <span>{healthOptions.find(h => h.id === checkin.health)?.label}</span>
                        </p>
                    </div>
                </div>
            )}

            {/* Stats Grid */}
            <div className="stats-grid">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="stat-card"
                >
                    <div className="flex items-center justify-between mb-2">
                        <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-primary-100 flex items-center justify-center">
                            <PlayCircle className="w-5 h-5 lg:w-6 lg:h-6 text-primary-600" />
                        </div>
                        <span className="badge badge-primary text-xs">Hoje</span>
                    </div>
                    <p className="text-2xl lg:text-3xl font-bold mt-2">{stats?.todaySessions || 0}</p>
                    <p className="text-neutral-500 text-xs lg:text-sm mt-1">Sessões Hoje</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="stat-card"
                >
                    <div className="flex items-center justify-between mb-2">
                        <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-success-100 flex items-center justify-center">
                            <Target className="w-5 h-5 lg:w-6 lg:h-6 text-success-600" />
                        </div>
                        {stats?.todayAccuracy >= 70 && (
                            <span className="badge badge-success text-xs">Ótimo!</span>
                        )}
                    </div>
                    <p className="text-2xl lg:text-3xl font-bold mt-2">{stats?.todayAccuracy || 0}%</p>
                    <p className="text-neutral-500 text-xs lg:text-sm mt-1">Taxa de Acerto</p>
                    <div className="progress-bar mt-3">
                        <div
                            className={`progress-bar-fill ${stats?.todayAccuracy >= 70 ? 'success' : stats?.todayAccuracy >= 50 ? 'warning' : 'error'}`}
                            style={{ width: `${stats?.todayAccuracy || 0}%` }}
                        />
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="stat-card"
                >
                    <div className="flex items-center justify-between mb-2">
                        <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-warning-100 flex items-center justify-center">
                            <Zap className="w-5 h-5 lg:w-6 lg:h-6 text-warning-600" />
                        </div>
                        <span className="badge badge-warning text-xs">7 dias</span>
                    </div>
                    <p className="text-2xl lg:text-3xl font-bold mt-2">{stats?.weekTrials || 0}</p>
                    <p className="text-neutral-500 text-xs lg:text-sm mt-1">Tentativas</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="stat-card"
                >
                    <div className="flex items-center justify-between mb-2">
                        <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                            <Award className="w-5 h-5 lg:w-6 lg:h-6 text-purple-600" />
                        </div>
                    </div>
                    <p className="text-2xl lg:text-3xl font-bold mt-2">{stats?.weekAccuracy || 0}%</p>
                    <p className="text-neutral-500 text-xs lg:text-sm mt-1">Média Semanal</p>
                    <div className="progress-bar mt-3">
                        <div
                            className={`progress-bar-fill ${stats?.weekAccuracy >= 70 ? 'success' : stats?.weekAccuracy >= 50 ? 'warning' : 'error'}`}
                            style={{ width: `${stats?.weekAccuracy || 0}%` }}
                        />
                    </div>
                </motion.div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 lg:gap-6">
                {/* Programs Progress */}
                <div className="lg:col-span-2">
                    <div className="chart-container">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-semibold flex items-center gap-2">
                                <Activity className="w-5 h-5 text-primary-500" />
                                Progresso dos Programas
                            </h2>
                            <Link href="/programs" className="text-primary-500 text-sm font-medium hover:underline flex items-center gap-1">
                                Ver todos <ChevronRight size={16} />
                            </Link>
                        </div>

                        {programsProgress.length > 0 ? (
                            <div className="space-y-4">
                                {programsProgress.map((prog, index) => (
                                    <motion.div
                                        key={prog.programId}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        style={{
                                            padding: '1rem',
                                            borderRadius: '0.75rem',
                                            background: 'rgba(30, 136, 229, 0.08)',
                                            border: '1px solid rgba(30, 136, 229, 0.15)',
                                        }}
                                    >
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className={`badge badge-${prog.category === 'MAND' ? 'primary' : prog.category === 'TACT' ? 'success' : prog.category === 'RECEPTIVO' ? 'warning' : 'purple'} text-xs`}>
                                                    {prog.category}
                                                </span>
                                                <span className="font-medium text-sm" style={{ color: '#e5e7eb' }}>{prog.programName}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <span className={`font-bold text-sm ${prog.isAtTarget ? 'text-success-600' :
                                                    prog.currentAccuracy >= prog.targetAccuracy * 0.7 ? 'text-warning-600' : 'text-error-600'
                                                    }`}>
                                                    {prog.currentAccuracy}%
                                                </span>
                                                <span style={{ color: '#9ca3af', fontSize: '0.75rem' }}>/ {prog.targetAccuracy}%</span>
                                            </div>
                                        </div>
                                        <div className="progress-bar">
                                            <div
                                                className={`progress-bar-fill ${getAccuracyColor(prog.currentAccuracy, prog.targetAccuracy)}`}
                                                style={{ width: `${Math.min(prog.currentAccuracy, 100)}%` }}
                                            />
                                        </div>
                                        <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.5rem' }}>
                                            {prog.totalTrials} tentativas nos últimos 30 dias
                                        </p>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div className="empty-state">
                                <div className="empty-state-icon">📊</div>
                                <p>Nenhuma sessão registrada ainda.</p>
                                <p className="text-sm">Inicie uma sessão para ver o progresso.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Insights & Recommendations */}
                <div className="space-y-5 lg:space-y-6 mt-5 lg:mt-0">
                    {/* AI Insights */}
                    <div className="chart-container">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-base lg:text-lg font-semibold flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-purple-500" />
                                Insights IA
                            </h2>
                            <Link href="/insights" className="text-primary-500 text-sm font-medium hover:underline">
                                Ver mais
                            </Link>
                        </div>

                        {insights.length > 0 ? (
                            <div className="space-y-3">
                                {insights.map((insight, index) => (
                                    <motion.div
                                        key={insight.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className={`p-3 rounded-lg border-l-4 flex flex-col gap-1 ${insight.type === 'success' ? 'bg-success-50 border-success-500' :
                                            insight.type === 'warning' ? 'bg-warning-50 border-warning-500' :
                                                insight.type === 'celebration' ? 'bg-purple-50 border-purple-500' :
                                                    'bg-primary-50 border-primary-500'
                                            }`}
                                    >
                                        <p className="font-semibold text-sm leading-tight text-neutral-800 dark:text-neutral-200">
                                            {insight.title}
                                        </p>
                                        <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                                            {insight.description}
                                        </p>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-6 text-neutral-500 text-sm">
                                <Brain className="w-10 h-10 mx-auto mb-2 opacity-50" />
                                <p>Continue registrando sessões para gerar insights.</p>
                            </div>
                        )}
                    </div>

                    {/* Next Session Recommendations */}
                    <div className="chart-container">
                        <h2 className="text-base lg:text-lg font-semibold flex items-center gap-2 mb-5">
                            <Calendar className="w-5 h-5 text-warning-500" />
                            Próxima Sessão
                        </h2>

                        {recommendations.length > 0 ? (
                            <div className="space-y-4">
                                {recommendations.map((rec, index) => (
                                    <div
                                        key={index}
                                        className="p-4 rounded-lg bg-neutral-50 dark:bg-neutral-800/50"
                                    >
                                        {rec.type === 'tip' ? (
                                            <>
                                                <p className="font-medium text-sm flex items-center gap-2">
                                                    <AlertCircle className="w-4 h-4 text-warning-500" />
                                                    {rec.title}
                                                </p>
                                                <p className="text-xs text-neutral-500 mt-2">{rec.description}</p>
                                            </>
                                        ) : (
                                            <>
                                                <div className="flex items-center justify-between">
                                                    <span className={`badge badge-${rec.category === 'MAND' ? 'primary' : rec.category === 'TACT' ? 'success' : 'warning'} text-xs`}>
                                                        {rec.category}
                                                    </span>
                                                    <span className="text-xs text-neutral-500">{rec.currentAccuracy}% atual</span>
                                                </div>
                                                <p className="font-medium text-sm mt-2">{rec.name}</p>
                                                <p className="text-xs text-neutral-500 mt-1">{rec.reason}</p>
                                            </>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-neutral-500 text-center py-4">
                                Complete o check-in diário para receber recomendações.
                            </p>
                        )}

                        <Link href="/session" className="btn-success w-full mt-5">
                            <PlayCircle size={18} />
                            Iniciar Sessão
                        </Link>
                    </div>
                </div>
            </div>

            {/* Daily Check-in Modal */}
            {showCheckinModal && (
                <div className="modal-overlay" onClick={() => setShowCheckinModal(false)}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="modal-content"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 className="text-xl font-bold mb-1">Check-in do Dia 📋</h2>
                        <p className="text-neutral-500 text-sm mb-6">
                            Registre como está {patient?.name || 'o paciente'} hoje para insights personalizados.
                        </p>

                        {/* Sleep */}
                        <div className="mb-6">
                            <label className="input-label flex items-center gap-2">
                                <Moon className="w-4 h-4" />
                                Horas de Sono
                            </label>
                            <div className="flex items-center gap-4">
                                <input
                                    type="range"
                                    min="1"
                                    max="12"
                                    value={checkinForm.sleep}
                                    onChange={(e) => setCheckinForm({ ...checkinForm, sleep: parseInt(e.target.value) })}
                                    className="flex-1 h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-primary-500"
                                />
                                <span className="font-bold text-xl w-12 text-center">{checkinForm.sleep}h</span>
                            </div>
                        </div>

                        {/* Mood */}
                        <div className="mb-6">
                            <label className="input-label flex items-center gap-2 mb-3">
                                <Smile className="w-4 h-4" />
                                Humor
                            </label>
                            <div className="mood-selector flex-wrap">
                                {moodEmojis.map((mood) => (
                                    <button
                                        key={mood.id}
                                        onClick={() => setCheckinForm({ ...checkinForm, mood: mood.id })}
                                        className={`mood-btn ${checkinForm.mood === mood.id ? 'selected ' + mood.color : ''}`}
                                        title={mood.label}
                                    >
                                        {mood.emoji}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Health */}
                        <div className="mb-6">
                            <label className="input-label flex items-center gap-2 mb-3">
                                <Heart className="w-4 h-4" />
                                Estado de Saúde
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                {healthOptions.map((option) => {
                                    const Icon = option.icon;
                                    return (
                                        <button
                                            key={option.id}
                                            onClick={() => setCheckinForm({ ...checkinForm, health: option.id })}
                                            className={`p-3 rounded-lg border-2 flex items-center gap-2 transition-all ${checkinForm.health === option.id
                                                ? 'border-primary-500 bg-primary-50'
                                                : 'border-neutral-200 hover:border-neutral-300'
                                                }`}
                                        >
                                            <Icon className={`w-5 h-5 ${option.color}`} />
                                            <span className="text-sm font-medium">{option.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Notes */}
                        <div className="mb-6">
                            <label className="input-label">Observações (opcional)</label>
                            <textarea
                                value={checkinForm.notes}
                                onChange={(e) => setCheckinForm({ ...checkinForm, notes: e.target.value })}
                                placeholder="Algo importante para registrar hoje?"
                                className="input-field resize-none"
                                rows={2}
                            />
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowCheckinModal(false)}
                                className="btn-secondary flex-1"
                            >
                                Pular
                            </button>
                            <button
                                onClick={handleSaveCheckin}
                                className="btn-primary flex-1"
                            >
                                Salvar Check-in
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
