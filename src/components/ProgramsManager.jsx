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
    EmptyState,
    Modal
} from '@/components/ui';
import {
    getPrograms,
    addProgram,
    updateProgram,
    deleteProgram,
} from '@/lib/dataService';

const CATEGORIES = [
    { id: 'ALL', label: 'Todos', color: 'neutral' },
    { id: 'MAND', label: 'Mand', color: 'primary' },
    { id: 'TACT', label: 'Tact', color: 'success' },
    { id: 'RECEPTIVO', label: 'Receptivo', color: 'warning' },
    { id: 'MOTOR', label: 'Motor', color: 'purple' },
    { id: 'SOCIAL', label: 'Social', color: 'error' },
    { id: 'INTRAVERBAL', label: 'Intraverbal', color: 'primary' },
];

export default function ProgramsManager() {
    const [loading, setLoading] = useState(true);
    const [programs, setPrograms] = useState([]);
    const [search, setSearch] = useState('');
    const [activeCategory, setActiveCategory] = useState('ALL');
    const [showForm, setShowForm] = useState(false);
    const [editingProgram, setEditingProgram] = useState(null);
    const [saving, setSaving] = useState(false);
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
        if (!formData.name.trim()) return;

        setSaving(true);
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
        } finally {
            setSaving(false);
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
            category: program.category || 'MAND',
            targetAccuracy: program.targetAccuracy || 80,
            active: program.active !== false
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

    // Filtros
    const filteredPrograms = programs.filter(p => {
        const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
            (p.description && p.description.toLowerCase().includes(search.toLowerCase()));
        const matchCategory = activeCategory === 'ALL' || p.category === activeCategory;
        return matchSearch && matchCategory;
    });

    // Contagem
    const getCategoryCount = (cat) => {
        if (cat === 'ALL') return programs.length;
        return programs.filter(p => p.category === cat).length;
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
                title="Programas de Ensino"
                subtitle={`${programs.length} programa${programs.length !== 1 ? 's' : ''} cadastrado${programs.length !== 1 ? 's' : ''}`}
                action={
                    <Button onClick={() => setShowForm(true)}>
                        <Plus size={18} />
                        <span className="hidden sm:inline">Novo Programa</span>
                        <span className="sm:hidden">Novo</span>
                    </Button>
                }
            />

            {/* === BUSCA E FILTROS === */}
            <div className="space-y-4 mb-6">
                <Input
                    icon={Search}
                    placeholder="Buscar programa..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />

                {/* Categorias - Scroll horizontal */}
                <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-none">
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id)}
                            className={`
                                flex-shrink-0 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all
                                ${activeCategory === cat.id
                                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600'
                                }
                            `}
                        >
                            {cat.label}
                            <span className={`ml-1.5 ${activeCategory === cat.id ? 'text-white/80' : 'text-slate-400 dark:text-slate-500'}`}>
                                ({getCategoryCount(cat.id)})
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* === LISTA DE PROGRAMAS === */}
            {filteredPrograms.length === 0 ? (
                <EmptyState
                    icon={BookOpen}
                    title="Nenhum programa encontrado"
                    description={search ? "Tente buscar com outros termos" : "Adicione seu primeiro programa de ensino ABA"}
                    action={
                        !search && (
                            <Button onClick={() => setShowForm(true)} size="sm">
                                <Plus size={16} />
                                Adicionar Programa
                            </Button>
                        )
                    }
                />
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredPrograms.map((program, idx) => (
                        <motion.div
                            key={program.id}
                            layout
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                        >
                            <Card className="h-full flex flex-col">
                                {/* Header */}
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
                                        {program.category || 'Geral'}
                                    </Badge>
                                    {program.active === false && (
                                        <Badge variant="neutral" size="sm">Inativo</Badge>
                                    )}
                                </div>

                                {/* Content */}
                                <h3 className="font-semibold text-slate-800 dark:text-white mb-1.5 line-clamp-1 text-lg">
                                    {program.name}
                                </h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 line-clamp-2 flex-1 min-h-[40px]">
                                    {program.description || 'Sem descrição'}
                                </p>

                                {/* Progress */}
                                <div className="mb-4">
                                    <div className="flex justify-between text-xs mb-1.5">
                                        <span className="text-slate-500 dark:text-slate-400">Progresso</span>
                                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                                            {program.currentAccuracy || 0}% / {program.targetAccuracy || 80}%
                                        </span>
                                    </div>
                                    <ProgressBar
                                        value={program.currentAccuracy || 0}
                                        max={program.targetAccuracy || 80}
                                        color={(program.currentAccuracy || 0) >= (program.targetAccuracy || 80) ? "success" : "primary"}
                                        size="sm"
                                    />
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2 pt-3 border-t border-slate-100 dark:border-slate-700">
                                    <button
                                        onClick={() => handleEditProgram(program)}
                                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 active:bg-blue-100 dark:active:bg-blue-900/30 transition-colors"
                                    >
                                        <Edit2 size={16} />
                                        Editar
                                    </button>
                                    <button
                                        onClick={() => handleDeleteProgram(program.id)}
                                        className="flex items-center justify-center p-2.5 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 active:bg-red-100 dark:active:bg-red-900/30 transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* === MODAL DE FORMULÁRIO === */}
            <Modal
                isOpen={showForm}
                onClose={handleCloseForm}
                title={editingProgram ? 'Editar Programa' : 'Novo Programa'}
            >
                <div className="space-y-5">
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
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2.5">
                            Categoria
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {CATEGORIES.filter(c => c.id !== 'ALL').map(cat => (
                                <button
                                    key={cat.id}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, category: cat.id })}
                                    className={`
                                        px-4 py-2.5 rounded-xl text-sm font-medium transition-all
                                        ${formData.category === cat.id
                                            ? 'bg-blue-600 text-white shadow-md'
                                            : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                                        }
                                    `}
                                >
                                    {cat.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Meta de Acerto: <span className="text-blue-600 dark:text-blue-400 font-bold">{formData.targetAccuracy}%</span>
                        </label>
                        <input
                            type="range"
                            min="50"
                            max="100"
                            step="5"
                            value={formData.targetAccuracy}
                            onChange={(e) => setFormData({ ...formData, targetAccuracy: parseInt(e.target.value) })}
                            className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        />
                        <div className="flex justify-between text-xs text-slate-400 mt-1">
                            <span>50%</span>
                            <span>100%</span>
                        </div>
                    </div>

                    <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                        <div
                            onClick={() => setFormData({ ...formData, active: !formData.active })}
                            className={`w-12 h-7 rounded-full transition-colors relative cursor-pointer ${formData.active ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-600'}`}
                        >
                            <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${formData.active ? 'translate-x-6' : 'translate-x-1'}`} />
                        </div>
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            Programa Ativo
                        </span>
                    </label>

                    <div className="flex gap-3 pt-2">
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
