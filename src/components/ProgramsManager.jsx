'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BookOpen,
    Plus,
    Search,
    Filter,
    ChevronRight,
    Target,
    TrendingUp,
    TrendingDown,
    Minus,
    Edit2,
    Trash2,
    Check,
    X,
    MoreVertical,
} from 'lucide-react';
import {
    getPrograms,
    addProgram,
    updateProgram,
    deleteProgram,
    getProgramProgress,
    getTrialStats,
} from '@/lib/dataService';

const categories = [
    { id: 'MAND', name: 'Mand', description: 'Requisições e pedidos', color: 'primary' },
    { id: 'TACT', name: 'Tact', description: 'Nomeação e identificação', color: 'success' },
    { id: 'RECEPTIVO', name: 'Receptivo', description: 'Compreensão de linguagem', color: 'warning' },
    { id: 'MOTOR', name: 'Motor', description: 'Habilidades motoras', color: 'purple' },
    { id: 'SOCIAL', name: 'Social', description: 'Interações sociais', color: 'error' },
    { id: 'INTRAVERBAL', name: 'Intraverbal', description: 'Conversação e diálogo', color: 'primary' },
];

export default function ProgramsManager() {
    const [mounted, setMounted] = useState(false);
    const [programs, setPrograms] = useState([]);
    const [filterCategory, setFilterCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingProgram, setEditingProgram] = useState(null);
    const [selectedProgram, setSelectedProgram] = useState(null);
    const [newProgram, setNewProgram] = useState({
        name: '',
        category: 'MAND',
        description: '',
        targetAccuracy: 80,
    });

    useEffect(() => {
        setMounted(true);
        loadPrograms();
    }, []);

    const loadPrograms = () => {
        setPrograms(getPrograms());
    };

    const filteredPrograms = programs.filter(program => {
        const matchesCategory = filterCategory === 'all' || program.category === filterCategory;
        const matchesSearch = program.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            program.description?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const handleAddProgram = () => {
        if (!newProgram.name.trim()) return;

        addProgram(newProgram);
        setNewProgram({
            name: '',
            category: 'MAND',
            description: '',
            targetAccuracy: 80,
        });
        setShowAddModal(false);
        loadPrograms();
    };

    const handleUpdateProgram = () => {
        if (!editingProgram || !editingProgram.name.trim()) return;

        updateProgram(editingProgram.id, editingProgram);
        setEditingProgram(null);
        loadPrograms();
    };

    const handleDeleteProgram = (id) => {
        if (confirm('Tem certeza que deseja excluir este programa?')) {
            deleteProgram(id);
            loadPrograms();
        }
    };

    const handleToggleStatus = (program) => {
        const newStatus = program.status === 'active' ? 'paused' : 'active';
        updateProgram(program.id, { status: newStatus });
        loadPrograms();
    };

    const getProgramStats = (programId) => {
        const stats = getTrialStats(programId, 30);
        const progress = getProgramProgress(programId);
        return { stats, progress };
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

    if (!mounted) {
        return <div className="animate-pulse p-8">Carregando...</div>;
    }

    return (
        <div className="animate-fade-in">
            {/* Page Header */}
            <div className="page-header flex flex-wrap items-start justify-between gap-4">
                <div>
                    <h1 className="page-title flex items-center gap-3">
                        <BookOpen className="w-8 h-8 text-primary-500" />
                        Programas de Ensino
                    </h1>
                    <p className="page-subtitle">
                        Gerencie os programas ABA e acompanhe o progresso de cada um.
                    </p>
                </div>

                <button
                    onClick={() => setShowAddModal(true)}
                    className="btn-primary"
                >
                    <Plus size={20} />
                    Novo Programa
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-4 mb-6">
                <div className="relative flex-1 min-w-[200px] max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                    <input
                        type="text"
                        placeholder="Buscar programas..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="input-field pl-10"
                    />
                </div>

                <div className="flex gap-2 flex-wrap">
                    <button
                        onClick={() => setFilterCategory('all')}
                        style={{
                            padding: '0.5rem 1rem',
                            borderRadius: '0.75rem',
                            fontWeight: 500,
                            transition: 'all 0.2s',
                            backgroundColor: filterCategory === 'all' ? '#2563eb' : 'rgba(30, 136, 229, 0.1)',
                            color: filterCategory === 'all' ? 'white' : '#e5e7eb',
                            border: filterCategory === 'all' ? 'none' : '1px solid rgba(30, 136, 229, 0.2)',
                        }}
                    >
                        Todos
                    </button>
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setFilterCategory(cat.id)}
                            style={{
                                padding: '0.5rem 1rem',
                                borderRadius: '0.75rem',
                                fontWeight: 500,
                                transition: 'all 0.2s',
                                backgroundColor: filterCategory === cat.id ? '#2563eb' : 'rgba(30, 136, 229, 0.1)',
                                color: filterCategory === cat.id ? 'white' : '#e5e7eb',
                                border: filterCategory === cat.id ? 'none' : '1px solid rgba(30, 136, 229, 0.2)',
                            }}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Categories Summary */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4 mb-8">
                {categories.map(cat => {
                    const catPrograms = programs.filter(p => p.category === cat.id);
                    const activePrograms = catPrograms.filter(p => p.status === 'active');

                    return (
                        <motion.div
                            key={cat.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            onClick={() => setFilterCategory(cat.id)}
                            style={{
                                padding: '1rem',
                                borderRadius: '0.75rem',
                                cursor: 'pointer',
                                background: 'rgba(30, 136, 229, 0.08)',
                                border: '1px solid rgba(30, 136, 229, 0.15)',
                                transition: 'all 0.2s',
                            }}
                        >
                            <p style={{ fontWeight: 700, fontSize: '1.5rem', color: '#60a5fa' }}>{catPrograms.length}</p>
                            <p style={{ fontWeight: 500, fontSize: '0.875rem', color: '#e5e7eb' }}>{cat.name}</p>
                            <p style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{activePrograms.length} ativos</p>
                        </motion.div>
                    );
                })}
            </div>

            {/* Programs Grid */}
            <div className="cards-grid">
                {filteredPrograms.map((program, index) => {
                    const { stats, progress } = getProgramStats(program.id);
                    const categoryInfo = categories.find(c => c.id === program.category);

                    return (
                        <motion.div
                            key={program.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className={`chart-container hover:shadow-lg transition-shadow ${program.status !== 'active' ? 'opacity-60' : ''
                                }`}
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <span className={`badge badge-${categoryInfo?.color || 'primary'} mb-2`}>
                                        {program.category}
                                    </span>
                                    <h3 className="font-bold text-lg">{program.name}</h3>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setEditingProgram({ ...program })}
                                        className="btn-icon"
                                        title="Editar"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleToggleStatus(program)}
                                        className={`btn-icon ${program.status === 'active' ? 'text-success-500' : 'text-neutral-400'}`}
                                        title={program.status === 'active' ? 'Pausar' : 'Ativar'}
                                    >
                                        {program.status === 'active' ? <Check size={16} /> : <X size={16} />}
                                    </button>
                                </div>
                            </div>

                            <p className="text-sm text-neutral-500 mb-4">{program.description}</p>

                            {/* Progress */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-neutral-500">Meta: {program.targetAccuracy}%</span>
                                    <div className="flex items-center gap-2">
                                        {progress && getTrendIcon(progress.trend)}
                                        <span className={`font-bold ${stats?.accuracy >= program.targetAccuracy ? 'text-success-600' : 'text-neutral-600'
                                            }`}>
                                            {stats?.accuracy || 0}%
                                        </span>
                                    </div>
                                </div>

                                <div className="progress-bar">
                                    <div
                                        className={`progress-bar-fill ${stats?.accuracy >= program.targetAccuracy ? 'success' :
                                            stats?.accuracy >= program.targetAccuracy * 0.7 ? 'warning' : 'error'
                                            }`}
                                        style={{ width: `${Math.min(stats?.accuracy || 0, 100)}%` }}
                                    />
                                </div>

                                <div className="flex items-center justify-between text-xs text-neutral-500">
                                    <span>{stats?.total || 0} tentativas (30d)</span>
                                    <span>{stats?.independentRate || 0}% independente</span>
                                </div>
                            </div>

                            <button
                                onClick={() => setSelectedProgram(program)}
                                className="btn-secondary w-full mt-4"
                            >
                                Ver Detalhes
                                <ChevronRight size={16} />
                            </button>
                        </motion.div>
                    );
                })}

                {filteredPrograms.length === 0 && (
                    <div className="col-span-full text-center py-12">
                        <BookOpen className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Nenhum programa encontrado</h3>
                        <p className="text-neutral-500 mb-4">
                            {searchQuery ? 'Tente uma busca diferente.' : 'Adicione seu primeiro programa.'}
                        </p>
                        <button onClick={() => setShowAddModal(true)} className="btn-primary">
                            <Plus size={18} />
                            Adicionar Programa
                        </button>
                    </div>
                )}
            </div>

            {/* Add Program Modal */}
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
                            <h2 className="text-xl font-bold mb-6">Novo Programa</h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="input-label">Nome do Programa</label>
                                    <input
                                        type="text"
                                        value={newProgram.name}
                                        onChange={(e) => setNewProgram({ ...newProgram, name: e.target.value })}
                                        placeholder="Ex: Mand - Pedir brinquedos"
                                        className="input-field"
                                        autoFocus
                                    />
                                </div>

                                <div>
                                    <label className="input-label">Categoria</label>
                                    <select
                                        value={newProgram.category}
                                        onChange={(e) => setNewProgram({ ...newProgram, category: e.target.value })}
                                        className="input-field"
                                    >
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.name} - {cat.description}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="input-label">Descrição</label>
                                    <textarea
                                        value={newProgram.description}
                                        onChange={(e) => setNewProgram({ ...newProgram, description: e.target.value })}
                                        placeholder="Descreva o objetivo deste programa..."
                                        className="input-field resize-none"
                                        rows={3}
                                    />
                                </div>

                                <div>
                                    <label className="input-label">Meta de Acerto (%)</label>
                                    <div className="flex items-center gap-4">
                                        <input
                                            type="range"
                                            min="50"
                                            max="100"
                                            step="5"
                                            value={newProgram.targetAccuracy}
                                            onChange={(e) => setNewProgram({ ...newProgram, targetAccuracy: parseInt(e.target.value) })}
                                            className="flex-1"
                                        />
                                        <span className="font-bold text-xl w-16 text-center">{newProgram.targetAccuracy}%</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button onClick={() => setShowAddModal(false)} className="btn-secondary flex-1">
                                    Cancelar
                                </button>
                                <button onClick={handleAddProgram} className="btn-primary flex-1" disabled={!newProgram.name.trim()}>
                                    Criar Programa
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Edit Program Modal */}
            <AnimatePresence>
                {editingProgram && (
                    <div className="modal-overlay" onClick={() => setEditingProgram(null)}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="modal-content"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h2 className="text-xl font-bold mb-6">Editar Programa</h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="input-label">Nome do Programa</label>
                                    <input
                                        type="text"
                                        value={editingProgram.name}
                                        onChange={(e) => setEditingProgram({ ...editingProgram, name: e.target.value })}
                                        className="input-field"
                                    />
                                </div>

                                <div>
                                    <label className="input-label">Categoria</label>
                                    <select
                                        value={editingProgram.category}
                                        onChange={(e) => setEditingProgram({ ...editingProgram, category: e.target.value })}
                                        className="input-field"
                                    >
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="input-label">Descrição</label>
                                    <textarea
                                        value={editingProgram.description || ''}
                                        onChange={(e) => setEditingProgram({ ...editingProgram, description: e.target.value })}
                                        className="input-field resize-none"
                                        rows={3}
                                    />
                                </div>

                                <div>
                                    <label className="input-label">Meta de Acerto (%)</label>
                                    <div className="flex items-center gap-4">
                                        <input
                                            type="range"
                                            min="50"
                                            max="100"
                                            step="5"
                                            value={editingProgram.targetAccuracy}
                                            onChange={(e) => setEditingProgram({ ...editingProgram, targetAccuracy: parseInt(e.target.value) })}
                                            className="flex-1"
                                        />
                                        <span className="font-bold text-xl w-16 text-center">{editingProgram.targetAccuracy}%</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={() => handleDeleteProgram(editingProgram.id)}
                                    className="btn-secondary text-error-600 hover:bg-error-50"
                                >
                                    <Trash2 size={18} />
                                </button>
                                <button onClick={() => setEditingProgram(null)} className="btn-secondary flex-1">
                                    Cancelar
                                </button>
                                <button onClick={handleUpdateProgram} className="btn-primary flex-1">
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
