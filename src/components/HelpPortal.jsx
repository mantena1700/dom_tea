'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Play,
    BookOpen,
    ChevronRight,
    ChevronDown,
    Search,
    Video,
    HelpCircle,
    Star,
    Clock,
    Target,
    BarChart3,
    Settings,
    Brain,
    Lightbulb,
    Users,
    FileText,
    Zap,
    ExternalLink,
} from 'lucide-react';

// Tutorial categories with video placeholders
const tutorialCategories = [
    {
        id: 'getting-started',
        name: 'Primeiros Passos',
        icon: Star,
        color: 'from-yellow-500 to-orange-500',
        description: 'Aprenda o básico para começar a usar o DOM TEA',
        videos: [
            {
                id: 'intro-1',
                title: 'Bem-vindo ao DOM TEA',
                description: 'Visão geral do sistema e suas funcionalidades principais',
                duration: '5:30',
                youtubeId: '', // User will add YouTube ID
                thumbnail: null,
            },
            {
                id: 'intro-2',
                title: 'Configurando o Perfil do Paciente',
                description: 'Como cadastrar e configurar as informações da criança',
                duration: '3:45',
                youtubeId: '',
                thumbnail: null,
            },
            {
                id: 'intro-3',
                title: 'Navegando pelo Sistema',
                description: 'Entenda cada seção e como navegar entre elas',
                duration: '4:20',
                youtubeId: '',
                thumbnail: null,
            },
        ],
    },
    {
        id: 'sessions',
        name: 'Sessões de Terapia',
        icon: Clock,
        color: 'from-blue-500 to-cyan-500',
        description: 'Tudo sobre iniciar e conduzir sessões',
        videos: [
            {
                id: 'session-1',
                title: 'Iniciando uma Sessão',
                description: 'Passo a passo para começar uma sessão de terapia',
                duration: '6:15',
                youtubeId: '',
                thumbnail: null,
            },
            {
                id: 'session-2',
                title: 'Usando o Timer de Tarefa',
                description: 'Como cronometrar cada atividade e registrar latência',
                duration: '4:50',
                youtubeId: '',
                thumbnail: null,
            },
            {
                id: 'session-3',
                title: 'Registrando Tentativas',
                description: 'Como registrar acertos, erros e níveis de prompt',
                duration: '5:00',
                youtubeId: '',
                thumbnail: null,
            },
            {
                id: 'session-4',
                title: 'Registrando Comportamentos',
                description: 'Como marcar comportamentos durante a sessão',
                duration: '3:30',
                youtubeId: '',
                thumbnail: null,
            },
        ],
    },
    {
        id: 'programs',
        name: 'Programas e Metas',
        icon: Target,
        color: 'from-green-500 to-emerald-500',
        description: 'Gerenciando programas de ensino e metas',
        videos: [
            {
                id: 'prog-1',
                title: 'Criando Novos Programas',
                description: 'Como adicionar programas personalizados',
                duration: '5:45',
                youtubeId: '',
                thumbnail: null,
            },
            {
                id: 'prog-2',
                title: 'Definindo Metas de Tempo',
                description: 'Como configurar metas de tempo por atividade',
                duration: '4:00',
                youtubeId: '',
                thumbnail: null,
            },
            {
                id: 'prog-3',
                title: 'Categorias de Programas',
                description: 'Entendendo MAND, TACT, RECEPTIVO e outras categorias',
                duration: '7:20',
                youtubeId: '',
                thumbnail: null,
            },
        ],
    },
    {
        id: 'reports',
        name: 'Relatórios e Análises',
        icon: BarChart3,
        color: 'from-purple-500 to-pink-500',
        description: 'Analisando dados e gerando relatórios',
        videos: [
            {
                id: 'report-1',
                title: 'Entendendo o Dashboard',
                description: 'Como interpretar os gráficos e métricas',
                duration: '6:00',
                youtubeId: '',
                thumbnail: null,
            },
            {
                id: 'report-2',
                title: 'Relatórios de Timing',
                description: 'Analisando tempo de resposta e latência',
                duration: '5:30',
                youtubeId: '',
                thumbnail: null,
            },
            {
                id: 'report-3',
                title: 'Exportando Dados',
                description: 'Como exportar relatórios para compartilhar',
                duration: '3:15',
                youtubeId: '',
                thumbnail: null,
            },
        ],
    },
    {
        id: 'insights',
        name: 'Insights Inteligentes',
        icon: Brain,
        color: 'from-indigo-500 to-violet-500',
        description: 'Usando a IA para otimizar a terapia',
        videos: [
            {
                id: 'insight-1',
                title: 'Interpretando Insights',
                description: 'Como entender as sugestões do sistema',
                duration: '5:00',
                youtubeId: '',
                thumbnail: null,
            },
            {
                id: 'insight-2',
                title: 'Detecção de Fadiga',
                description: 'Como o sistema identifica sinais de cansaço',
                duration: '4:20',
                youtubeId: '',
                thumbnail: null,
            },
            {
                id: 'insight-3',
                title: 'Melhor Horário para Terapia',
                description: 'Usando dados para otimizar horários das sessões',
                duration: '3:45',
                youtubeId: '',
                thumbnail: null,
            },
        ],
    },
    {
        id: 'gamification',
        name: 'Modo Competição',
        icon: Zap,
        color: 'from-red-500 to-rose-500',
        description: 'Gamificação e motivação',
        videos: [
            {
                id: 'game-1',
                title: 'Introdução ao Modo Competição',
                description: 'Como funciona a gamificação no DOM TEA',
                duration: '4:30',
                youtubeId: '',
                thumbnail: null,
            },
            {
                id: 'game-2',
                title: 'Conquistas e Recordes',
                description: 'Sistema de conquistas e recordes pessoais',
                duration: '5:15',
                youtubeId: '',
                thumbnail: null,
            },
        ],
    },
    {
        id: 'settings',
        name: 'Configurações',
        icon: Settings,
        color: 'from-gray-500 to-slate-600',
        description: 'Personalizando o sistema',
        videos: [
            {
                id: 'config-1',
                title: 'Configurações Gerais',
                description: 'Personalizando preferências do sistema',
                duration: '4:00',
                youtubeId: '',
                thumbnail: null,
            },
            {
                id: 'config-2',
                title: 'Temas e Aparência',
                description: 'Como alterar o tema visual',
                duration: '2:30',
                youtubeId: '',
                thumbnail: null,
            },
            {
                id: 'config-3',
                title: 'Backup e Sincronização',
                description: 'Como manter seus dados seguros',
                duration: '3:45',
                youtubeId: '',
                thumbnail: null,
            },
        ],
    },
];

// FAQ items
const faqItems = [
    {
        question: 'O que é o DOM TEA?',
        answer: 'O DOM TEA é um sistema de acompanhamento terapêutico para crianças com TEA (Transtorno do Espectro Autista), focado em terapia ABA. Ele permite registrar sessões, acompanhar progresso e gerar insights inteligentes.',
    },
    {
        question: 'Como funciona o timer de tarefa?',
        answer: 'O timer de tarefa cronometra automaticamente o tempo que a criança leva para completar cada atividade. Você pode marcar a latência (tempo até começar a responder) e pausar/reiniciar conforme necessário.',
    },
    {
        question: 'Os dados ficam salvos onde?',
        answer: 'Atualmente os dados são salvos localmente no seu navegador (localStorage). Em breve teremos sincronização em nuvem para backup automático.',
    },
    {
        question: 'Posso usar em mais de um dispositivo?',
        answer: 'Por enquanto os dados ficam salvos apenas no dispositivo atual. A sincronização entre dispositivos será implementada em versões futuras.',
    },
    {
        question: 'Como exportar relatórios?',
        answer: 'Na seção de Relatórios, você pode exportar dados em formato texto ou PDF. Basta selecionar o período desejado e clicar no botão de exportar.',
    },
    {
        question: 'O que são os Insights IA?',
        answer: 'Os Insights são análises automáticas geradas pelo sistema baseadas nos dados coletados. Eles identificam padrões, sugerem melhorias e alertam sobre possíveis problemas.',
    },
];

export default function HelpPortal() {
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedFaq, setExpandedFaq] = useState(null);
    const [playingVideo, setPlayingVideo] = useState(null);

    const filteredCategories = tutorialCategories.filter(cat =>
        cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cat.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cat.videos.some(v =>
            v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            v.description.toLowerCase().includes(searchQuery.toLowerCase())
        )
    );

    const filteredFaq = faqItems.filter(item =>
        item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.answer.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handlePlayVideo = (video) => {
        if (video.youtubeId) {
            setPlayingVideo(video);
        } else {
            // Show placeholder message
            alert('Este vídeo ainda não foi adicionado. Em breve estará disponível!');
        }
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="text-center">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="inline-flex items-center gap-3 mb-4"
                >
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-xl">
                        <BookOpen className="w-8 h-8 text-white" />
                    </div>
                </motion.div>
                <h1 className="text-3xl font-bold mb-2">Central de Ajuda</h1>
                <p className="text-neutral-500 max-w-2xl mx-auto">
                    Aprenda a usar todas as funcionalidades do DOM TEA com tutoriais em vídeo e respostas para dúvidas frequentes.
                </p>
            </div>

            {/* Search Bar */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="max-w-2xl mx-auto"
            >
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                    <input
                        type="text"
                        placeholder="Buscar tutoriais, vídeos ou perguntas..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="input-field pl-12 text-lg py-4"
                    />
                </div>
            </motion.div>

            {/* Quick Stats */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="grid grid-cols-2 md:grid-cols-4 gap-4"
            >
                <div className="stat-card text-center">
                    <Video className="w-6 h-6 mx-auto mb-2 text-primary-500" />
                    <p className="text-2xl font-bold">{tutorialCategories.reduce((acc, cat) => acc + cat.videos.length, 0)}</p>
                    <p className="text-sm text-neutral-500">Vídeos</p>
                </div>
                <div className="stat-card text-center">
                    <BookOpen className="w-6 h-6 mx-auto mb-2 text-green-500" />
                    <p className="text-2xl font-bold">{tutorialCategories.length}</p>
                    <p className="text-sm text-neutral-500">Categorias</p>
                </div>
                <div className="stat-card text-center">
                    <HelpCircle className="w-6 h-6 mx-auto mb-2 text-purple-500" />
                    <p className="text-2xl font-bold">{faqItems.length}</p>
                    <p className="text-sm text-neutral-500">FAQs</p>
                </div>
                <div className="stat-card text-center">
                    <Lightbulb className="w-6 h-6 mx-auto mb-2 text-yellow-500" />
                    <p className="text-2xl font-bold">24/7</p>
                    <p className="text-sm text-neutral-500">Disponível</p>
                </div>
            </motion.div>

            {/* Tutorial Categories */}
            <div>
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Video className="w-5 h-5 text-primary-500" />
                    Tutoriais em Vídeo
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredCategories.map((category, index) => (
                        <motion.div
                            key={category.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 * index }}
                        >
                            <button
                                onClick={() => setSelectedCategory(
                                    selectedCategory?.id === category.id ? null : category
                                )}
                                className={`w-full text-left chart-container hover:shadow-lg transition-all ${selectedCategory?.id === category.id ? 'ring-2 ring-primary-500' : ''
                                    }`}
                            >
                                <div className="flex items-start gap-4">
                                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center flex-shrink-0`}>
                                        <category.icon className="w-6 h-6 text-white" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <h3 className="font-semibold">{category.name}</h3>
                                            <motion.div
                                                animate={{ rotate: selectedCategory?.id === category.id ? 90 : 0 }}
                                            >
                                                <ChevronRight className="w-5 h-5 text-neutral-400" />
                                            </motion.div>
                                        </div>
                                        <p className="text-sm text-neutral-500 mt-1">{category.description}</p>
                                        <p className="text-xs text-primary-500 font-medium mt-2">
                                            {category.videos.length} vídeos
                                        </p>
                                    </div>
                                </div>
                            </button>

                            {/* Expanded Videos List */}
                            <AnimatePresence>
                                {selectedCategory?.id === category.id && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="mt-2 space-y-2"
                                    >
                                        {category.videos.map((video) => (
                                            <motion.button
                                                key={video.id}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                onClick={() => handlePlayVideo(video)}
                                                className="w-full p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all text-left flex items-center gap-4"
                                            >
                                                <div className="w-16 h-12 rounded-lg bg-gradient-to-br from-neutral-200 to-neutral-300 dark:from-neutral-700 dark:to-neutral-600 flex items-center justify-center relative overflow-hidden flex-shrink-0">
                                                    {video.youtubeId ? (
                                                        <img
                                                            src={`https://img.youtube.com/vi/${video.youtubeId}/mqdefault.jpg`}
                                                            alt={video.title}
                                                            className="w-full h-full object-cover rounded-lg"
                                                        />
                                                    ) : (
                                                        <Play className="w-6 h-6 text-neutral-400" />
                                                    )}
                                                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                                        <Play className="w-6 h-6 text-white" />
                                                    </div>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-medium text-sm">{video.title}</h4>
                                                    <p className="text-xs text-neutral-500 truncate">{video.description}</p>
                                                </div>
                                                <div className="flex items-center gap-1 text-xs text-neutral-400">
                                                    <Clock className="w-3 h-3" />
                                                    {video.duration}
                                                </div>
                                            </motion.button>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* FAQ Section */}
            <div>
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <HelpCircle className="w-5 h-5 text-purple-500" />
                    Perguntas Frequentes
                </h2>

                <div className="space-y-3">
                    {filteredFaq.map((item, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.05 * index }}
                            className="chart-container"
                        >
                            <button
                                onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                                className="w-full flex items-center justify-between text-left"
                            >
                                <span className="font-medium">{item.question}</span>
                                <motion.div
                                    animate={{ rotate: expandedFaq === index ? 180 : 0 }}
                                >
                                    <ChevronDown className="w-5 h-5 text-neutral-400" />
                                </motion.div>
                            </button>
                            <AnimatePresence>
                                {expandedFaq === index && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="mt-3 pt-3 border-t border-neutral-200 dark:border-neutral-700"
                                    >
                                        <p className="text-neutral-600 dark:text-neutral-400 text-sm">
                                            {item.answer}
                                        </p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Contact/Support Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="chart-container bg-gradient-to-r from-primary-50 to-blue-50 dark:from-primary-900/20 dark:to-blue-900/20"
            >
                <div className="flex flex-col md:flex-row items-center gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                        <Users className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1 text-center md:text-left">
                        <h3 className="text-lg font-bold mb-1">Precisa de mais ajuda?</h3>
                        <p className="text-neutral-600 dark:text-neutral-400">
                            Nossa equipe está pronta para ajudar você a aproveitar ao máximo o DOM TEA.
                        </p>
                    </div>
                    <button className="btn-primary whitespace-nowrap">
                        <FileText size={18} />
                        Enviar Mensagem
                    </button>
                </div>
            </motion.div>

            {/* Video Player Modal */}
            <AnimatePresence>
                {playingVideo && (
                    <div
                        className="modal-overlay"
                        onClick={() => setPlayingVideo(null)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-white dark:bg-neutral-800 rounded-2xl overflow-hidden max-w-4xl w-full mx-4 shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="aspect-video bg-black">
                                <iframe
                                    src={`https://www.youtube.com/embed/${playingVideo.youtubeId}?autoplay=1`}
                                    title={playingVideo.title}
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                    className="w-full h-full"
                                />
                            </div>
                            <div className="p-4">
                                <h3 className="font-bold text-lg">{playingVideo.title}</h3>
                                <p className="text-neutral-500 text-sm mt-1">{playingVideo.description}</p>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
