'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Activity,
    Plus,
    TrendingUp,
    TrendingDown,
    Minus,
    Search,
    Calendar,
    Clock,
    Edit2,
    Trash2,
    AlertTriangle,
    CheckCircle,
    BarChart3,
} from 'lucide-react';
import {
    getBehaviors,
    addBehavior,
    updateBehavior,
    getBehaviorRecords,
    addBehaviorRecord,
    getBehaviorStats,
} from '@/lib/dataService';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const behaviorTypes = [
    { id: 'decrease', label: 'Reduzir', color: 'error', icon: TrendingDown },
    { id: 'increase', label: 'Aumentar', color: 'success', icon: TrendingUp },
    { id: 'monitor', label: 'Monitorar', color: 'primary', icon: Activity },
];

const severityLevels = [
    { id: 'low', label: 'Baixa', color: 'success' },
    { id: 'medium', label: 'Média', color: 'warning' },
    { id: 'high', label: 'Alta', color: 'error' },
    { id: 'positive', label: 'Positivo', color: 'success' },
];

export default function BehaviorsTracker() {
    const [mounted, setMounted] = useState(false);
    const [behaviors, setBehaviors] = useState([]);
    const [records, setRecords] = useState([]);
    const [filterType, setFilterType] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showRecordModal, setShowRecordModal] = useState(false);
    const [editingBehavior, setEditingBehavior] = useState(null);
    const [selectedBehavior, setSelectedBehavior] = useState(null);
    const [newRecord, setNewRecord] = useState({ count: 1, context: '', notes: '' });
    const [newBehavior, setNewBehavior] = useState({
        name: '',
        type: 'decrease',
        description: '',
        severity: 'medium',
        color: '#F59E0B',
    });

    useEffect(() => {
        setMounted(true);
        loadData();
    }, []);

    const loadData = () => {
        setBehaviors(getBehaviors());
        setRecords(getBehaviorRecords());
    };

    const filteredBehaviors = behaviors.filter(behavior => {
        const matchesType = filterType === 'all' || behavior.type === filterType;
        const matchesSearch = behavior.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesType && matchesSearch;
    });

    const handleAddBehavior = () => {
        if (!newBehavior.name.trim()) return;

        addBehavior(newBehavior);
        setNewBehavior({
            name: '',
            type: 'decrease',
            description: '',
            severity: 'medium',
            color: '#F59E0B',
        });
        setShowAddModal(false);
        loadData();
    };

    const handleQuickRecord = (behavior) => {
        setSelectedBehavior(behavior);
        setShowRecordModal(true);
    };

    const handleSaveRecord = () => {
        if (!selectedBehavior) return;

        addBehaviorRecord({
            behaviorId: selectedBehavior.id,
            count: newRecord.count,
            context: newRecord.context,
            notes: newRecord.notes,
        });

        setNewRecord({ count: 1, context: '', notes: '' });
        setShowRecordModal(false);
        setSelectedBehavior(null);
        loadData();
    };

    const getTrendIcon = (trend) => {
        switch (trend) {
            case 'increasing':
                return <TrendingUp className="w-5 h-5 text-error-500" />;
            case 'decreasing':
                return <TrendingDown className="w-5 h-5 text-success-500" />;
            default:
                return <Minus className="w-5 h-5 text-neutral-400" />;
        }
    };

    const getBehaviorRecordsToday = (behaviorId) => {
        const today = new Date().toDateString();
        return records.filter(r =>
            r.behaviorId === behaviorId &&
            new Date(r.timestamp).toDateString() === today
        ).reduce((sum, r) => sum + (r.count || 1), 0);
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
                        <Activity className="w-8 h-8 text-warning-500" />
                        Comportamentos
                    </h1>
                    <p className="page-subtitle">
                        Registre e acompanhe comportamentos-alvo ao longo do tempo.
                    </p>
                </div>

                <button
                    onClick={() => setShowAddModal(true)}
                    className="btn-primary"
                >
                    <Plus size={20} />
                    Novo Comportamento
                </button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="stat-card"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-error-100 flex items-center justify-center">
                            <TrendingDown className="w-6 h-6 text-error-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{behaviors.filter(b => b.type === 'decrease').length}</p>
                            <p className="text-sm text-neutral-500">Para Reduzir</p>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="stat-card"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-success-100 flex items-center justify-center">
                            <TrendingUp className="w-6 h-6 text-success-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{behaviors.filter(b => b.type === 'increase').length}</p>
                            <p className="text-sm text-neutral-500">Para Aumentar</p>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="stat-card"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center">
                            <Calendar className="w-6 h-6 text-primary-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">
                                {records.filter(r => new Date(r.timestamp).toDateString() === new Date().toDateString()).length}
                            </p>
                            <p className="text-sm text-neutral-500">Registros Hoje</p>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-4 mb-6">
                <div className="relative flex-1 min-w-[200px] max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                    <input
                        type="text"
                        placeholder="Buscar comportamentos..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="input-field pl-10"
                    />
                </div>

                <div className="flex gap-2 flex-wrap">
                    <button
                        onClick={() => setFilterType('all')}
                        style={{
                            padding: '0.5rem 1rem',
                            borderRadius: '0.75rem',
                            fontWeight: 500,
                            transition: 'all 0.2s',
                            backgroundColor: filterType === 'all' ? '#2563eb' : 'rgba(30, 136, 229, 0.1)',
                            color: filterType === 'all' ? 'white' : '#e5e7eb',
                            border: filterType === 'all' ? 'none' : '1px solid rgba(30, 136, 229, 0.2)',
                        }}
                    >
                        Todos
                    </button>
                    {behaviorTypes.map(type => (
                        <button
                            key={type.id}
                            onClick={() => setFilterType(type.id)}
                            style={{
                                padding: '0.5rem 1rem',
                                borderRadius: '0.75rem',
                                fontWeight: 500,
                                transition: 'all 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                backgroundColor: filterType === type.id ? '#2563eb' : 'rgba(30, 136, 229, 0.1)',
                                color: filterType === type.id ? 'white' : '#e5e7eb',
                                border: filterType === type.id ? 'none' : '1px solid rgba(30, 136, 229, 0.2)',
                            }}
                        >
                            <type.icon size={16} />
                            {type.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Behaviors Grid */}
            <div className="space-y-5 lg:grid lg:grid-cols-2 xl:grid-cols-3 lg:gap-6 lg:space-y-0">
                {filteredBehaviors.map((behavior, index) => {
                    const stats = getBehaviorStats(behavior.id, 30);
                    const todayCount = getBehaviorRecordsToday(behavior.id);
                    const typeInfo = behaviorTypes.find(t => t.id === behavior.type);

                    return (
                        <motion.div
                            key={behavior.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="chart-container p-5 lg:p-6"
                        >
                            <div className="flex items-start justify-between mb-5">
                                <div className="flex items-center gap-4">
                                    <div
                                        className="w-12 h-12 rounded-2xl flex items-center justify-center"
                                        style={{ backgroundColor: `${behavior.color}20` }}
                                    >
                                        <div
                                            className="w-5 h-5 rounded-full"
                                            style={{ backgroundColor: behavior.color }}
                                        />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-base">{behavior.name}</h3>
                                        <div className="flex items-center gap-2 mt-1.5">
                                            <span className={`badge badge-${typeInfo?.color || 'primary'} text-xs`}>
                                                {typeInfo?.label}
                                            </span>
                                            <span className={`badge badge-${severityLevels.find(s => s.id === behavior.severity)?.color || 'warning'} text-xs`}>
                                                {severityLevels.find(s => s.id === behavior.severity)?.label}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setEditingBehavior({ ...behavior })}
                                    className="btn-icon w-10 h-10"
                                >
                                    <Edit2 size={16} />
                                </button>
                            </div>

                            {behavior.description && (
                                <p className="text-sm text-neutral-500 mb-5 leading-relaxed">{behavior.description}</p>
                            )}

                            {/* Stats */}
                            <div className="grid grid-cols-3 gap-3 mb-5 p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/50">
                                <div className="text-center">
                                    <p className="text-2xl font-bold">{todayCount}</p>
                                    <p className="text-xs text-neutral-500 mt-1">Hoje</p>
                                </div>
                                <div className="text-center border-x border-neutral-200 dark:border-neutral-700">
                                    <p className="text-2xl font-bold">{stats.avgPerDay}</p>
                                    <p className="text-xs text-neutral-500 mt-1">Média/dia</p>
                                </div>
                                <div className="text-center flex flex-col items-center justify-center">
                                    {getTrendIcon(stats.trend)}
                                    <p className="text-xs text-neutral-500 mt-1">Tendência</p>
                                </div>
                            </div>

                            {/* Quick Record Button */}
                            <button
                                onClick={() => handleQuickRecord(behavior)}
                                className={`w-full btn-${behavior.type === 'increase' ? 'success' : 'secondary'} py-3.5`}
                            >
                                <Plus size={18} />
                                Registrar Ocorrência
                            </button>
                        </motion.div>
                    );
                })}

                {filteredBehaviors.length === 0 && (
                    <div className="col-span-full text-center py-12">
                        <Activity className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Nenhum comportamento encontrado</h3>
                        <p className="text-neutral-500 mb-4">
                            Adicione comportamentos para começar a monitorar.
                        </p>
                        <button onClick={() => setShowAddModal(true)} className="btn-primary">
                            <Plus size={18} />
                            Adicionar Comportamento
                        </button>
                    </div>
                )}
            </div>

            {/* Recent Records */}
            {records.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="chart-container mt-6"
                >
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-primary-500" />
                        Registros Recentes
                    </h3>
                    <div className="space-y-2">
                        {records.slice(-10).reverse().map((record, index) => {
                            const behavior = behaviors.find(b => b.id === record.behaviorId);
                            if (!behavior) return null;

                            return (
                                <div
                                    key={index}
                                    className="flex items-center justify-between p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/50"
                                >
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-3 h-3 rounded-full"
                                            style={{ backgroundColor: behavior.color }}
                                        />
                                        <div>
                                            <p className="font-medium text-sm">{behavior.name}</p>
                                            <p className="text-xs text-neutral-500">
                                                {format(new Date(record.timestamp), "dd/MM 'às' HH:mm", { locale: ptBR })}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold">x{record.count || 1}</span>
                                        {record.context && (
                                            <span className="text-xs text-neutral-500 bg-neutral-100 px-2 py-1 rounded">
                                                {record.context}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </motion.div>
            )}

            {/* Add Behavior Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="modal-content"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h2 className="text-xl font-bold mb-6">Novo Comportamento</h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="input-label">Nome do Comportamento</label>
                                    <input
                                        type="text"
                                        value={newBehavior.name}
                                        onChange={(e) => setNewBehavior({ ...newBehavior, name: e.target.value })}
                                        placeholder="Ex: Estereotipia vocal"
                                        className="input-field"
                                        autoFocus
                                    />
                                </div>

                                <div>
                                    <label className="input-label">Tipo</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {behaviorTypes.map(type => (
                                            <button
                                                key={type.id}
                                                onClick={() => setNewBehavior({ ...newBehavior, type: type.id })}
                                                className={`p-3 rounded-lg border-2 flex flex-col items-center gap-1 transition-all ${newBehavior.type === type.id
                                                    ? `border-${type.color}-500 bg-${type.color}-50`
                                                    : 'border-neutral-200 hover:border-neutral-300'
                                                    }`}
                                            >
                                                <type.icon className={`w-5 h-5 text-${type.color}-500`} />
                                                <span className="text-sm font-medium">{type.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="input-label">Severidade</label>
                                    <select
                                        value={newBehavior.severity}
                                        onChange={(e) => setNewBehavior({ ...newBehavior, severity: e.target.value })}
                                        className="input-field"
                                    >
                                        {severityLevels.map(level => (
                                            <option key={level.id} value={level.id}>{level.label}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="input-label">Descrição (opcional)</label>
                                    <textarea
                                        value={newBehavior.description}
                                        onChange={(e) => setNewBehavior({ ...newBehavior, description: e.target.value })}
                                        placeholder="Descreva o comportamento..."
                                        className="input-field resize-none"
                                        rows={2}
                                    />
                                </div>

                                <div>
                                    <label className="input-label">Cor</label>
                                    <div className="flex gap-2">
                                        {['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899'].map(color => (
                                            <button
                                                key={color}
                                                onClick={() => setNewBehavior({ ...newBehavior, color })}
                                                className={`w-10 h-10 rounded-lg border-2 ${newBehavior.color === color ? 'border-neutral-800' : 'border-transparent'
                                                    }`}
                                                style={{ backgroundColor: color }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button onClick={() => setShowAddModal(false)} className="btn-secondary flex-1">
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleAddBehavior}
                                    className="btn-primary flex-1"
                                    disabled={!newBehavior.name.trim()}
                                >
                                    Criar Comportamento
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Record Modal */}
            <AnimatePresence>
                {showRecordModal && selectedBehavior && (
                    <div className="modal-overlay" onClick={() => setShowRecordModal(false)}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="modal-content"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h2 className="text-xl font-bold mb-2">Registrar Ocorrência</h2>
                            <p className="text-neutral-500 mb-6">{selectedBehavior.name}</p>

                            <div className="space-y-4">
                                <div>
                                    <label className="input-label">Quantidade</label>
                                    <div className="flex items-center gap-4">
                                        <button
                                            onClick={() => setNewRecord({ ...newRecord, count: Math.max(1, newRecord.count - 1) })}
                                            className="btn-icon"
                                        >
                                            -
                                        </button>
                                        <span className="text-3xl font-bold w-16 text-center">{newRecord.count}</span>
                                        <button
                                            onClick={() => setNewRecord({ ...newRecord, count: newRecord.count + 1 })}
                                            className="btn-icon"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="input-label">Contexto</label>
                                    <select
                                        value={newRecord.context}
                                        onChange={(e) => setNewRecord({ ...newRecord, context: e.target.value })}
                                        className="input-field"
                                    >
                                        <option value="">Selecione...</option>
                                        <option value="during_session">Durante sessão</option>
                                        <option value="transition">Transição de atividade</option>
                                        <option value="meal">Refeição</option>
                                        <option value="free_time">Tempo livre</option>
                                        <option value="social">Interação social</option>
                                        <option value="demand">Demanda/Instrução</option>
                                        <option value="other">Outro</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="input-label">Notas (opcional)</label>
                                    <textarea
                                        value={newRecord.notes}
                                        onChange={(e) => setNewRecord({ ...newRecord, notes: e.target.value })}
                                        placeholder="Observações adicionais..."
                                        className="input-field resize-none"
                                        rows={2}
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button onClick={() => setShowRecordModal(false)} className="btn-secondary flex-1">
                                    Cancelar
                                </button>
                                <button onClick={handleSaveRecord} className="btn-primary flex-1">
                                    Registrar
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
