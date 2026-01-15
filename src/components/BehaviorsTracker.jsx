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
    Calendar,
    Trash2
} from 'lucide-react';
import {
    Card,
    Badge,
    Button,
    Input,
    Textarea,
    PageHeader,
    StatCard,
    EmptyState,
    Modal
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
    { id: 'ALL', label: 'Todos', icon: Activity },
    { id: 'reduce', label: 'Reduzir', icon: TrendingDown, color: 'error' },
    { id: 'increase', label: 'Aumentar', icon: TrendingUp, color: 'success' },
    { id: 'monitor', label: 'Monitorar', icon: Eye, color: 'primary' },
];

const PRIORITY_OPTIONS = [
    { id: 'high', label: 'Alta', color: 'error' },
    { id: 'medium', label: 'Média', color: 'warning' },
    { id: 'low', label: 'Baixa', color: 'neutral' },
];

export default function BehaviorsTracker() {
    const [loading, setLoading] = useState(true);
    const [behaviors, setBehaviors] = useState([]);
    const [records, setRecords] = useState([]);
    const [activeFilter, setActiveFilter] = useState('ALL');
    const [search, setSearch] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingBehavior, setEditingBehavior] = useState(null);
    const [saving, setSaving] = useState(false);
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
        if (!formData.name.trim()) return;

        setSaving(true);
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
        } finally {
            setSaving(false);
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
            type: behavior.type || 'reduce',
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
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-blue-200 dark:border-blue-900 border-t-blue-600 rounded-full animate-spin" />
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Carregando...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-4 py-6 pb-24 lg:pb-6">

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

            {/* === STATS === */}
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

            {/* === BUSCA E FILTROS === */}
            <div className="space-y-4 mb-6">
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
                                flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all
                                ${activeFilter === type.id
                                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600'
                                }
                            `}
                        >
                            <type.icon size={16} />
                            {type.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* === LISTA === */}
            {filteredBehaviors.length === 0 ? (
                <EmptyState
                    icon={Activity}
                    title="Nenhum comportamento encontrado"
                    description={search ? "Tente buscar com outros termos" : "Adicione comportamentos para monitorar"}
                    action={
                        !search && (
                            <Button onClick={() => setShowForm(true)} size="sm">
                                <Plus size={16} />
                                Adicionar
                            </Button>
                        )
                    }
                />
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredBehaviors.map((behavior, idx) => (
                        <motion.div
                            key={behavior.id}
                            layout
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                        >
                            <Card className="h-full flex flex-col">
                                {/* Header */}
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <Badge variant={
                                            behavior.type === 'reduce' ? 'error' :
                                                behavior.type === 'increase' ? 'success' : 'primary'
                                        }>
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
                                        className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 transition-colors"
                                    >
                                        <Edit2 size={14} />
                                    </button>
                                </div>

                                {/* Content */}
                                <h3 className="font-semibold text-slate-800 dark:text-white mb-1.5 text-lg">
                                    {behavior.name}
                                </h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 line-clamp-2 flex-1 min-h-[40px]">
                                    {behavior.description || 'Sem descrição'}
                                </p>

                                {/* Stats */}
                                <div className="grid grid-cols-2 gap-2 mb-4 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                                    <div className="text-center">
                                        <div className="text-xl font-bold text-slate-800 dark:text-white">
                                            {getTodayCount(behavior.id)}
                                        </div>
                                        <div className="text-xs text-slate-500 dark:text-slate-400">Hoje</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-xl font-bold text-slate-800 dark:text-white">
                                            {getWeekAverage(behavior.id)}
                                        </div>
                                        <div className="text-xs text-slate-500 dark:text-slate-400">Média/dia</div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2">
                                    <Button
                                        onClick={() => handleRecordOccurrence(behavior.id)}
                                        variant="secondary"
                                        size="sm"
                                        className="flex-1"
                                    >
                                        <Plus size={16} />
                                        Registrar
                                    </Button>
                                    <button
                                        onClick={() => handleDeleteBehavior(behavior.id)}
                                        className="p-2.5 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* === MODAL === */}
            <Modal
                isOpen={showForm}
                onClose={handleCloseForm}
                title={editingBehavior ? 'Editar Comportamento' : 'Novo Comportamento'}
            >
                <div className="space-y-5">
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
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2.5">
                            Tipo de Comportamento
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                            {BEHAVIOR_TYPES.filter(t => t.id !== 'ALL').map(type => (
                                <button
                                    key={type.id}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, type: type.id })}
                                    className={`
                                        flex flex-col items-center gap-2 p-4 rounded-xl text-sm font-medium transition-all
                                        ${formData.type === type.id
                                            ? 'bg-blue-600 text-white shadow-md'
                                            : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                                        }
                                    `}
                                >
                                    <type.icon size={22} />
                                    {type.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2.5">
                            Prioridade
                        </label>
                        <div className="flex gap-2">
                            {PRIORITY_OPTIONS.map(opt => (
                                <button
                                    key={opt.id}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, priority: opt.id })}
                                    className={`
                                        flex-1 px-4 py-3 rounded-xl text-sm font-medium transition-all
                                        ${formData.priority === opt.id
                                            ? 'bg-blue-600 text-white shadow-md'
                                            : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                                        }
                                    `}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-3 pt-2">
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
                            loading={saving}
                        >
                            <Check size={18} />
                            Salvar
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
