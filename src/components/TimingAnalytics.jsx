'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Timer,
    Clock,
    TrendingUp,
    TrendingDown,
    Minus,
    Zap,
    Target,
    Trophy,
    AlertTriangle,
    Coffee,
    Star,
    Medal,
    Flame,
    BarChart3,
} from 'lucide-react';
import { Chart as ChartJS, defaults } from 'chart.js/auto';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { getTimingAnalytics, getTimingByProgram, getTrials, getPrograms, getSettings, updateSettings } from '@/lib/dataService';

// Configure Chart.js defaults
defaults.font.family = "'Inter', system-ui, sans-serif";
defaults.color = '#6B7280';

export default function TimingAnalytics() {
    const [mounted, setMounted] = useState(false);
    const [timingData, setTimingData] = useState(null);
    const [programTiming, setProgramTiming] = useState([]);
    const [selectedPeriod, setSelectedPeriod] = useState(30);
    const [showTimeGoalModal, setShowTimeGoalModal] = useState(false);
    const [selectedProgramForGoal, setSelectedProgramForGoal] = useState(null);
    const [timeGoal, setTimeGoal] = useState('');

    useEffect(() => {
        setMounted(true);
        loadData();
    }, [selectedPeriod]);

    const loadData = () => {
        const analytics = getTimingAnalytics(null, selectedPeriod);
        setTimingData(analytics);

        const programData = getTimingByProgram(selectedPeriod);
        setProgramTiming(programData);
    };

    const formatTime = (seconds) => {
        if (seconds < 60) return `${seconds}s`;
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}m ${secs}s`;
    };

    const handleSetTimeGoal = () => {
        if (!selectedProgramForGoal || !timeGoal) return;

        const settings = getSettings();
        const timeGoals = settings.timeGoals || {};
        timeGoals[selectedProgramForGoal.programId] = parseInt(timeGoal);
        updateSettings({ timeGoals });

        setShowTimeGoalModal(false);
        setSelectedProgramForGoal(null);
        setTimeGoal('');
        loadData();
    };

    const getTimeGoal = (programId) => {
        const settings = getSettings();
        return settings.timeGoals?.[programId] || null;
    };

    const getTrendIcon = (trend) => {
        switch (trend) {
            case 'faster':
            case 'improving':
                return <TrendingUp className="w-5 h-5 text-green-500" />;
            case 'slower':
            case 'declining':
                return <TrendingDown className="w-5 h-5 text-red-500" />;
            default:
                return <Minus className="w-5 h-5 text-neutral-400" />;
        }
    };

    const getTrendColor = (trend) => {
        switch (trend) {
            case 'faster':
            case 'improving':
                return 'text-green-600';
            case 'slower':
            case 'declining':
                return 'text-red-600';
            default:
                return 'text-neutral-500';
        }
    };

    if (!mounted) {
        return <div className="animate-pulse p-8">Carregando...</div>;
    }

    // Prepare chart data for timing by program
    const programChartData = {
        labels: programTiming.slice(0, 10).map(p => p.programName.substring(0, 15)),
        datasets: [
            {
                label: 'Tempo Médio (segundos)',
                data: programTiming.slice(0, 10).map(p => p.avgDurationSec),
                backgroundColor: programTiming.slice(0, 10).map((_, i) => {
                    const colors = [
                        'rgba(59, 130, 246, 0.8)',
                        'rgba(16, 185, 129, 0.8)',
                        'rgba(245, 158, 11, 0.8)',
                        'rgba(139, 92, 246, 0.8)',
                        'rgba(236, 72, 153, 0.8)',
                        'rgba(6, 182, 212, 0.8)',
                        'rgba(251, 146, 60, 0.8)',
                        'rgba(34, 197, 94, 0.8)',
                        'rgba(168, 85, 247, 0.8)',
                        'rgba(244, 63, 94, 0.8)',
                    ];
                    return colors[i % colors.length];
                }),
                borderRadius: 8,
                borderSkipped: false,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                padding: 12,
                cornerRadius: 8,
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(0, 0, 0, 0.05)',
                },
                ticks: {
                    callback: (value) => `${value}s`,
                },
            },
            x: {
                grid: {
                    display: false,
                },
            },
        },
    };

    return (
        <div className="space-y-6">
            {/* Header with Period Selector */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Timer className="w-6 h-6 text-purple-500" />
                        Análise de Tempo
                    </h2>
                    <p className="text-neutral-500 text-sm mt-1">
                        Relatório detalhado de tempos de resposta e latência
                    </p>
                </div>
                <div className="flex gap-2 flex-wrap">
                    {[7, 14, 30, 90].map((days) => (
                        <button
                            key={days}
                            onClick={() => setSelectedPeriod(days)}
                            style={{
                                padding: '0.5rem 1rem',
                                borderRadius: '0.75rem',
                                fontSize: '0.875rem',
                                fontWeight: 600,
                                transition: 'all 0.2s',
                                backgroundColor: selectedPeriod === days ? '#2563eb' : 'rgba(30, 136, 229, 0.1)',
                                color: selectedPeriod === days ? 'white' : '#374151',
                                border: selectedPeriod === days ? 'none' : '1px solid rgba(30, 136, 229, 0.2)',
                            }}
                        >
                            {days}d
                        </button>
                    ))}
                </div>
            </div>

            {/* Summary Cards */}
            {timingData?.hasData ? (
                <>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {/* Best Hour Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="stat-card"
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <Clock className="w-5 h-5 text-blue-500" />
                                <span className="text-sm text-neutral-500">Melhor Horário</span>
                            </div>
                            <p className="text-2xl font-bold">
                                {timingData.bestPerformanceHour !== null
                                    ? `${timingData.bestPerformanceHour.toString().padStart(2, '0')}:00`
                                    : '--'}
                            </p>
                            <p className="text-xs text-neutral-500 mt-1">
                                {timingData.bestPerformanceHourAccuracy}% de acerto
                            </p>
                        </motion.div>

                        {/* Performance Trend */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="stat-card"
                        >
                            <div className="flex items-center gap-2 mb-2">
                                {getTrendIcon(timingData.performanceTrend)}
                                <span className="text-sm text-neutral-500">Tendência</span>
                            </div>
                            <p className={`text-2xl font-bold ${getTrendColor(timingData.performanceTrend)}`}>
                                {timingData.performanceTrend === 'improving' ? 'Melhorando' :
                                    timingData.performanceTrend === 'declining' ? 'Caindo' : 'Estável'}
                            </p>
                            <p className="text-xs text-neutral-500 mt-1">
                                Últimos {selectedPeriod} dias
                            </p>
                        </motion.div>

                        {/* Speed Trend */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="stat-card"
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <Zap className="w-5 h-5 text-yellow-500" />
                                <span className="text-sm text-neutral-500">Velocidade</span>
                            </div>
                            <p className={`text-2xl font-bold ${getTrendColor(timingData.durationTrend)}`}>
                                {timingData.durationTrend === 'faster' ? 'Mais Rápido' :
                                    timingData.durationTrend === 'slower' ? 'Mais Lento' : 'Consistente'}
                            </p>
                            <p className="text-xs text-neutral-500 mt-1">
                                Tempo de resposta
                            </p>
                        </motion.div>

                        {/* Fatigue Alert */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className={`stat-card ${timingData.suggestedFatigueBreakAt ? 'ring-2 ring-orange-400' : ''}`}
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <Coffee className="w-5 h-5 text-orange-500" />
                                <span className="text-sm text-neutral-500">Pausa Sugerida</span>
                            </div>
                            <p className="text-2xl font-bold">
                                {timingData.suggestedFatigueBreakAt
                                    ? `${timingData.suggestedFatigueBreakAt} tent.`
                                    : 'N/A'}
                            </p>
                            <p className="text-xs text-neutral-500 mt-1">
                                {timingData.suggestedFatigueBreakAt
                                    ? 'Fadiga detectada'
                                    : 'Não detectada'}
                            </p>
                        </motion.div>
                    </div>

                    {/* Fatigue Alert Banner */}
                    {timingData.suggestedFatigueBreakAt && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="chart-container bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 border-l-4 border-orange-500"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-orange-500 flex items-center justify-center">
                                    <AlertTriangle className="w-6 h-6 text-white" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-orange-800 dark:text-orange-200">
                                        Fadiga Detectada
                                    </h3>
                                    <p className="text-sm text-orange-700 dark:text-orange-300">
                                        O desempenho tende a cair após <strong>{timingData.suggestedFatigueBreakAt}</strong> tentativas.
                                        Considere fazer pausas ou sessões mais curtas.
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Chart - Time by Program */}
                    {programTiming.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="chart-container"
                        >
                            <h3 className="font-semibold mb-4 flex items-center gap-2">
                                <BarChart3 className="w-5 h-5 text-primary-500" />
                                Tempo Médio por Programa
                            </h3>
                            <div className="h-64">
                                <Bar data={programChartData} options={chartOptions} />
                            </div>
                        </motion.div>
                    )}

                    {/* Program Time Goals Table */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="chart-container"
                    >
                        <h3 className="font-semibold mb-4 flex items-center gap-2">
                            <Target className="w-5 h-5 text-green-500" />
                            Metas de Tempo por Programa
                        </h3>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="text-left text-sm text-neutral-500 border-b border-neutral-200 dark:border-neutral-700">
                                        <th className="pb-3 font-medium">Programa</th>
                                        <th className="pb-3 font-medium">Categoria</th>
                                        <th className="pb-3 font-medium text-center">Tempo Médio</th>
                                        <th className="pb-3 font-medium text-center">Meta</th>
                                        <th className="pb-3 font-medium text-center">Status</th>
                                        <th className="pb-3 font-medium text-center">Ação</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {programTiming.map((program, index) => {
                                        const goal = getTimeGoal(program.programId);
                                        const isUnderGoal = goal && program.avgDurationSec <= goal;
                                        const isOverGoal = goal && program.avgDurationSec > goal;

                                        return (
                                            <tr
                                                key={program.programId}
                                                className="border-b border-neutral-100 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
                                            >
                                                <td className="py-3">
                                                    <span className="font-medium">{program.programName}</span>
                                                </td>
                                                <td className="py-3">
                                                    <span className={`badge badge-${program.category === 'MAND' ? 'primary' :
                                                        program.category === 'TACT' ? 'success' : 'warning'
                                                        }`}>
                                                        {program.category}
                                                    </span>
                                                </td>
                                                <td className="py-3 text-center">
                                                    <span className="font-mono text-lg font-bold">
                                                        {formatTime(program.avgDurationSec)}
                                                    </span>
                                                </td>
                                                <td className="py-3 text-center">
                                                    {goal ? (
                                                        <span className="font-mono">{formatTime(goal)}</span>
                                                    ) : (
                                                        <span className="text-neutral-400">--</span>
                                                    )}
                                                </td>
                                                <td className="py-3 text-center">
                                                    {goal ? (
                                                        isUnderGoal ? (
                                                            <span className="inline-flex items-center gap-1 text-green-600">
                                                                <Trophy className="w-4 h-4" />
                                                                Meta Atingida
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1 text-orange-600">
                                                                <TrendingDown className="w-4 h-4" />
                                                                Acima da Meta
                                                            </span>
                                                        )
                                                    ) : (
                                                        <span className="text-neutral-400">-</span>
                                                    )}
                                                </td>
                                                <td className="py-3 text-center">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedProgramForGoal(program);
                                                            setTimeGoal(goal?.toString() || '');
                                                            setShowTimeGoalModal(true);
                                                        }}
                                                        className="text-primary-500 hover:text-primary-700 text-sm font-medium"
                                                    >
                                                        {goal ? 'Editar' : 'Definir Meta'}
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>

                    {/* Records Section - Gamification */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="chart-container bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20"
                    >
                        <h3 className="font-semibold mb-4 flex items-center gap-2">
                            <Trophy className="w-5 h-5 text-yellow-500" />
                            Recordes Pessoais
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {programTiming.slice(0, 3).map((program, index) => (
                                <div
                                    key={program.programId}
                                    className="p-4 rounded-xl bg-white dark:bg-neutral-800 shadow-sm"
                                >
                                    <div className="flex items-center gap-2 mb-2">
                                        {index === 0 && <Medal className="w-6 h-6 text-yellow-500" />}
                                        {index === 1 && <Medal className="w-6 h-6 text-gray-400" />}
                                        {index === 2 && <Medal className="w-6 h-6 text-amber-700" />}
                                        <span className="font-medium text-sm">{program.programName}</span>
                                    </div>
                                    <div className="text-center mt-3">
                                        <p className="text-3xl font-bold text-primary-600">
                                            {formatTime(program.minDurationSec)}
                                        </p>
                                        <p className="text-xs text-neutral-500 mt-1">
                                            Melhor tempo
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </>
            ) : (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="chart-container text-center py-12"
                >
                    <div className="w-16 h-16 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mx-auto mb-4">
                        <Timer className="w-8 h-8 text-neutral-400" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">Sem Dados de Timing</h3>
                    <p className="text-neutral-500 max-w-md mx-auto">
                        Complete algumas sessões usando o timer de tarefa para ver análises detalhadas de tempo aqui.
                    </p>
                </motion.div>
            )}

            {/* Time Goal Modal */}
            <AnimatePresence>
                {showTimeGoalModal && (
                    <div className="modal-overlay" onClick={() => setShowTimeGoalModal(false)}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="modal-content"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h2 className="text-xl font-bold mb-4">
                                Definir Meta de Tempo
                            </h2>
                            <p className="text-neutral-500 mb-4">
                                Defina uma meta de tempo para <strong>{selectedProgramForGoal?.programName}</strong>
                            </p>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-2">
                                    Meta (em segundos)
                                </label>
                                <input
                                    type="number"
                                    value={timeGoal}
                                    onChange={(e) => setTimeGoal(e.target.value)}
                                    placeholder="Ex: 30"
                                    className="input-field"
                                    min="1"
                                />
                                <p className="text-xs text-neutral-500 mt-1">
                                    Tempo atual: {formatTime(selectedProgramForGoal?.avgDurationSec || 0)}
                                </p>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowTimeGoalModal(false)}
                                    className="btn-secondary flex-1"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleSetTimeGoal}
                                    className="btn-primary flex-1"
                                    disabled={!timeGoal}
                                >
                                    Salvar Meta
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
