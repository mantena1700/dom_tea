'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Baby,
    ArrowRight,
    ArrowLeft,
    Check,
    Brain,
    MessageSquare,
    Eye,
    Hand,
    Users,
    Sparkles,
    Target,
    BookOpen,
    CheckCircle2,
    Circle,
    AlertCircle,
} from 'lucide-react';
import { getPatient, updatePatient, getPrograms, updateProgram } from '@/lib/dataService';

// Developmental milestones by age range and category
const DEVELOPMENTAL_MILESTONES = {
    '0-12': {
        name: '0-12 meses',
        ageDescription: 'Primeiro ano de vida',
        categories: {
            communication: {
                name: 'Comunicação',
                icon: MessageSquare,
                color: 'from-blue-500 to-cyan-500',
                milestones: [
                    { id: 'c1', text: 'Balbucia (ba-ba, ma-ma)', achieved: null },
                    { id: 'c2', text: 'Responde ao próprio nome', achieved: null },
                    { id: 'c3', text: 'Entende "não"', achieved: null },
                    { id: 'c4', text: 'Imita sons', achieved: null },
                    { id: 'c5', text: 'Usa gestos (acena, aponta)', achieved: null },
                ],
                programs: ['MAND', 'ECOICO'],
            },
            social: {
                name: 'Social',
                icon: Users,
                color: 'from-pink-500 to-rose-500',
                milestones: [
                    { id: 's1', text: 'Sorri para pessoas', achieved: null },
                    { id: 's2', text: 'Faz contato visual', achieved: null },
                    { id: 's3', text: 'Mostra interesse por outros bebês', achieved: null },
                    { id: 's4', text: 'Brinca de esconde-esconde', achieved: null },
                ],
                programs: ['SOCIAL', 'ATENCAO_COMPARTILHADA'],
            },
            motor: {
                name: 'Motor',
                icon: Hand,
                color: 'from-green-500 to-emerald-500',
                milestones: [
                    { id: 'm1', text: 'Segura objetos', achieved: null },
                    { id: 'm2', text: 'Transfere objetos entre mãos', achieved: null },
                    { id: 'm3', text: 'Engatinha', achieved: null },
                    { id: 'm4', text: 'Fica em pé com apoio', achieved: null },
                ],
                programs: ['MOTOR_FINO', 'MOTOR_GROSSO'],
            },
            cognitive: {
                name: 'Cognitivo',
                icon: Brain,
                color: 'from-purple-500 to-indigo-500',
                milestones: [
                    { id: 'cg1', text: 'Procura objetos escondidos', achieved: null },
                    { id: 'cg2', text: 'Explora objetos de formas diferentes', achieved: null },
                    { id: 'cg3', text: 'Imita ações simples', achieved: null },
                ],
                programs: ['IMITACAO', 'RECEPTIVO'],
            },
        },
    },
    '12-24': {
        name: '12-24 meses',
        ageDescription: 'Segundo ano de vida',
        categories: {
            communication: {
                name: 'Comunicação',
                icon: MessageSquare,
                color: 'from-blue-500 to-cyan-500',
                milestones: [
                    { id: 'c1', text: 'Fala pelo menos 10-20 palavras', achieved: null },
                    { id: 'c2', text: 'Combina duas palavras', achieved: null },
                    { id: 'c3', text: 'Aponta para mostrar algo', achieved: null },
                    { id: 'c4', text: 'Segue instruções simples', achieved: null },
                    { id: 'c5', text: 'Nomeia objetos familiares', achieved: null },
                ],
                programs: ['MAND', 'TACT', 'RECEPTIVO', 'ECOICO'],
            },
            social: {
                name: 'Social',
                icon: Users,
                color: 'from-pink-500 to-rose-500',
                milestones: [
                    { id: 's1', text: 'Imita comportamentos de adultos', achieved: null },
                    { id: 's2', text: 'Brinca ao lado de outras crianças', achieved: null },
                    { id: 's3', text: 'Mostra afeto a pessoas conhecidas', achieved: null },
                    { id: 's4', text: 'Explora sozinho com pais por perto', achieved: null },
                ],
                programs: ['SOCIAL', 'IMITACAO'],
            },
            motor: {
                name: 'Motor',
                icon: Hand,
                color: 'from-green-500 to-emerald-500',
                milestones: [
                    { id: 'm1', text: 'Caminha sozinho', achieved: null },
                    { id: 'm2', text: 'Sobe escadas com ajuda', achieved: null },
                    { id: 'm3', text: 'Rabisca com giz de cera', achieved: null },
                    { id: 'm4', text: 'Empilha 2-4 blocos', achieved: null },
                ],
                programs: ['MOTOR_FINO', 'MOTOR_GROSSO'],
            },
            cognitive: {
                name: 'Cognitivo',
                icon: Brain,
                color: 'from-purple-500 to-indigo-500',
                milestones: [
                    { id: 'cg1', text: 'Identifica partes do corpo', achieved: null },
                    { id: 'cg2', text: 'Brinca de faz de conta simples', achieved: null },
                    { id: 'cg3', text: 'Classifica por forma ou cor', achieved: null },
                    { id: 'cg4', text: 'Completa quebra-cabeça de 2-3 peças', achieved: null },
                ],
                programs: ['RECEPTIVO', 'IMITACAO', 'PAREAMENTO'],
            },
        },
    },
    '24-36': {
        name: '2-3 anos',
        ageDescription: 'Terceiro ano de vida',
        categories: {
            communication: {
                name: 'Comunicação',
                icon: MessageSquare,
                color: 'from-blue-500 to-cyan-500',
                milestones: [
                    { id: 'c1', text: 'Usa frases de 2-3 palavras', achieved: null },
                    { id: 'c2', text: 'Pergunta "o quê" e "onde"', achieved: null },
                    { id: 'c3', text: 'Nomeia ações em figuras', achieved: null },
                    { id: 'c4', text: 'Segue instruções de 2 passos', achieved: null },
                    { id: 'c5', text: 'Conversa simples de 2-3 turnos', achieved: null },
                ],
                programs: ['MAND', 'TACT', 'INTRAVERBAL', 'RECEPTIVO'],
            },
            social: {
                name: 'Social',
                icon: Users,
                color: 'from-pink-500 to-rose-500',
                milestones: [
                    { id: 's1', text: 'Brinca com outras crianças', achieved: null },
                    { id: 's2', text: 'Mostra preocupação com crianças chorando', achieved: null },
                    { id: 's3', text: 'Espera a vez em fila ou jogo', achieved: null },
                    { id: 's4', text: 'Divide brinquedos quando pedido', achieved: null },
                ],
                programs: ['SOCIAL', 'BRINCADEIRA'],
            },
            motor: {
                name: 'Motor',
                icon: Hand,
                color: 'from-green-500 to-emerald-500',
                milestones: [
                    { id: 'm1', text: 'Corre e pula', achieved: null },
                    { id: 'm2', text: 'Sobe escadas alternando pés', achieved: null },
                    { id: 'm3', text: 'Desenha círculos', achieved: null },
                    { id: 'm4', text: 'Usa tesoura com supervisão', achieved: null },
                ],
                programs: ['MOTOR_FINO', 'MOTOR_GROSSO'],
            },
            cognitive: {
                name: 'Cognitivo',
                icon: Brain,
                color: 'from-purple-500 to-indigo-500',
                milestones: [
                    { id: 'cg1', text: 'Conta até 3', achieved: null },
                    { id: 'cg2', text: 'Conhece cores básicas', achieved: null },
                    { id: 'cg3', text: 'Faz quebra-cabeça de 6+ peças', achieved: null },
                    { id: 'cg4', text: 'Entende conceitos de tamanho', achieved: null },
                ],
                programs: ['RECEPTIVO', 'TACT', 'PAREAMENTO'],
            },
        },
    },
    '36-48': {
        name: '3-4 anos',
        ageDescription: 'Pré-escolar inicial',
        categories: {
            communication: {
                name: 'Comunicação',
                icon: MessageSquare,
                color: 'from-blue-500 to-cyan-500',
                milestones: [
                    { id: 'c1', text: 'Fala em frases completas', achieved: null },
                    { id: 'c2', text: 'Conta histórias simples', achieved: null },
                    { id: 'c3', text: 'Responde perguntas "por quê"', achieved: null },
                    { id: 'c4', text: 'Fala nome e idade', achieved: null },
                    { id: 'c5', text: 'Usa plurais e conjugações', achieved: null },
                ],
                programs: ['TACT', 'INTRAVERBAL', 'MAND', 'CONVERSACAO'],
            },
            social: {
                name: 'Social',
                icon: Users,
                color: 'from-pink-500 to-rose-500',
                milestones: [
                    { id: 's1', text: 'Brinca cooperativamente', achieved: null },
                    { id: 's2', text: 'Negocia soluções para conflitos', achieved: null },
                    { id: 's3', text: 'Prefere alguns amigos a outros', achieved: null },
                    { id: 's4', text: 'Faz de conta mais elaborado', achieved: null },
                ],
                programs: ['SOCIAL', 'BRINCADEIRA', 'CONVERSACAO'],
            },
            motor: {
                name: 'Motor',
                icon: Hand,
                color: 'from-green-500 to-emerald-500',
                milestones: [
                    { id: 'm1', text: 'Pula em um pé só', achieved: null },
                    { id: 'm2', text: 'Recorta em linha reta', achieved: null },
                    { id: 'm3', text: 'Desenha pessoa com 2-4 partes', achieved: null },
                    { id: 'm4', text: 'Veste-se com pouca ajuda', achieved: null },
                ],
                programs: ['MOTOR_FINO', 'AVD'],
            },
            cognitive: {
                name: 'Cognitivo',
                icon: Brain,
                color: 'from-purple-500 to-indigo-500',
                milestones: [
                    { id: 'cg1', text: 'Conta até 10', achieved: null },
                    { id: 'cg2', text: 'Reconhece algumas letras', achieved: null },
                    { id: 'cg3', text: 'Entende conceito de tempo', achieved: null },
                    { id: 'cg4', text: 'Memoriza parte de uma história', achieved: null },
                ],
                programs: ['RECEPTIVO', 'TACT', 'INTRAVERBAL', 'ACADEMICO'],
            },
        },
    },
    '48-60': {
        name: '4-5 anos',
        ageDescription: 'Pré-escolar avançado',
        categories: {
            communication: {
                name: 'Comunicação',
                icon: MessageSquare,
                color: 'from-blue-500 to-cyan-500',
                milestones: [
                    { id: 'c1', text: 'Fala claramente', achieved: null },
                    { id: 'c2', text: 'Reconta histórias detalhadas', achieved: null },
                    { id: 'c3', text: 'Usa frases complexas', achieved: null },
                    { id: 'c4', text: 'Conversa sobre passado e futuro', achieved: null },
                ],
                programs: ['TACT', 'INTRAVERBAL', 'CONVERSACAO', 'TEXTUAL'],
            },
            social: {
                name: 'Social',
                icon: Users,
                color: 'from-pink-500 to-rose-500',
                milestones: [
                    { id: 's1', text: 'Segue regras de jogos', achieved: null },
                    { id: 's2', text: 'Empatia com sentimentos dos outros', achieved: null },
                    { id: 's3', text: 'Mantém amizades', achieved: null },
                    { id: 's4', text: 'Distingue fantasia de realidade', achieved: null },
                ],
                programs: ['SOCIAL', 'BRINCADEIRA', 'EMOCOES'],
            },
            motor: {
                name: 'Motor',
                icon: Hand,
                color: 'from-green-500 to-emerald-500',
                milestones: [
                    { id: 'm1', text: 'Escreve algumas letras', achieved: null },
                    { id: 'm2', text: 'Desenha pessoa com 6+ partes', achieved: null },
                    { id: 'm3', text: 'Usa garfo e faca', achieved: null },
                    { id: 'm4', text: 'Abotoa e desabotoa', achieved: null },
                ],
                programs: ['MOTOR_FINO', 'AVD', 'ESCRITA'],
            },
            cognitive: {
                name: 'Cognitivo',
                icon: Brain,
                color: 'from-purple-500 to-indigo-500',
                milestones: [
                    { id: 'cg1', text: 'Conta até 20 ou mais', achieved: null },
                    { id: 'cg2', text: 'Reconhece letras do alfabeto', achieved: null },
                    { id: 'cg3', text: 'Entende sequência de eventos', achieved: null },
                    { id: 'cg4', text: 'Resolve problemas simples', achieved: null },
                ],
                programs: ['ACADEMICO', 'TEXTUAL', 'MATEMATICA'],
            },
        },
    },
};

export default function DevelopmentalAssessment({ onComplete, onClose }) {
    const [step, setStep] = useState('age'); // 'age', 'assessment', 'results'
    const [selectedAge, setSelectedAge] = useState(null);
    const [currentCategory, setCurrentCategory] = useState(0);
    const [milestoneResponses, setMilestoneResponses] = useState({});
    const [suggestedPrograms, setSuggestedPrograms] = useState([]);

    const ageRanges = Object.keys(DEVELOPMENTAL_MILESTONES);
    const categoryKeys = selectedAge
        ? Object.keys(DEVELOPMENTAL_MILESTONES[selectedAge].categories)
        : [];

    const handleAgeSelect = (ageRange) => {
        setSelectedAge(ageRange);
        setMilestoneResponses({});
        setCurrentCategory(0);
        setStep('assessment');
    };

    const handleMilestoneResponse = (milestoneId, achieved) => {
        setMilestoneResponses(prev => ({
            ...prev,
            [milestoneId]: achieved,
        }));
    };

    const handleNextCategory = () => {
        if (currentCategory < categoryKeys.length - 1) {
            setCurrentCategory(prev => prev + 1);
        } else {
            calculateResults();
        }
    };

    const handlePrevCategory = () => {
        if (currentCategory > 0) {
            setCurrentCategory(prev => prev - 1);
        }
    };

    const calculateResults = () => {
        const ageData = DEVELOPMENTAL_MILESTONES[selectedAge];
        const programsNeeded = new Set();
        const areasToWork = [];

        Object.entries(ageData.categories).forEach(([categoryKey, category]) => {
            let achieved = 0;
            let total = category.milestones.length;

            category.milestones.forEach(milestone => {
                if (milestoneResponses[milestone.id] === true) {
                    achieved++;
                } else if (milestoneResponses[milestone.id] === false) {
                    // Not achieved - add programs
                    category.programs.forEach(prog => programsNeeded.add(prog));
                }
            });

            const percentage = (achieved / total) * 100;
            if (percentage < 80) {
                areasToWork.push({
                    name: category.name,
                    percentage,
                    programs: category.programs,
                });
            }
        });

        setSuggestedPrograms([...programsNeeded]);
        setStep('results');
    };

    const handleApplyPrograms = () => {
        // Here you would activate the suggested programs
        const allPrograms = getPrograms();
        suggestedPrograms.forEach(progCategory => {
            const matchingPrograms = allPrograms.filter(p =>
                p.category === progCategory ||
                p.name.toUpperCase().includes(progCategory)
            );
            matchingPrograms.forEach(program => {
                if (program.status !== 'active') {
                    updateProgram(program.id, { status: 'active' });
                }
            });
        });

        // Update patient with assessment info
        const patient = getPatient();
        if (patient) {
            updatePatient({
                developmentalAssessment: {
                    ageRange: selectedAge,
                    completedAt: new Date().toISOString(),
                    responses: milestoneResponses,
                    suggestedPrograms,
                },
            });
        }

        if (onComplete) onComplete(suggestedPrograms);
    };

    const currentCategoryData = selectedAge && categoryKeys[currentCategory]
        ? DEVELOPMENTAL_MILESTONES[selectedAge].categories[categoryKeys[currentCategory]]
        : null;

    const getCategoryProgress = () => {
        if (!currentCategoryData) return 0;
        const answered = currentCategoryData.milestones.filter(
            m => milestoneResponses[m.id] !== undefined
        ).length;
        return (answered / currentCategoryData.milestones.length) * 100;
    };

    return (
        <div
            className="modal-overlay"
            onClick={(e) => {
                if (e.target === e.currentTarget && onClose) onClose();
            }}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="modal-content max-w-2xl w-full"
                style={{ padding: 0 }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-6 border-b border-neutral-200 dark:border-neutral-700 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-2xl">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                            <Baby className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">Avaliação de Desenvolvimento</h2>
                            <p className="text-blue-100 text-sm">
                                {step === 'age' && 'Selecione a faixa etária'}
                                {step === 'assessment' && `Avaliando: ${currentCategoryData?.name}`}
                                {step === 'results' && 'Programas Recomendados'}
                            </p>
                        </div>
                    </div>

                    {/* Progress */}
                    {step === 'assessment' && (
                        <div className="mt-4">
                            <div className="flex justify-between text-sm mb-1">
                                <span>Categoria {currentCategory + 1} de {categoryKeys.length}</span>
                                <span>{Math.round(getCategoryProgress())}% respondido</span>
                            </div>
                            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${getCategoryProgress()}%` }}
                                    className="h-full bg-white rounded-full"
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Content - with proper overflow */}
                <div
                    className="flex-1 overflow-y-auto p-6"
                    style={{ maxHeight: '60vh', backgroundColor: '#ffffff' }}
                >
                    {/* Age Selection */}
                    {step === 'age' && (
                        <div className="space-y-4">
                            <p style={{ color: '#374151', textAlign: 'center', marginBottom: '1.5rem', fontWeight: 500 }}>
                                Selecione a faixa etária da criança para iniciar a avaliação dos marcos de desenvolvimento.
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {ageRanges.map((range) => (
                                    <motion.button
                                        key={range}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => handleAgeSelect(range)}
                                        style={{
                                            padding: '1.25rem',
                                            borderRadius: '0.75rem',
                                            border: '2px solid #e5e7eb',
                                            backgroundColor: '#f9fafb',
                                            textAlign: 'left',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s'
                                        }}
                                        className="hover:border-blue-500 hover:shadow-lg"
                                    >
                                        <p style={{ fontSize: '1.25rem', fontWeight: 700, color: '#2563eb' }}>
                                            {DEVELOPMENTAL_MILESTONES[range].name}
                                        </p>
                                        <p style={{ color: '#4b5563', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                                            {DEVELOPMENTAL_MILESTONES[range].ageDescription}
                                        </p>
                                        <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.5rem' }}>
                                            {Object.keys(DEVELOPMENTAL_MILESTONES[range].categories).length} categorias
                                        </p>
                                    </motion.button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Assessment */}
                    {step === 'assessment' && currentCategoryData && (
                        <div className="space-y-6">
                            {/* Category Header */}
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${currentCategoryData.color} flex items-center justify-center`}>
                                    <currentCategoryData.icon className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#111827' }}>{currentCategoryData.name}</h3>
                                    <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                                        Marque os marcos que a criança já atingiu
                                    </p>
                                </div>
                            </div>

                            {/* Milestones */}
                            <div className="space-y-3">
                                {currentCategoryData.milestones.map((milestone, index) => (
                                    <motion.div
                                        key={milestone.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        style={{
                                            padding: '1rem',
                                            borderRadius: '0.75rem',
                                            border: '2px solid #e5e7eb',
                                            backgroundColor: '#ffffff'
                                        }}
                                    >
                                        <p style={{ fontWeight: 500, marginBottom: '0.75rem', color: '#1f2937' }}>{milestone.text}</p>
                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => handleMilestoneResponse(milestone.id, true)}
                                                style={{
                                                    flex: 1,
                                                    padding: '0.5rem 1rem',
                                                    borderRadius: '0.5rem',
                                                    fontWeight: 500,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '0.5rem',
                                                    border: 'none',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s',
                                                    backgroundColor: milestoneResponses[milestone.id] === true ? '#22c55e' : '#f3f4f6',
                                                    color: milestoneResponses[milestone.id] === true ? '#ffffff' : '#374151',
                                                }}
                                            >
                                                <CheckCircle2 className="w-5 h-5" />
                                                Atingiu
                                            </button>
                                            <button
                                                onClick={() => handleMilestoneResponse(milestone.id, false)}
                                                style={{
                                                    flex: 1,
                                                    padding: '0.5rem 1rem',
                                                    borderRadius: '0.5rem',
                                                    fontWeight: 500,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '0.5rem',
                                                    border: 'none',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s',
                                                    backgroundColor: milestoneResponses[milestone.id] === false ? '#f97316' : '#f3f4f6',
                                                    color: milestoneResponses[milestone.id] === false ? '#ffffff' : '#374151',
                                                }}
                                            >
                                                <Circle className="w-5 h-5" />
                                                Em desenvolvimento
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Results */}
                    {step === 'results' && (
                        <div className="space-y-6">
                            <div className="text-center">
                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center mx-auto mb-4">
                                    <Sparkles className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Avaliação Concluída!</h3>
                                <p className="text-gray-600 dark:text-gray-300">
                                    Baseado nos marcos de desenvolvimento, identificamos os programas recomendados.
                                </p>
                            </div>

                            {suggestedPrograms.length > 0 ? (
                                <>
                                    <div className="p-4 rounded-xl bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800">
                                        <h4 className="font-semibold text-primary-700 dark:text-primary-300 mb-3 flex items-center gap-2">
                                            <Target className="w-5 h-5" />
                                            Programas Recomendados ({suggestedPrograms.length})
                                        </h4>
                                        <div className="flex flex-wrap gap-2">
                                            {suggestedPrograms.map(prog => (
                                                <span
                                                    key={prog}
                                                    className="px-3 py-1 rounded-full bg-primary-500 text-white text-sm font-medium"
                                                >
                                                    {prog}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <p className="text-sm text-neutral-500 text-center">
                                        Estes programas serão ativados automaticamente para trabalhar as áreas identificadas.
                                    </p>
                                </>
                            ) : (
                                <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-center">
                                    <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto mb-2" />
                                    <p className="text-green-700 dark:text-green-300 font-medium">
                                        Parabéns! Todos os marcos foram atingidos!
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900">
                    <div className="flex gap-3">
                        {step === 'age' && (
                            <button
                                onClick={onClose}
                                className="btn-secondary flex-1"
                            >
                                Cancelar
                            </button>
                        )}

                        {step === 'assessment' && (
                            <>
                                <button
                                    onClick={handlePrevCategory}
                                    disabled={currentCategory === 0}
                                    className="btn-secondary flex items-center gap-2"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                    Anterior
                                </button>
                                <button
                                    onClick={handleNextCategory}
                                    className="btn-primary flex-1 flex items-center justify-center gap-2"
                                >
                                    {currentCategory < categoryKeys.length - 1 ? (
                                        <>
                                            Próximo
                                            <ArrowRight className="w-4 h-4" />
                                        </>
                                    ) : (
                                        <>
                                            Ver Resultados
                                            <Sparkles className="w-4 h-4" />
                                        </>
                                    )}
                                </button>
                            </>
                        )}

                        {step === 'results' && (
                            <>
                                <button
                                    onClick={onClose}
                                    className="btn-secondary flex-1"
                                >
                                    Fechar
                                </button>
                                {suggestedPrograms.length > 0 && (
                                    <button
                                        onClick={handleApplyPrograms}
                                        className="btn-primary flex-1 flex items-center justify-center gap-2"
                                    >
                                        <BookOpen className="w-4 h-4" />
                                        Aplicar Programas
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
