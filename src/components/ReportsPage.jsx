'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js';
import {
    BarChart3,
    TrendingUp,
    TrendingDown,
    Calendar,
    Download,
    Filter,
    Activity,
    Target,
    Award,
    Clock,
} from 'lucide-react';
import {
    getSessions,
    getTrials,
    getPrograms,
    getBehaviorRecords,
    getBehaviors,
    getDailyCheckins,
} from '@/lib/dataService';
import { format, subDays, eachDayOfInterval, startOfWeek, endOfWeek } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

export default function ReportsPage() {
    const [mounted, setMounted] = useState(false);
    const [dateRange, setDateRange] = useState('30'); // days
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [sessions, setSessions] = useState([]);
    const [trials, setTrials] = useState([]);
    const [programs, setPrograms] = useState([]);
    const [behaviors, setBehaviors] = useState([]);
    const [behaviorRecords, setBehaviorRecords] = useState([]);
    const [checkins, setCheckins] = useState([]);

    useEffect(() => {
        setMounted(true);
        loadData();
    }, []);

    const loadData = () => {
        setSessions(getSessions());
        setTrials(getTrials());
        setPrograms(getPrograms());
        setBehaviors(getBehaviors());
        setBehaviorRecords(getBehaviorRecords());
        setCheckins(getDailyCheckins());
    };

    // Filter data based on date range
    const filteredData = useMemo(() => {
        const days = parseInt(dateRange);
        const startDate = subDays(new Date(), days);

        return {
            sessions: sessions.filter(s => new Date(s.startTime) >= startDate),
            trials: trials.filter(t => new Date(t.timestamp) >= startDate),
            behaviorRecords: behaviorRecords.filter(r => new Date(r.timestamp) >= startDate),
            checkins: checkins.filter(c => new Date(c.date) >= startDate),
        };
    }, [sessions, trials, behaviorRecords, checkins, dateRange]);

    // Calculate statistics
    const stats = useMemo(() => {
        const { sessions: fSessions, trials: fTrials } = filteredData;

        const correct = fTrials.filter(t => t.result === 'correct').length;
        const total = fTrials.length;
        const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;

        // Average session duration
        const completedSessions = fSessions.filter(s => s.status === 'completed' && s.endTime);
        const avgDuration = completedSessions.length > 0
            ? Math.round(
                completedSessions.reduce((sum, s) => {
                    return sum + (new Date(s.endTime) - new Date(s.startTime)) / 1000 / 60;
                }, 0) / completedSessions.length
            )
            : 0;

        return {
            totalSessions: fSessions.length,
            totalTrials: total,
            accuracy,
            avgDuration,
            trialsPerSession: fSessions.length > 0 ? Math.round(total / fSessions.length) : 0,
        };
    }, [filteredData]);

    // Daily accuracy chart data
    const dailyAccuracyData = useMemo(() => {
        const days = parseInt(dateRange);
        const interval = {
            start: subDays(new Date(), days),
            end: new Date(),
        };
        const allDays = eachDayOfInterval(interval);

        const dataByDay = {};
        filteredData.trials.forEach(trial => {
            const day = format(new Date(trial.timestamp), 'yyyy-MM-dd');
            if (!dataByDay[day]) {
                dataByDay[day] = { correct: 0, total: 0 };
            }
            dataByDay[day].total++;
            if (trial.result === 'correct') {
                dataByDay[day].correct++;
            }
        });

        return {
            labels: allDays.map(d => format(d, 'dd/MM', { locale: ptBR })),
            datasets: [
                {
                    label: 'Taxa de Acerto (%)',
                    data: allDays.map(d => {
                        const key = format(d, 'yyyy-MM-dd');
                        const dayData = dataByDay[key];
                        return dayData && dayData.total > 0
                            ? Math.round((dayData.correct / dayData.total) * 100)
                            : null;
                    }),
                    borderColor: '#6366F1',
                    backgroundColor: (context) => {
                        const ctx = context.chart.ctx;
                        const gradient = ctx.createLinearGradient(0, 0, 0, 300);
                        gradient.addColorStop(0, 'rgba(99, 102, 241, 0.4)');
                        gradient.addColorStop(0.5, 'rgba(99, 102, 241, 0.15)');
                        gradient.addColorStop(1, 'rgba(99, 102, 241, 0)');
                        return gradient;
                    },
                    fill: true,
                    tension: 0.4,
                    pointRadius: 6,
                    pointHoverRadius: 8,
                    pointBackgroundColor: '#6366F1',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 3,
                    pointHoverBackgroundColor: '#4F46E5',
                    borderWidth: 3,
                },
            ],
        };
    }, [filteredData, dateRange]);

    // Trials by program chart
    const trialsByProgramData = useMemo(() => {
        const programTrials = {};

        filteredData.trials.forEach(trial => {
            if (!programTrials[trial.programId]) {
                programTrials[trial.programId] = { correct: 0, total: 0 };
            }
            programTrials[trial.programId].total++;
            if (trial.result === 'correct') {
                programTrials[trial.programId].correct++;
            }
        });

        const programData = programs
            .filter(p => programTrials[p.id])
            .map(p => ({
                name: p.name,
                category: p.category,
                ...programTrials[p.id],
                accuracy: Math.round((programTrials[p.id].correct / programTrials[p.id].total) * 100),
            }))
            .sort((a, b) => b.total - a.total)
            .slice(0, 8);

        return {
            labels: programData.map(p => p.name.length > 18 ? p.name.substring(0, 18) + '...' : p.name),
            datasets: [
                {
                    label: 'Corretos',
                    data: programData.map(p => p.correct),
                    backgroundColor: (context) => {
                        const ctx = context.chart.ctx;
                        const gradient = ctx.createLinearGradient(0, 0, 200, 0);
                        gradient.addColorStop(0, 'rgba(16, 185, 129, 0.9)');
                        gradient.addColorStop(1, 'rgba(52, 211, 153, 0.9)');
                        return gradient;
                    },
                    borderRadius: 8,
                    borderSkipped: false,
                },
                {
                    label: 'Incorretos',
                    data: programData.map(p => p.total - p.correct),
                    backgroundColor: (context) => {
                        const ctx = context.chart.ctx;
                        const gradient = ctx.createLinearGradient(0, 0, 200, 0);
                        gradient.addColorStop(0, 'rgba(239, 68, 68, 0.8)');
                        gradient.addColorStop(1, 'rgba(248, 113, 113, 0.8)');
                        return gradient;
                    },
                    borderRadius: 8,
                    borderSkipped: false,
                },
            ],
        };
    }, [filteredData, programs]);

    // Category distribution
    const categoryDistributionData = useMemo(() => {
        const categories = {};

        filteredData.trials.forEach(trial => {
            const program = programs.find(p => p.id === trial.programId);
            if (program) {
                if (!categories[program.category]) {
                    categories[program.category] = 0;
                }
                categories[program.category]++;
            }
        });

        const colors = {
            'MAND': ['#3B82F6', '#60A5FA'],
            'TACT': ['#10B981', '#34D399'],
            'RECEPTIVO': ['#F59E0B', '#FBBF24'],
            'MOTOR': ['#8B5CF6', '#A78BFA'],
            'SOCIAL': ['#EC4899', '#F472B6'],
            'INTRAVERBAL': ['#06B6D4', '#22D3EE'],
        };

        return {
            labels: Object.keys(categories),
            datasets: [
                {
                    data: Object.values(categories),
                    backgroundColor: Object.keys(categories).map(cat => colors[cat]?.[0] || '#94A3B8'),
                    hoverBackgroundColor: Object.keys(categories).map(cat => colors[cat]?.[1] || '#CBD5E1'),
                    borderWidth: 0,
                    spacing: 4,
                    borderRadius: 6,
                },
            ],
        };
    }, [filteredData, programs]);

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
            intersect: false,
            mode: 'index',
        },
        plugins: {
            legend: {
                display: true,
                position: 'bottom',
                labels: {
                    usePointStyle: true,
                    pointStyle: 'circle',
                    padding: 24,
                    font: {
                        size: 12,
                        weight: '500',
                    },
                    color: '#64748B',
                },
            },
            tooltip: {
                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                titleColor: '#fff',
                bodyColor: '#CBD5E1',
                padding: 16,
                cornerRadius: 12,
                titleFont: { size: 14, weight: '600' },
                bodyFont: { size: 13 },
                displayColors: true,
                boxPadding: 6,
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(148, 163, 184, 0.1)',
                    drawBorder: false,
                },
                ticks: {
                    color: '#94A3B8',
                    font: { size: 11 },
                    padding: 8,
                },
                border: {
                    display: false,
                },
            },
            x: {
                grid: {
                    display: false,
                },
                ticks: {
                    color: '#94A3B8',
                    font: { size: 10 },
                    maxRotation: 45,
                    padding: 4,
                },
                border: {
                    display: false,
                },
            },
        },
    };

    if (!mounted) {
        return <div className="animate-pulse p-8">Carregando...</div>;
    }

    return (
        <div className="animate-fade-in">
            {/* Page Header */}
            <div className="page-header flex flex-wrap items-start justify-between gap-4">
                <div>
                    <h1 className="page-title flex items-center gap-3">
                        <BarChart3 className="w-8 h-8 text-primary-500" />
                        Relatórios e Estatísticas
                    </h1>
                    <p className="page-subtitle">
                        Visualize gráficos detalhados do progresso terapêutico.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <select
                        value={dateRange}
                        onChange={(e) => setDateRange(e.target.value)}
                        className="input-field w-auto"
                    >
                        <option value="7">Últimos 7 dias</option>
                        <option value="14">Últimos 14 dias</option>
                        <option value="30">Últimos 30 dias</option>
                        <option value="60">Últimos 60 dias</option>
                        <option value="90">Últimos 90 dias</option>
                    </select>

                    <button className="btn-primary">
                        <Download size={18} />
                        Exportar
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid mb-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="stat-card"
                >
                    <div className="flex items-center justify-between mb-3">
                        <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center">
                            <Activity className="w-6 h-6 text-primary-600" />
                        </div>
                    </div>
                    <p className="text-3xl font-bold">{stats.totalSessions}</p>
                    <p className="text-neutral-500 text-sm">Total de Sessões</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="stat-card"
                >
                    <div className="flex items-center justify-between mb-3">
                        <div className="w-12 h-12 rounded-xl bg-success-100 flex items-center justify-center">
                            <Target className="w-6 h-6 text-success-600" />
                        </div>
                    </div>
                    <p className="text-3xl font-bold">{stats.totalTrials}</p>
                    <p className="text-neutral-500 text-sm">Total de Tentativas</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="stat-card"
                >
                    <div className="flex items-center justify-between mb-3">
                        <div className="w-12 h-12 rounded-xl bg-warning-100 flex items-center justify-center">
                            <Award className="w-6 h-6 text-warning-600" />
                        </div>
                        {stats.accuracy >= 70 && (
                            <TrendingUp className="w-5 h-5 text-success-500" />
                        )}
                    </div>
                    <p className="text-3xl font-bold">{stats.accuracy}%</p>
                    <p className="text-neutral-500 text-sm">Taxa de Acerto Média</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="stat-card"
                >
                    <div className="flex items-center justify-between mb-3">
                        <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                            <Clock className="w-6 h-6 text-purple-600" />
                        </div>
                    </div>
                    <p className="text-3xl font-bold">{stats.avgDuration}</p>
                    <p className="text-neutral-500 text-sm">Média de Minutos/Sessão</p>
                </motion.div>
            </div>

            {/* Charts Grid */}
            <div className="space-y-6 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-6 mb-8">
                {/* Daily Accuracy Chart */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="chart-container p-5 lg:p-6"
                >
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-base lg:text-lg flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                                <TrendingUp className="w-4 h-4 text-white" />
                            </div>
                            Evolução Diária
                        </h3>
                    </div>
                    <div className="h-64 lg:h-72">
                        <Line data={dailyAccuracyData} options={chartOptions} />
                    </div>
                </motion.div>

                {/* Category Distribution */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="chart-container p-5 lg:p-6"
                >
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-base lg:text-lg flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                                <Filter className="w-4 h-4 text-white" />
                            </div>
                            Distribuição por Categoria
                        </h3>
                    </div>
                    <div className="h-64 lg:h-72 flex items-center justify-center">
                        <div className="w-52 lg:w-64">
                            <Doughnut
                                data={categoryDistributionData}
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    cutout: '70%',
                                    plugins: {
                                        legend: {
                                            display: true,
                                            position: 'bottom',
                                            labels: {
                                                usePointStyle: true,
                                                pointStyle: 'circle',
                                                padding: 20,
                                                font: { size: 12, weight: '500' },
                                                color: '#64748B',
                                            },
                                        },
                                        tooltip: {
                                            backgroundColor: 'rgba(15, 23, 42, 0.9)',
                                            titleColor: '#fff',
                                            bodyColor: '#CBD5E1',
                                            padding: 16,
                                            cornerRadius: 12,
                                            titleFont: { size: 14, weight: '600' },
                                            bodyFont: { size: 13 },
                                        },
                                    },
                                    // Remove scales completely for doughnut
                                    scales: {},
                                }}
                            />
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Trials by Program Chart */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="chart-container p-5 lg:p-6 mt-6"
            >
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-base lg:text-lg flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                            <BarChart3 className="w-4 h-4 text-white" />
                        </div>
                        Desempenho por Programa
                    </h3>
                </div>
                <div className="h-72 lg:h-80">
                    <Bar
                        data={trialsByProgramData}
                        options={{
                            ...chartOptions,
                            indexAxis: 'y',
                            plugins: {
                                ...chartOptions.plugins,
                                legend: {
                                    ...chartOptions.plugins.legend,
                                    position: 'bottom',
                                },
                            },
                            scales: {
                                x: {
                                    stacked: true,
                                    beginAtZero: true,
                                    grid: {
                                        color: 'rgba(148, 163, 184, 0.08)',
                                        drawBorder: false,
                                    },
                                    ticks: {
                                        color: '#94A3B8',
                                        font: { size: 11 },
                                    },
                                    border: { display: false },
                                },
                                y: {
                                    stacked: true,
                                    grid: { display: false },
                                    ticks: {
                                        color: '#64748B',
                                        font: { size: 11, weight: '500' },
                                        padding: 8,
                                    },
                                    border: { display: false },
                                },
                            },
                        }}
                    />
                </div>
            </motion.div>

            {/* Sessions Table */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="chart-container mt-6"
            >
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-purple-500" />
                    Histórico de Sessões
                </h3>
                <div className="overflow-x-auto">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Data</th>
                                <th>Início</th>
                                <th>Duração</th>
                                <th>Tentativas</th>
                                <th>Acertos</th>
                                <th>Taxa</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredData.sessions.slice(0, 10).map((session) => {
                                const sessionTrials = filteredData.trials.filter(t => t.sessionId === session.id);
                                const correct = sessionTrials.filter(t => t.result === 'correct').length;
                                const accuracy = sessionTrials.length > 0
                                    ? Math.round((correct / sessionTrials.length) * 100)
                                    : 0;
                                const duration = session.endTime
                                    ? Math.round((new Date(session.endTime) - new Date(session.startTime)) / 1000 / 60)
                                    : '-';

                                return (
                                    <tr key={session.id}>
                                        <td>{format(new Date(session.startTime), 'dd/MM/yyyy', { locale: ptBR })}</td>
                                        <td>{format(new Date(session.startTime), 'HH:mm')}</td>
                                        <td>{duration !== '-' ? `${duration} min` : '-'}</td>
                                        <td>{sessionTrials.length}</td>
                                        <td className="text-success-600 font-medium">{correct}</td>
                                        <td>
                                            <span className={`badge ${accuracy >= 70 ? 'badge-success' :
                                                accuracy >= 50 ? 'badge-warning' : 'badge-error'
                                                }`}>
                                                {accuracy}%
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`badge ${session.status === 'completed' ? 'badge-success' : 'badge-warning'
                                                }`}>
                                                {session.status === 'completed' ? 'Concluída' : 'Em andamento'}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                            {filteredData.sessions.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="text-center text-neutral-500 py-8">
                                        Nenhuma sessão encontrada no período selecionado.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </motion.div>
        </div>
    );
}
