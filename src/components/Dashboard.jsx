'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
    Target,
    Activity,
    Brain,
    Play,
    Heart,
    Sun,
    Moon,
    AlertCircle,
    CheckCircle2,
    Smile,
    ChevronRight,
    Zap,
    Award,
    Sparkles,
    TrendingUp,
    Calendar
} from 'lucide-react';
import {
    Card,
    StatCard,
    Badge,
    ProgressBar,
    Button,
    SectionTitle,
    EmptyState,
} from '@/components/ui';
import {
    getPatient,
    getPrograms,
    getSessions,
    getTodayCheckin,
    saveDailyCheckin,
} from '@/lib/dataService';

// Opções de humor
const moodOptions = [
    { id: 'great', emoji: '😊', label: 'Ótimo' },
    { id: 'good', emoji: '🙂', label: 'Bem' },
    { id: 'neutral', emoji: '😐', label: 'Normal' },
    { id: 'tired', emoji: '😴', label: 'Cansado' },
    { id: 'sad', emoji: '😢', label: 'Triste' },
];

const healthOptions = [
    { id: 'normal', label: 'Normal', icon: CheckCircle2, color: 'text-emerald-600 dark:text-emerald-400' },
    { id: 'flu', label: 'Gripe', icon: AlertCircle, color: 'text-amber-600 dark:text-amber-400' },
    { id: 'pain', label: 'Dor', icon: AlertCircle, color: 'text-red-600 dark:text-red-400' },
];

export default function DashboardPage() {
    const [loading, setLoading] = useState(true);
    const [patient, setPatient] = useState(null);
    const [programs, setPrograms] = useState([]);
    const [sessions, setSessions] = useState([]);
    const [checkin, setCheckin] = useState({
        sleep: 8,
        mood: 'good',
        health: 'normal'
    });
    const [checkinSaved, setCheckinSaved] = useState(false);
    const [showCheckin, setShowCheckin] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [patientData, programsData, sessionsData, todayCheckin] = await Promise.all([
                getPatient(),
                getPrograms(),
                getSessions(),
                Promise.resolve(getTodayCheckin())
            ]);

            setPatient(patientData);
            setPrograms(programsData || []);
            setSessions(sessionsData || []);
            if (todayCheckin) {
                setCheckin(todayCheckin);
                setCheckinSaved(true);
            }
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveCheckin = async () => {
        try {
            await saveDailyCheckin(checkin);
            setCheckinSaved(true);
        } catch (error) {
            console.error('Erro ao salvar check-in:', error);
        }
    };

    // Estatísticas calculadas
    const todaySessions = sessions.filter(s => {
        const today = new Date().toDateString();
        return new Date(s.startTime).toDateString() === today;
    }).length;

    const globalAccuracy = sessions.length > 0
        ? Math.round(sessions.reduce((acc, s) => acc + (s.accuracy || 0), 0) / sessions.length)
        : 0;

    const activePrograms = programs.filter(p => p.active !== false);
    const displayPrograms = activePrograms.slice(0, 4);

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
        <div className="max-w-6xl mx-auto px-4 py-6 pb-24 lg:pb-6 space-y-6">

            {/* === SAUDAÇÃO === */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between"
            >
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white">
                        Olá! 👋
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        {patient?.name ? `Acompanhando ${patient.name}` : 'Bem-vindo ao DOM TEA'}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 dark:text-slate-500 hidden sm:block">
                        {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'short' })}
                    </span>
                </div>
            </motion.div>

            {/* === STATS GRID === */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                <StatCard
                    label="Sessões Hoje"
                    value={todaySessions}
                    icon={Activity}
                    color="primary"
                />
                <StatCard
                    label="Taxa de Acerto"
                    value={`${globalAccuracy}%`}
                    icon={Target}
                    color={globalAccuracy >= 80 ? "success" : globalAccuracy >= 50 ? "warning" : "error"}
                />
                <StatCard
                    label="Programas Ativos"
                    value={activePrograms.length}
                    icon={Brain}
                    color="purple"
                />
                <StatCard
                    label="Sequência"
                    value="0 dias"
                    icon={Zap}
                    color="warning"
                />
            </div>

            {/* === CHECK-IN DIÁRIO === */}
            {!checkinSaved && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                >
                    <Card className="border-l-4 border-l-blue-500 dark:border-l-blue-400">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2.5">
                                <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                                    <Sun size={18} className="text-amber-600 dark:text-amber-400" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-slate-800 dark:text-white">Check-in do Dia</h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Como está o dia?</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowCheckin(!showCheckin)}
                                className="text-sm text-blue-600 dark:text-blue-400 font-medium"
                            >
                                {showCheckin ? 'Ocultar' : 'Mostrar'}
                            </button>
                        </div>

                        {showCheckin && (
                            <div className="space-y-5">
                                {/* Sono */}
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                            <Moon size={16} className="text-indigo-500" />
                                            Horas de Sono
                                        </label>
                                        <span className="text-lg font-bold text-slate-800 dark:text-white">{checkin.sleep}h</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="1"
                                        max="12"
                                        value={checkin.sleep}
                                        onChange={(e) => setCheckin({ ...checkin, sleep: parseInt(e.target.value) })}
                                        className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                    />
                                    <div className="flex justify-between text-xs text-slate-400 mt-1">
                                        <span>1h</span>
                                        <span>12h</span>
                                    </div>
                                </div>

                                {/* Humor */}
                                <div>
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                                        <Smile size={16} className="text-pink-500" />
                                        Como está o humor?
                                    </label>
                                    <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
                                        {moodOptions.map(mood => (
                                            <button
                                                key={mood.id}
                                                onClick={() => setCheckin({ ...checkin, mood: mood.id })}
                                                className={`
                                                    flex-shrink-0 flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all min-w-[72px]
                                                    ${checkin.mood === mood.id
                                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 shadow-sm'
                                                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600'
                                                    }
                                                `}
                                            >
                                                <span className="text-2xl">{mood.emoji}</span>
                                                <span className="text-xs font-medium text-slate-600 dark:text-slate-300">{mood.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Saúde */}
                                <div>
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                                        <Heart size={16} className="text-red-500" />
                                        Estado de Saúde
                                    </label>
                                    <div className="flex gap-2 flex-wrap">
                                        {healthOptions.map(health => (
                                            <button
                                                key={health.id}
                                                onClick={() => setCheckin({ ...checkin, health: health.id })}
                                                className={`
                                                    flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 transition-all
                                                    ${checkin.health === health.id
                                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                                                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600'
                                                    }
                                                `}
                                            >
                                                <health.icon size={16} className={health.color} />
                                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{health.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <Button onClick={handleSaveCheckin} className="w-full">
                                    <CheckCircle2 size={18} />
                                    Salvar Check-in
                                </Button>
                            </div>
                        )}
                    </Card>
                </motion.div>
            )}

            {/* === GRID 2 COLUNAS === */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* PROGRAMAS EM FOCO */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between">
                        <SectionTitle>Programas em Foco</SectionTitle>
                        <Link href="/programs" className="text-sm text-blue-600 dark:text-blue-400 font-medium hover:underline flex items-center gap-1">
                            Ver todos <ChevronRight size={16} />
                        </Link>
                    </div>

                    {displayPrograms.length === 0 ? (
                        <EmptyState
                            icon={Brain}
                            title="Nenhum programa ativo"
                            description="Adicione programas de ensino para começar o acompanhamento."
                            action={
                                <Link href="/programs">
                                    <Button size="sm">Adicionar Programa</Button>
                                </Link>
                            }
                        />
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {displayPrograms.map((program, idx) => (
                                <motion.div
                                    key={program.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                >
                                    <Card hover className="h-full">
                                        <div className="flex items-start justify-between mb-3">
                                            <Badge variant={
                                                program.category === 'MAND' ? 'primary' :
                                                    program.category === 'TACT' ? 'success' :
                                                        program.category === 'RECEPTIVO' ? 'warning' :
                                                            program.category === 'SOCIAL' ? 'purple' : 'neutral'
                                            } size="sm">
                                                {program.category || 'Geral'}
                                            </Badge>
                                            <span className="text-xs text-slate-400 dark:text-slate-500">
                                                Meta: {program.targetAccuracy || 80}%
                                            </span>
                                        </div>

                                        <h4 className="font-semibold text-slate-800 dark:text-white mb-1 line-clamp-1">
                                            {program.name}
                                        </h4>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 line-clamp-2 min-h-[32px]">
                                            {program.description || 'Sem descrição'}
                                        </p>

                                        <ProgressBar
                                            value={program.currentAccuracy || 0}
                                            max={100}
                                            color={program.currentAccuracy >= (program.targetAccuracy || 80) ? "success" : "primary"}
                                            size="sm"
                                        />
                                        <div className="flex justify-between mt-2">
                                            <span className="text-xs text-slate-400">Progresso</span>
                                            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                                                {program.currentAccuracy || 0}%
                                            </span>
                                        </div>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>

                {/* AÇÕES RÁPIDAS */}
                <div className="space-y-4">
                    <SectionTitle>Ação Rápida</SectionTitle>

                    {/* Botão Iniciar Sessão */}
                    <Link href="/session" className="block">
                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="bg-gradient-to-br from-blue-600 to-blue-700 dark:from-blue-600 dark:to-blue-800 rounded-2xl p-5 text-white shadow-lg shadow-blue-600/25 hover:shadow-xl hover:shadow-blue-600/30 transition-shadow cursor-pointer"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center">
                                    <Play size={28} fill="white" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">Iniciar Sessão</h3>
                                    <p className="text-sm text-white/80">Começar nova sessão de treino</p>
                                </div>
                            </div>
                        </motion.div>
                    </Link>

                    {/* Conquistas */}
                    <Card>
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                                <Award size={18} className="text-amber-600 dark:text-amber-400" />
                            </div>
                            <h4 className="font-semibold text-slate-800 dark:text-white">Conquistas</h4>
                        </div>
                        <div className="flex gap-2">
                            <div className="w-11 h-11 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-xl">🏆</div>
                            <div className="w-11 h-11 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-xl">⭐</div>
                            <div className="w-11 h-11 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-xl">🎯</div>
                            <Link href="/achievements" className="w-11 h-11 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                                <ChevronRight size={18} className="text-slate-400" />
                            </Link>
                        </div>
                    </Card>

                    {/* Sugestão */}
                    {activePrograms.length > 0 && (
                        <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border-purple-200/50 dark:border-purple-800/50">
                            <div className="flex items-center gap-2.5 mb-3">
                                <Sparkles size={18} className="text-purple-600 dark:text-purple-400" />
                                <h4 className="font-semibold text-slate-800 dark:text-white text-sm">Sugestão do Dia</h4>
                            </div>
                            <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">
                                Programa que precisa de mais prática:
                            </p>
                            <div className="flex items-center justify-between p-3 bg-white/60 dark:bg-slate-800/60 rounded-xl">
                                <span className="text-sm font-medium text-slate-800 dark:text-white truncate flex-1 mr-2">
                                    {activePrograms[0]?.name}
                                </span>
                                <Badge variant="warning" size="sm">{activePrograms[0]?.currentAccuracy || 0}%</Badge>
                            </div>
                        </Card>
                    )}
                </div>
            </div>

            {/* === DICA DO DIA === */}
            <Card className="bg-gradient-to-r from-cyan-50 via-blue-50 to-indigo-50 dark:from-cyan-900/20 dark:via-blue-900/20 dark:to-indigo-900/20 border-cyan-200/50 dark:border-cyan-800/50">
                <div className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-xl bg-cyan-100 dark:bg-cyan-900/40 flex items-center justify-center flex-shrink-0">
                        <Sparkles size={22} className="text-cyan-600 dark:text-cyan-400" />
                    </div>
                    <div>
                        <h4 className="font-semibold text-slate-800 dark:text-white mb-1">💡 Dica do Dia</h4>
                        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                            Sessões curtas e frequentes são mais eficazes que sessões longas esporádicas.
                            Tente manter <strong>4-5 sessões de 15-20 minutos</strong> por dia para melhores resultados.
                        </p>
                    </div>
                </div>
            </Card>
        </div>
    );
}
