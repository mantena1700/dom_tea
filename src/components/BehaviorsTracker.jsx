'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus,
    Search,
    TrendingUp,
    TrendingDown,
    Activity,
    Eye,
    Edit2,
    X,
    Check,
    Calendar
} from 'lucide-react';
import {
    Card,
    Badge,
    Button,
    Input,
    Textarea,
    PageHeader,
    StatCard,
    EmptyState
} from '@/components/ui';
import {
    getBehaviors,
    addBehavior,
    updateBehavior,
    deleteBehavior,
    addBehaviorRecord,
    getBehaviorRecords,
} from '@/lib/dataService';

const BEHAVIOR_TYPES = [
    { id: 'ALL', label: 'Todos' },
    { id: 'reduce', label: 'Reduzir', icon: TrendingDown },
    { id: 'increase', label: 'Aumentar', icon: TrendingUp },
    { id: 'monitor', label: 'Monitorar', icon: Eye },
];

const PRIORITY_OPTIONS = [
    { id: 'high', label: 'Alta' },
    { id: 'medium', label: 'Média' },
    { id: 'low', label: 'Baixa' },
];

export default function BehaviorsTracker() {
    const [loading, setLoading] = useState(true);
    const [behaviors, setBehaviors] = useState([]);
    const [records, setRecords] = useState([]);
    const [activeFilter, setActiveFilter] = useState('ALL');
    const [search, setSearch] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingBehavior, setEditingBehavior] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        type: 'reduce',
        priority: 'medium'
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [behaviorsData, recordsData] = await Promise.all([
                getBehaviors(),
                getBehaviorRecords()
            ]);
            setBehaviors(behaviorsData || []);
            setRecords(recordsData || []);
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveBehavior = async () => {
        try {
            if (editingBehavior) {
                await updateBehavior(editingBehavior.id, formData);
            } else {
                await addBehavior(formData);
            }
            await loadData();
            handleCloseForm();
        } catch (error) {
            console.error('Erro ao salvar comportamento:', error);
        }
    };

    const handleDeleteBehavior = async (id) => {
        if (confirm('Tem certeza que deseja excluir este comportamento?')) {
            try {
                await deleteBehavior(id);
                await loadData();
            } catch (error) {
                console.error('Erro ao excluir comportamento:', error);
            }
        }
    };

    const handleRecordOccurrence = async (behaviorId) => {
        try {
            await addBehaviorRecord({
                behaviorId,
                timestamp: new Date().toISOString(),
            });
            await loadData();
        } catch (error) {
            console.error('Erro ao registrar ocorrência:', error);
        }
    };

    const handleEditBehavior = (behavior) => {
        setEditingBehavior(behavior);
        setFormData({
            name: behavior.name,
            description: behavior.description || '',
            type: behavior.type,
            priority: behavior.priority || 'medium'
        });
        setShowForm(true);
    };

    const handleCloseForm = () => {
        setShowForm(false);
        setEditingBehavior(null);
        setFormData({
            name: '',
            description: '',
            type: 'reduce',
            priority: 'medium'
        });
    };

    // Estatísticas
    const getTodayCount = (behaviorId) => {
        const today = new Date().toDateString();
        return records.filter(r => r.behaviorId === behaviorId && new Date(r.timestamp).toDateString() === today).length;
    };

    const getWeekAverage = (behaviorId) => {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const weekRecords = records.filter(r => r.behaviorId === behaviorId && new Date(r.timestamp) >= weekAgo);
        return (weekRecords.length / 7).toFixed(1);
    };

    // Filtros
    const filteredBehaviors = behaviors.filter(b => {
        const matchSearch = b.name.toLowerCase().includes(search.toLowerCase());
        const matchFilter = activeFilter === 'ALL' || b.type === activeFilter;
        return matchSearch && matchFilter;
    });

    // Stats globais
    const stats = {
        toReduce: behaviors.filter(b => b.type === 'reduce').length,
        toIncrease: behaviors.filter(b => b.type === 'increase').length,
        todayRecords: records.filter(r => new Date(r.timestamp).toDateString() === new Date().toDateString()).length
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="w-10 h-10 border-4 border-blue-200 dark:border-blue-900 border-t-blue-600 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto px-4 py-6">

            <PageHeader
                title="Comportamentos"
                subtitle="Monitore comportamentos-alvo"
                action={
                    <Button onClick={() => setShowForm(true)}>
                        <Plus size={18} />
                        <span className="hidden sm:inline">Novo</span>
                    </Button>
                }
            />

            {/* Stats Resumo */}
            <div className="grid grid-cols-3 gap-3 mb-6">
                <StatCard
                    label="Para Reduzir"
                    value={stats.toReduce}
                    icon={TrendingDown}
                    color="error"
                />
                <StatCard
                    label="Para Aumentar"
                    value={stats.toIncrease}
                    icon={TrendingUp}
                    color="success"
                />
                <StatCard
                    label="Registros Hoje"
                    value={stats.todayRecords}
                    icon={Calendar}
                    color="primary"
                />
            </div>

            {/* Busca e Filtros */}
            <div className="space-y-3 mb-6">
                <Input
                    icon={Search}
                    placeholder="Buscar comportamento..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />

                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                    {BEHAVIOR_TYPES.map(type => (
                        <button
                            key={type.id}
                            onClick={() => setActiveFilter(type.id)}
                            className={`
                                flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all
                                ${activeFilter === type.id
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                                }
                            `}
                        >
                            {type.icon && <type.icon size={16} />}
                            {type.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Lista de Comportamentos */}
            {filteredBehaviors.length === 0 ? (
                <EmptyState
                    icon={Activity}
                    title="Nenhum comportamento encontrado"
                    description={search ? "Tente buscar com outros termos" : "Adicione comportamentos para monitorar"}
                    action={
                        !search && <Button onClick={() => setShowForm(true)} size="sm">Adicionar</Button>
                    }
                />
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredBehaviors.map((behavior) => (
                        <motion.div
                            key={behavior.id}
                            layout
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                        >
                            <Card className="h-full flex flex-col">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <Badge
                                            variant={
                                                behavior.type === 'reduce' ? 'error' :
                                                    behavior.type === 'increase' ? 'success' : 'primary'
                                            }
                                        >
                                            {behavior.type === 'reduce' ? 'Reduzir' :
                                                behavior.type === 'increase' ? 'Aumentar' : 'Monitorar'}
                                        </Badge>
                                        <Badge variant={
                                            behavior.priority === 'high' ? 'error' :
                                                behavior.priority === 'medium' ? 'warning' : 'neutral'
                                        } size="sm">
                                            {behavior.priority === 'high' ? 'Alta' :
                                                behavior.priority === 'medium' ? 'Média' : 'Baixa'}
                                        </Badge>
                                    </div>
                                    <button
                                        onClick={() => handleEditBehavior(behavior)}
                                        className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400"
                                    >
                                        <Edit2 size={14} />
                                    </button>
                                </div>

                                <h3 className="font-semibold text-slate-800 dark:text-white mb-1">
                                    {behavior.name}
                                </h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 line-clamp-2 flex-1">
                                    {behavior.description || 'Sem descrição'}
                                </p>

                                {/* Estatísticas */}
                                <div className="grid grid-cols-2 gap-2 mb-4 p-3 bg-slate-100 dark:bg-slate-700 rounded-xl">
                                    <div className="text-center">
                                        <div className="text-lg font-bold text-slate-800 dark:text-white">
                                            {getTodayCount(behavior.id)}
                                        </div>
                                        <div className="text-xs text-slate-400">Hoje</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-lg font-bold text-slate-800 dark:text-white">
                                            {getWeekAverage(behavior.id)}
                                        </div>
                                        <div className="text-xs text-slate-400">Média/dia</div>
                                    </div>
                                </div>

                                {/* Ação */}
                                <Button
                                    onClick={() => handleRecordOccurrence(behavior.id)}
                                    variant="secondary"
                                    size="sm"
                                    className="w-full"
                                >
                                    <Plus size={16} />
                                    Registrar Ocorrência
                                </Button>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Modal de Formulário */}
            <AnimatePresence>
                {showForm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4"
                        onClick={handleCloseForm}
                    >
                        <motion.div
                            initial={{ y: 100, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 100, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full max-w-lg bg-white dark:bg-slate-800 rounded-t-3xl sm:rounded-3xl p-6 max-h-[90vh] overflow-y-auto"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                                    {editingBehavior ? 'Editar Comportamento' : 'Novo Comportamento'}
                                </h2>
                                <button
                                    onClick={handleCloseForm}
                                    className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
                                >
                                    <X size={20} className="text-slate-400" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <Input
                                    label="Nome do Comportamento"
                                    placeholder="Ex: Autolesão"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />

                                <Textarea
                                    label="Descrição"
                                    placeholder="Descreva o comportamento..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Tipo
                                    </label>
                                    <div className="flex gap-2">
                                        {BEHAVIOR_TYPES.filter(t => t.id !== 'ALL').map(type => (
                                            <button
                                                key={type.id}
                                                onClick={() => setFormData({ ...formData, type: type.id })}
                                                className={`
                                                    flex-1 flex items-center justify-center gap-2 px-3 py-3 rounded-xl text-sm font-medium transition-all
                                                    ${formData.type === type.id
                                                        ? 'bg-blue-600 text-white'
                                                        : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                                                    }
                                                `}
                                            >
                                                {type.icon && <type.icon size={16} />}
                                                {type.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Prioridade
                                    </label>
                                    <div className="flex gap-2">
                                        {PRIORITY_OPTIONS.map(opt => (
                                            <button
                                                key={opt.id}
                                                onClick={() => setFormData({ ...formData, priority: opt.id })}
                                                className={`
                                                    flex-1 px-3 py-2 rounded-xl text-sm font-medium transition-all
                                                    ${formData.priority === opt.id
                                                        ? 'bg-blue-600 text-white'
                                                        : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                                                    }
                                                `}
                                            >
                                                {opt.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <Button
                                        variant="secondary"
                                        onClick={handleCloseForm}
                                        className="flex-1"
                                    >
                                        Cancelar
                                    </Button>
                                    <Button
                                        onClick={handleSaveBehavior}
                                        className="flex-1"
                                        disabled={!formData.name.trim()}
                                    >
                                        <Check size={18} />
                                        Salvar
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
