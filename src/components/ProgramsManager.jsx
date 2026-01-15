'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus,
    Search,
    Edit2,
    Trash2,
    Target,
    BookOpen,
    Check,
    X,
    ChevronRight,
    Filter
} from 'lucide-react';
import {
    Card,
    Badge,
    Button,
    Input,
    Textarea,
    ProgressBar,
    PageHeader,
    TabNav,
    EmptyState
} from '@/components/ui';
import {
    getPrograms,
    addProgram,
    updateProgram,
    deleteProgram,
} from '@/lib/dataService';

const CATEGORIES = [
    { id: 'ALL', label: 'Todos' },
    { id: 'MAND', label: 'Mand', color: 'primary' },
    { id: 'TACT', label: 'Tact', color: 'success' },
    { id: 'RECEPTIVO', label: 'Receptivo', color: 'warning' },
    { id: 'MOTOR', label: 'Motor', color: 'purple' },
    { id: 'SOCIAL', label: 'Social', color: 'error' },
    { id: 'INTRAVERBAL', label: 'Intraverbal', color: 'neutral' },
];

export default function ProgramsManager() {
    const [loading, setLoading] = useState(true);
    const [programs, setPrograms] = useState([]);
    const [search, setSearch] = useState('');
    const [activeCategory, setActiveCategory] = useState('ALL');
    const [showForm, setShowForm] = useState(false);
    const [editingProgram, setEditingProgram] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        category: 'MAND',
        targetAccuracy: 80,
        active: true
    });

    useEffect(() => {
        loadPrograms();
    }, []);

    const loadPrograms = async () => {
        try {
            const data = await getPrograms();
            setPrograms(data || []);
        } catch (error) {
            console.error('Erro ao carregar programas:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveProgram = async () => {
        try {
            if (editingProgram) {
                await updateProgram(editingProgram.id, formData);
            } else {
                await addProgram(formData);
            }
            await loadPrograms();
            handleCloseForm();
        } catch (error) {
            console.error('Erro ao salvar programa:', error);
        }
    };

    const handleDeleteProgram = async (id) => {
        if (confirm('Tem certeza que deseja excluir este programa?')) {
            try {
                await deleteProgram(id);
                await loadPrograms();
            } catch (error) {
                console.error('Erro ao excluir programa:', error);
            }
        }
    };

    const handleEditProgram = (program) => {
        setEditingProgram(program);
        setFormData({
            name: program.name,
            description: program.description || '',
            category: program.category,
            targetAccuracy: program.targetAccuracy || 80,
            active: program.active ?? true
        });
        setShowForm(true);
    };

    const handleCloseForm = () => {
        setShowForm(false);
        setEditingProgram(null);
        setFormData({
            name: '',
            description: '',
            category: 'MAND',
            targetAccuracy: 80,
            active: true
        });
    };

    // Filtro
    const filteredPrograms = programs.filter(p => {
        const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
        const matchCategory = activeCategory === 'ALL' || p.category === activeCategory;
        return matchSearch && matchCategory;
    });

    // Contagem por categoria
    const getCategoryCount = (cat) => {
        if (cat === 'ALL') return programs.length;
        return programs.filter(p => p.category === cat).length;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="w-10 h-10 border-4 border-[var(--primary-500)]/30 border-t-[var(--primary-500)] rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto px-4 py-6">

            <PageHeader
                title="Programas de Ensino"
                subtitle="Gerencie os programas ABA"
                action={
                    <Button onClick={() => setShowForm(true)}>
                        <Plus size={18} />
                        <span className="hidden sm:inline">Novo Programa</span>
                    </Button>
                }
            />

            {/* Busca e Filtros */}
            <div className="space-y-3 mb-6">
                <Input
                    icon={Search}
                    placeholder="Buscar programa..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />

                {/* Categorias - Scroll horizontal em mobile */}
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id)}
                            className={`
                                flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all
                                ${activeCategory === cat.id
                                    ? 'bg-[var(--primary-500)] text-white'
                                    : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--interactive-hover)]'
                                }
                            `}
                        >
                            {cat.label}
                            <span className="ml-1.5 opacity-70">({getCategoryCount(cat.id)})</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Lista de Programas */}
            {filteredPrograms.length === 0 ? (
                <EmptyState
                    icon={BookOpen}
                    title="Nenhum programa encontrado"
                    description={search ? "Tente buscar com outros termos" : "Adicione seu primeiro programa de ensino"}
                    action={
                        !search && <Button onClick={() => setShowForm(true)} size="sm">Adicionar Programa</Button>
                    }
                />
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredPrograms.map((program) => (
                        <motion.div
                            key={program.id}
                            layout
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                        >
                            <Card className="h-full flex flex-col">
                                <div className="flex items-start justify-between mb-3">
                                    <Badge
                                        variant={
                                            program.category === 'MAND' ? 'primary' :
                                                program.category === 'TACT' ? 'success' :
                                                    program.category === 'RECEPTIVO' ? 'warning' :
                                                        program.category === 'MOTOR' ? 'purple' :
                                                            program.category === 'SOCIAL' ? 'error' : 'neutral'
                                        }
                                    >
                                        {program.category}
                                    </Badge>
                                    {!program.active && (
                                        <Badge variant="neutral" size="sm">Inativo</Badge>
                                    )}
                                </div>

                                <h3 className="font-semibold text-[var(--text-primary)] mb-1 line-clamp-1">
                                    {program.name}
                                </h3>
                                <p className="text-sm text-[var(--text-tertiary)] mb-4 line-clamp-2 flex-1">
                                    {program.description || 'Sem descrição'}
                                </p>

                                <div className="mb-4">
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="text-[var(--text-muted)]">Progresso</span>
                                        <span className="font-medium text-[var(--text-secondary)]">
                                            {program.currentAccuracy || 0}% / {program.targetAccuracy || 80}%
                                        </span>
                                    </div>
                                    <ProgressBar
                                        value={program.currentAccuracy || 0}
                                        max={program.targetAccuracy || 80}
                                        color={program.currentAccuracy >= (program.targetAccuracy || 80) ? "success" : "primary"}
                                        size="sm"
                                    />
                                </div>

                                <div className="flex gap-2 pt-3 border-t border-[var(--border-default)]">
                                    <button
                                        onClick={() => handleEditProgram(program)}
                                        className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium text-[var(--primary-500)] hover:bg-[var(--primary-500)]/10 transition-colors"
                                    >
                                        <Edit2 size={16} />
                                        Editar
                                    </button>
                                    <button
                                        onClick={() => handleDeleteProgram(program.id)}
                                        className="flex items-center justify-center p-2 rounded-lg text-[var(--error-500)] hover:bg-[var(--error-500)]/10 transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
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
                            className="w-full max-w-lg bg-[var(--bg-card)] rounded-t-3xl sm:rounded-3xl p-6 max-h-[90vh] overflow-y-auto"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-[var(--text-primary)]">
                                    {editingProgram ? 'Editar Programa' : 'Novo Programa'}
                                </h2>
                                <button
                                    onClick={handleCloseForm}
                                    className="p-2 rounded-lg hover:bg-[var(--bg-tertiary)]"
                                >
                                    <X size={20} className="text-[var(--text-muted)]" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <Input
                                    label="Nome do Programa"
                                    placeholder="Ex: Pedir objetos"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />

                                <Textarea
                                    label="Descrição"
                                    placeholder="Descreva o objetivo do programa..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />

                                <div>
                                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                                        Categoria
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {CATEGORIES.filter(c => c.id !== 'ALL').map(cat => (
                                            <button
                                                key={cat.id}
                                                onClick={() => setFormData({ ...formData, category: cat.id })}
                                                className={`
                                                    px-4 py-2 rounded-xl text-sm font-medium transition-all
                                                    ${formData.category === cat.id
                                                        ? 'bg-[var(--primary-500)] text-white'
                                                        : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)]'
                                                    }
                                                `}
                                            >
                                                {cat.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                                        Meta de Acerto: {formData.targetAccuracy}%
                                    </label>
                                    <input
                                        type="range"
                                        min="50"
                                        max="100"
                                        step="5"
                                        value={formData.targetAccuracy}
                                        onChange={(e) => setFormData({ ...formData, targetAccuracy: parseInt(e.target.value) })}
                                        className="w-full h-2 bg-[var(--bg-tertiary)] rounded-lg appearance-none cursor-pointer accent-[var(--primary-500)]"
                                    />
                                </div>

                                <label className="flex items-center gap-3 cursor-pointer">
                                    <div
                                        className={`w-12 h-7 rounded-full transition-colors ${formData.active ? 'bg-[var(--primary-500)]' : 'bg-[var(--bg-tertiary)]'}`}
                                        onClick={() => setFormData({ ...formData, active: !formData.active })}
                                    >
                                        <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform mt-1 ${formData.active ? 'translate-x-6' : 'translate-x-1'}`} />
                                    </div>
                                    <span className="text-sm font-medium text-[var(--text-secondary)]">
                                        Programa Ativo
                                    </span>
                                </label>

                                <div className="flex gap-3 pt-4">
                                    <Button
                                        variant="secondary"
                                        onClick={handleCloseForm}
                                        className="flex-1"
                                    >
                                        Cancelar
                                    </Button>
                                    <Button
                                        onClick={handleSaveProgram}
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
