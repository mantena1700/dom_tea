'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
    TrendingUp,
    TrendingDown,
    Target,
    Clock,
    Award,
    Activity,
    Brain,
    Sparkles,
    Play,
    Heart,
    Sun,
    Moon,
    CloudRain,
    AlertCircle,
    CheckCircle2,
    Smile,
    Calendar,
    ChevronRight,
    Zap
} from 'lucide-react';
import {
    Card,
    CardWithHeader,
    StatCard,
    Badge,
    ProgressBar,
    Button,
    PageHeader,
    SectionTitle,
    EmptyState,
    ListItem
} from '@/components/ui';
import {
    getPatient,
    getPrograms,
    getSessions,
    getStats,
    getTodayCheckin,
    saveCheckin,
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
    { id: 'normal', label: 'Normal', icon: CheckCircle2 },
    { id: 'flu', label: 'Gripe', icon: AlertCircle },
    { id: 'pain', label: 'Dor', icon: AlertCircle },
];

export default function DashboardPage() {
    const [loading, setLoading] = useState(true);
    const [patient, setPatient] = useState(null);
    const [programs, setPrograms] = useState([]);
    const [stats, setStats] = useState(null);
    const [checkin, setCheckin] = useState({
        sleep: 8,
        mood: 'good',
        health: 'normal'
    });
    const [checkinSaved, setCheckinSaved] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [patientData, programsData, statsData, todayCheckin] = await Promise.all([
                getPatient(),
                getPrograms(),
                getStats(),
                getTodayCheckin()
            ]);

            setPatient(patientData);
            setPrograms(programsData || []);
            setStats(statsData);
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
            await saveCheckin(checkin);
            setCheckinSaved(true);
        } catch (error) {
            console.error('Erro ao salvar check-in:', error);
        }
    };

    // Programas ativos (limitados para mobile)
    const activePrograms = programs.filter(p => p.active).slice(0, 4);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="w-10 h-10 border-4 border-[var(--primary-500)]/30 border-t-[var(--primary-500)] rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">

            {/* Saudação */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-2"
            >
                <h1 className="text-xl md:text-2xl font-bold text-[var(--text-primary)]">
                    Olá! 👋
                </h1>
                <p className="text-sm text-[var(--text-tertiary)]">
                    {patient?.name ? `Acompanhando ${patient.name}` : 'Bem-vindo ao DOM TEA'}
                </p>
            </motion.div>

            {/* Stats Grid - Mobile: 2 colunas, Desktop: 4 */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <StatCard
                    label="Sessões Hoje"
                    value={stats?.todaySessions || 0}
                    icon={Activity}
                    color="primary"
                />
                <StatCard
                    label="Taxa de Acerto"
                    value={`${stats?.globalAccuracy || 0}%`}
                    icon={Target}
                    color={stats?.globalAccuracy >= 80 ? "success" : stats?.globalAccuracy >= 50 ? "warning" : "error"}
                />
                <StatCard
                    label="Sequência"
                    value={`${stats?.streak || 0} dias`}
                    icon={Zap}
                    color="warning"
                />
                <StatCard
                    label="Programas Ativos"
                    value={activePrograms.length}
                    icon={Brain}
                    color="purple"
                />
            </div>

            {/* Check-in Diário - Colapsável em Mobile */}
            {!checkinSaved && (
                <Card className="border-l-4 border-l-[var(--primary-500)]">
                    <div className="flex items-center gap-2 mb-4">
                        <Sun size={20} className="text-[var(--warning-500)]" />
                        <h3 className="font-bold text-[var(--text-primary)]">Check-in do Dia</h3>
                    </div>

                    <div className="space-y-4">
                        {/* Sono */}
                        <div>
                            <label className="text-sm font-medium text-[var(--text-secondary)] mb-2 flex items-center gap-2">
                                <Moon size={16} />
                                Horas de Sono: {checkin.sleep}h
                            </label>
                            <input
                                type="range"
                                min="1"
                                max="12"
                                value={checkin.sleep}
                                onChange={(e) => setCheckin({ ...checkin, sleep: parseInt(e.target.value) })}
                                className="w-full h-2 bg-[var(--bg-tertiary)] rounded-lg appearance-none cursor-pointer accent-[var(--primary-500)]"
                            />
                        </div>

                        {/* Humor */}
                        <div>
                            <label className="text-sm font-medium text-[var(--text-secondary)] mb-2 block">
                                <Smile size={16} className="inline mr-2" />
                                Como está o humor?
                            </label>
                            <div className="flex gap-2 overflow-x-auto pb-2">
                                {moodOptions.map(mood => (
                                    <button
                                        key={mood.id}
                                        onClick={() => setCheckin({ ...checkin, mood: mood.id })}
                                        className={`
                                            flex-shrink-0 flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all
                                            ${checkin.mood === mood.id
                                                ? 'border-[var(--primary-500)] bg-[var(--primary-500)]/10'
                                                : 'border-[var(--border-default)] bg-[var(--bg-tertiary)]'
                                            }
                                        `}
                                    >
                                        <span className="text-2xl">{mood.emoji}</span>
                                        <span className="text-xs font-medium text-[var(--text-secondary)]">{mood.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Saúde */}
                        <div>
                            <label className="text-sm font-medium text-[var(--text-secondary)] mb-2 block">
                                <Heart size={16} className="inline mr-2" />
                                Saúde
                            </label>
                            <div className="flex gap-2 flex-wrap">
                                {healthOptions.map(health => (
                                    <button
                                        key={health.id}
                                        onClick={() => setCheckin({ ...checkin, health: health.id })}
                                        className={`
                                            flex items-center gap-2 px-4 py-2 rounded-xl border-2 transition-all
                                            ${checkin.health === health.id
                                                ? 'border-[var(--primary-500)] bg-[var(--primary-500)]/10'
                                                : 'border-[var(--border-default)] bg-[var(--bg-tertiary)]'
                                            }
                                        `}
                                    >
                                        <health.icon size={16} />
                                        <span className="text-sm font-medium">{health.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <Button onClick={handleSaveCheckin} className="w-full mt-2">
                            <CheckCircle2 size={18} />
                            Salvar Check-in
                        </Button>
                    </div>
                </Card>
            )}

            {/* 2 Colunas em Desktop */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

                {/* Programas - Ocupa 2 colunas */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between">
                        <SectionTitle>Programas em Foco</SectionTitle>
                        <Link href="/programs" className="text-sm text-[var(--primary-500)] font-medium">
                            Ver todos
                        </Link>
                    </div>

                    {activePrograms.length === 0 ? (
                        <EmptyState
                            icon={Brain}
                            title="Nenhum programa ativo"
                            description="Adicione programas para começar o acompanhamento."
                            action={
                                <Link href="/programs">
                                    <Button size="sm">Adicionar Programa</Button>
                                </Link>
                            }
                        />
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {activePrograms.map((program) => (
                                <Card key={program.id} className="group">
                                    <div className="flex items-start justify-between mb-3">
                                        <Badge variant={
                                            program.category === 'MAND' ? 'primary' :
                                                program.category === 'TACT' ? 'success' :
                                                    program.category === 'RECEPTIVO' ? 'warning' :
                                                        program.category === 'SOCIAL' ? 'purple' : 'neutral'
                                        }>
                                            {program.category}
                                        </Badge>
                                        <span className="text-xs text-[var(--text-muted)]">
                                            Meta: {program.targetAccuracy || 80}%
                                        </span>
                                    </div>

                                    <h4 className="font-semibold text-[var(--text-primary)] mb-1 line-clamp-1">
                                        {program.name}
                                    </h4>
                                    <p className="text-xs text-[var(--text-tertiary)] mb-3 line-clamp-1">
                                        {program.description || 'Sem descrição'}
                                    </p>

                                    <ProgressBar
                                        value={program.currentAccuracy || 0}
                                        max={100}
                                        color={program.currentAccuracy >= (program.targetAccuracy || 80) ? "success" : "primary"}
                                        size="sm"
                                    />
                                    <div className="flex justify-between mt-1.5">
                                        <span className="text-xs text-[var(--text-muted)]">Progresso</span>
                                        <span className="text-xs font-medium text-[var(--text-secondary)]">
                                            {program.currentAccuracy || 0}%
                                        </span>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>

                {/* Ações Rápidas */}
                <div className="space-y-4">
                    <SectionTitle>Ação Rápida</SectionTitle>

                    <Link href="/session" className="block">
                        <Card className="bg-gradient-to-br from-[var(--primary-500)] to-[var(--primary-700)] border-none text-white hover:shadow-xl hover:shadow-[var(--primary-500)]/20">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center">
                                    <Play size={28} fill="white" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">Iniciar Sessão</h3>
                                    <p className="text-sm text-white/80">Começar nova sessão de treino</p>
                                </div>
                            </div>
                        </Card>
                    </Link>

                    <Card>
                        <div className="flex items-center gap-3 mb-3">
                            <Award size={20} className="text-[var(--warning-500)]" />
                            <h4 className="font-semibold text-[var(--text-primary)]">Conquistas</h4>
                        </div>
                        <div className="flex gap-2">
                            <div className="w-10 h-10 rounded-full bg-[var(--warning-500)]/20 flex items-center justify-center">
                                🏆
                            </div>
                            <div className="w-10 h-10 rounded-full bg-[var(--success-500)]/20 flex items-center justify-center">
                                ⭐
                            </div>
                            <div className="w-10 h-10 rounded-full bg-[var(--primary-500)]/20 flex items-center justify-center">
                                🎯
                            </div>
                            <Link href="/achievements" className="w-10 h-10 rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center text-[var(--text-muted)]">
                                <ChevronRight size={18} />
                            </Link>
                        </div>
                    </Card>

                    {/* Próxima Sessão Sugerida */}
                    {activePrograms.length > 0 && (
                        <Card>
                            <div className="flex items-center gap-2 mb-3">
                                <Sparkles size={18} className="text-[var(--purple-500)]" />
                                <h4 className="font-semibold text-sm text-[var(--text-primary)]">Sugestão</h4>
                            </div>
                            <p className="text-xs text-[var(--text-tertiary)] mb-2">
                                Programa que precisa de mais prática:
                            </p>
                            <div className="flex items-center justify-between p-2 bg-[var(--bg-tertiary)] rounded-lg">
                                <span className="text-sm font-medium text-[var(--text-primary)]">
                                    {activePrograms[0]?.name}
                                </span>
                                <Badge variant="warning" size="sm">{activePrograms[0]?.currentAccuracy || 0}%</Badge>
                            </div>
                        </Card>
                    )}
                </div>
            </div>

            {/* Dica do Dia */}
            <Card className="bg-gradient-to-r from-[var(--accent-500)]/10 to-[var(--primary-500)]/10 border-[var(--accent-500)]/30">
                <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[var(--accent-500)]/20 flex items-center justify-center flex-shrink-0">
                        <Sparkles size={20} className="text-[var(--accent-600)]" />
                    </div>
                    <div>
                        <h4 className="font-semibold text-[var(--text-primary)] mb-1">Dica do Dia</h4>
                        <p className="text-sm text-[var(--text-secondary)]">
                            Sessões curtas e frequentes são mais eficazes que sessões longas esporádicas.
                            Tente manter 4-5 sessões de 15-20 minutos por dia.
                        </p>
                    </div>
                </div>
            </Card>
        </div>
    );
}
