'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Sparkles,
    TrendingUp,
    TrendingDown,
    AlertTriangle,
    CheckCircle,
    Info,
    PartyPopper,
    Lightbulb,
    Brain,
    ChevronRight,
    Calendar,
    RefreshCw,
    Download,
    Target,
    Activity,
} from 'lucide-react';
import { generateInsights, generateTherapistReport, getNextSessionRecommendations } from '@/lib/insightsService';
import { getPrograms, getBehaviors } from '@/lib/dataService';

const insightTypeConfig = {
    success: { icon: CheckCircle, color: 'success', bg: 'bg-success-50', border: 'border-success-500' },
    warning: { icon: AlertTriangle, color: 'warning', bg: 'bg-warning-50', border: 'border-warning-500' },
    info: { icon: Info, color: 'primary', bg: 'bg-primary-50', border: 'border-primary-500' },
    suggestion: { icon: Lightbulb, color: 'purple', bg: 'bg-purple-50', border: 'border-purple-500' },
    celebration: { icon: PartyPopper, color: 'warning', bg: 'bg-gradient-to-r from-purple-50 to-warning-50', border: 'border-purple-500' },
};

export default function InsightsPanel() {
    const [mounted, setMounted] = useState(false);
    const [insights, setInsights] = useState([]);
    const [recommendations, setRecommendations] = useState([]);
    const [activeFilter, setActiveFilter] = useState('all');
    const [isLoading, setIsLoading] = useState(true);
    const [showReportModal, setShowReportModal] = useState(false);
    const [reportDateRange, setReportDateRange] = useState({
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0],
    });
    const [generatedReport, setGeneratedReport] = useState(null);

    useEffect(() => {
        setMounted(true);
        loadInsights();
    }, []);

    const loadInsights = () => {
        setIsLoading(true);
        setTimeout(() => {
            setInsights(generateInsights());
            setRecommendations(getNextSessionRecommendations());
            setIsLoading(false);
        }, 500);
    };

    const filteredInsights = insights.filter(insight => {
        if (activeFilter === 'all') return true;
        return insight.type === activeFilter;
    });

    const getFilterCount = (type) => {
        if (type === 'all') return insights.length;
        return insights.filter(i => i.type === type).length;
    };

    const handleGenerateReport = () => {
        const report = generateTherapistReport(reportDateRange.start, reportDateRange.end);
        setGeneratedReport(report);
    };

    const handleDownloadReport = () => {
        if (!generatedReport) return;

        const reportText = generateReportText(generatedReport);
        const blob = new Blob([reportText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `relatorio-terapia-${reportDateRange.start}-${reportDateRange.end}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const generateReportText = (report) => {
        let text = '═══════════════════════════════════════════════════\n';
        text += '        RELATÓRIO DE ACOMPANHAMENTO TERAPÊUTICO\n';
        text += '═══════════════════════════════════════════════════\n\n';

        text += `Período: ${new Date(report.period.startDate).toLocaleDateString('pt-BR')} a ${new Date(report.period.endDate).toLocaleDateString('pt-BR')}\n`;
        text += `Gerado em: ${new Date(report.generatedAt).toLocaleString('pt-BR')}\n\n`;

        text += '───────────────────────────────────────────────────\n';
        text += '                    RESUMO GERAL\n';
        text += '───────────────────────────────────────────────────\n\n';

        text += `Total de Sessões: ${report.summary.totalSessions}\n`;
        text += `Total de Tentativas: ${report.summary.totalTrials}\n`;
        text += `Taxa de Acerto Geral: ${report.summary.overallAccuracy}%\n`;
        text += `Programas Trabalhados: ${report.summary.programsWorked}\n`;
        text += `Comportamentos Registrados: ${report.summary.behaviorsRecorded}\n\n`;

        text += '───────────────────────────────────────────────────\n';
        text += '              DESEMPENHO POR PROGRAMA\n';
        text += '───────────────────────────────────────────────────\n\n';

        Object.values(report.programStats).forEach(prog => {
            const status = prog.isAtTarget ? '✅' : '⚠️';
            text += `${status} ${prog.name} (${prog.category})\n`;
            text += `   Tentativas: ${prog.trials} | Acurácia: ${prog.accuracy}% | Meta: ${prog.targetAccuracy}%\n\n`;
        });

        if (Object.keys(report.behaviorStats).length > 0) {
            text += '───────────────────────────────────────────────────\n';
            text += '                  COMPORTAMENTOS\n';
            text += '───────────────────────────────────────────────────\n\n';

            Object.values(report.behaviorStats).forEach(beh => {
                const arrow = beh.trend === 'increasing' ? '↑' : beh.trend === 'decreasing' ? '↓' : '→';
                text += `${arrow} ${beh.name}\n`;
                text += `   Ocorrências: ${beh.occurrences} | Total: ${beh.totalCount} | Tendência: ${beh.trend}\n\n`;
            });
        }

        text += '───────────────────────────────────────────────────\n';
        text += '              INSIGHTS E RECOMENDAÇÕES\n';
        text += '───────────────────────────────────────────────────\n\n';

        report.insights.forEach((insight, index) => {
            text += `${index + 1}. ${insight.title}\n`;
            text += `   ${insight.description}\n`;
            text += `   💡 ${insight.suggestion}\n\n`;
        });

        text += '═══════════════════════════════════════════════════\n';
        text += '                Dom TEA ABA Insights\n';
        text += '═══════════════════════════════════════════════════\n';

        return text;
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
                        <Sparkles className="w-8 h-8 text-purple-500" />
                        Insights IA
                    </h1>
                    <p className="page-subtitle">
                        Análises inteligentes e sugestões baseadas nos dados de terapia.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={loadInsights}
                        className="btn-secondary"
                        disabled={isLoading}
                    >
                        <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
                        Atualizar
                    </button>
                    <button
                        onClick={() => setShowReportModal(true)}
                        className="btn-primary"
                    >
                        <Download size={18} />
                        Gerar Relatório
                    </button>
                </div>
            </div>

            {/* AI Brain Animation */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="chart-container p-6 lg:p-8 mb-8 bg-gradient-to-r from-purple-500/10 to-primary-500/10"
            >
                <div className="flex items-center gap-5 lg:gap-6">
                    <motion.div
                        animate={{
                            scale: [1, 1.1, 1],
                            rotate: [0, 5, -5, 0],
                        }}
                        transition={{
                            repeat: Infinity,
                            duration: 4,
                            ease: "easeInOut"
                        }}
                        className="w-16 h-16 lg:w-20 lg:h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-primary-600 flex items-center justify-center shadow-xl flex-shrink-0"
                    >
                        <Brain className="w-8 h-8 lg:w-10 lg:h-10 text-white" />
                    </motion.div>
                    <div>
                        <h2 className="text-lg lg:text-xl font-bold mb-2">Análise Inteligente</h2>
                        <p className="text-sm lg:text-base text-neutral-600 dark:text-neutral-400 leading-relaxed">
                            A IA analisou seus dados e encontrou <span className="font-bold text-purple-600">{insights.length} insights</span> importantes
                            para ajudar no acompanhamento terapêutico.
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3 mb-8 overflow-x-auto pb-2">
                {[
                    { id: 'all', label: 'Todos' },
                    { id: 'success', label: 'Conquistas', icon: CheckCircle },
                    { id: 'warning', label: 'Atenção', icon: AlertTriangle },
                    { id: 'suggestion', label: 'Sugestões', icon: Lightbulb },
                    { id: 'celebration', label: 'Celebrações', icon: PartyPopper },
                    { id: 'info', label: 'Informativo', icon: Info },
                ].map(filter => (
                    <button
                        key={filter.id}
                        onClick={() => setActiveFilter(filter.id)}
                        className={`px-4 py-2.5 rounded-xl font-medium transition-all flex items-center gap-2 whitespace-nowrap ${activeFilter === filter.id
                            ? 'bg-primary-500 text-white shadow-lg'
                            : 'bg-white dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700'
                            }`}
                    >
                        {filter.icon && <filter.icon size={16} />}
                        <span className="hidden sm:inline">{filter.label}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${activeFilter === filter.id
                            ? 'bg-white/20'
                            : 'bg-neutral-200 dark:bg-neutral-600'
                            }`}>
                            {getFilterCount(filter.id)}
                        </span>
                    </button>
                ))}
            </div>

            {/* Main Content */}
            <div className="space-y-6 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-8">
                {/* Insights List */}
                <div className="lg:col-span-2 space-y-5">
                    {isLoading ? (
                        <div className="chart-container text-center py-16">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                            >
                                <Brain className="w-14 h-14 text-purple-500 mx-auto" />
                            </motion.div>
                            <p className="mt-5 text-neutral-500">Analisando dados...</p>
                        </div>
                    ) : filteredInsights.length > 0 ? (
                        filteredInsights.map((insight, index) => {
                            const config = insightTypeConfig[insight.type] || insightTypeConfig.info;
                            const Icon = config.icon;

                            return (
                                <motion.div
                                    key={insight.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className={`chart-container p-5 lg:p-6 ${config.bg} border-l-4 ${config.border}`}
                                >
                                    <div className="flex gap-4">
                                        <div className={`w-14 h-14 rounded-2xl bg-${config.color}-100 flex items-center justify-center flex-shrink-0`}>
                                            <Icon className={`w-7 h-7 text-${config.color}-600`} />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-bold text-lg mb-2">{insight.title}</h3>
                                            <p className="text-neutral-600 leading-relaxed">{insight.description}</p>

                                            {insight.suggestion && (
                                                <div className="mt-4 p-4 rounded-xl bg-white/60 dark:bg-neutral-800/60">
                                                    <p className="text-sm flex items-start gap-3">
                                                        <Lightbulb className="w-5 h-5 text-warning-500 flex-shrink-0 mt-0.5" />
                                                        <span><strong>Sugestão:</strong> {insight.suggestion}</span>
                                                    </p>
                                                </div>
                                            )}

                                            <div className="flex items-center gap-4 mt-4 text-xs text-neutral-500">
                                                <span className="flex items-center gap-1.5">
                                                    <Calendar size={14} />
                                                    {new Date(insight.timestamp).toLocaleDateString('pt-BR')}
                                                </span>
                                                <span className={`badge badge-${config.color}`}>
                                                    {insight.category}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })
                    ) : (
                        <div className="chart-container text-center py-16">
                            <Sparkles className="w-20 h-20 text-neutral-300 mx-auto mb-5" />
                            <h3 className="text-lg font-semibold mb-2">Nenhum insight encontrado</h3>
                            <p className="text-neutral-500">
                                Continue registrando sessões para que a IA possa gerar análises.
                            </p>
                        </div>
                    )}
                </div>

                {/* Sidebar - Recommendations */}
                <div className="space-y-6">
                    {/* Quick Stats */}
                    <div className="chart-container p-5 lg:p-6">
                        <h3 className="font-bold text-base mb-5 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                                <Activity className="w-4 h-4 text-white" />
                            </div>
                            Resumo dos Insights
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 rounded-xl bg-success-50">
                                <span className="flex items-center gap-3">
                                    <TrendingUp className="w-5 h-5 text-success-600" />
                                    <span className="font-medium">Positivos</span>
                                </span>
                                <span className="text-xl font-bold text-success-600">
                                    {insights.filter(i => i.type === 'success' || i.type === 'celebration').length}
                                </span>
                            </div>
                            <div className="flex items-center justify-between p-4 rounded-xl bg-warning-50">
                                <span className="flex items-center gap-3">
                                    <AlertTriangle className="w-5 h-5 text-warning-600" />
                                    <span className="font-medium">Atenção</span>
                                </span>
                                <span className="text-xl font-bold text-warning-600">
                                    {insights.filter(i => i.type === 'warning').length}
                                </span>
                            </div>
                            <div className="flex items-center justify-between p-4 rounded-xl bg-purple-50">
                                <span className="flex items-center gap-3">
                                    <Lightbulb className="w-5 h-5 text-purple-600" />
                                    <span className="font-medium">Sugestões</span>
                                </span>
                                <span className="text-xl font-bold text-purple-600">
                                    {insights.filter(i => i.type === 'suggestion').length}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Next Session Recommendations */}
                    <div className="chart-container p-5 lg:p-6">
                        <h3 className="font-bold text-base mb-5 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                                <Target className="w-4 h-4 text-white" />
                            </div>
                            Recomendações
                        </h3>
                        <div className="space-y-4">
                            {recommendations.slice(0, 5).map((rec, index) => (
                                <div
                                    key={index}
                                    className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/50"
                                >
                                    {rec.type === 'tip' ? (
                                        <p className="text-sm leading-relaxed">
                                            <span className="font-semibold">{rec.title}:</span> {rec.description}
                                        </p>
                                    ) : (
                                        <>
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="badge badge-primary text-xs">{rec.category}</span>
                                                <span className="text-sm font-bold text-neutral-600">{rec.currentAccuracy}%</span>
                                            </div>
                                            <p className="font-semibold text-sm mb-1">{rec.name}</p>
                                            <p className="text-xs text-neutral-500 leading-relaxed">{rec.reason}</p>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Report Modal */}
            {showReportModal && (
                <div className="modal-overlay" onClick={() => setShowReportModal(false)}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="modal-content max-w-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 className="text-xl font-bold mb-4">Gerar Relatório para Terapeuta</h2>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div>
                                <label className="input-label">Data Início</label>
                                <input
                                    type="date"
                                    value={reportDateRange.start}
                                    onChange={(e) => setReportDateRange({ ...reportDateRange, start: e.target.value })}
                                    className="input-field"
                                />
                            </div>
                            <div>
                                <label className="input-label">Data Fim</label>
                                <input
                                    type="date"
                                    value={reportDateRange.end}
                                    onChange={(e) => setReportDateRange({ ...reportDateRange, end: e.target.value })}
                                    className="input-field"
                                />
                            </div>
                        </div>

                        <button
                            onClick={handleGenerateReport}
                            className="btn-primary w-full mb-4"
                        >
                            <Brain size={18} />
                            Gerar Relatório
                        </button>

                        {generatedReport && (
                            <div className="border rounded-xl p-4 bg-neutral-50 dark:bg-neutral-800 max-h-64 overflow-y-auto">
                                <h3 className="font-bold mb-2">Prévia do Relatório</h3>
                                <div className="text-sm space-y-2">
                                    <p><strong>Período:</strong> {new Date(generatedReport.period.startDate).toLocaleDateString('pt-BR')} a {new Date(generatedReport.period.endDate).toLocaleDateString('pt-BR')}</p>
                                    <p><strong>Sessões:</strong> {generatedReport.summary.totalSessions}</p>
                                    <p><strong>Tentativas:</strong> {generatedReport.summary.totalTrials}</p>
                                    <p><strong>Acurácia Geral:</strong> {generatedReport.summary.overallAccuracy}%</p>
                                    <p><strong>Insights:</strong> {generatedReport.insights.length}</p>
                                </div>

                                <button
                                    onClick={handleDownloadReport}
                                    className="btn-success w-full mt-4"
                                >
                                    <Download size={18} />
                                    Baixar Relatório Completo
                                </button>
                            </div>
                        )}

                        <button
                            onClick={() => {
                                setShowReportModal(false);
                                setGeneratedReport(null);
                            }}
                            className="btn-secondary w-full mt-4"
                        >
                            Fechar
                        </button>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
