'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User,
    Camera,
    Calendar,
    Heart,
    Star,
    Plus,
    X,
    Pill,
    AlertCircle,
    Activity,
    FileText,
    Check,
    Save
} from 'lucide-react';
import {
    Card,
    Badge,
    Button,
    Input,
    Textarea,
    PageHeader,
    TabNav,
    SectionTitle,
    EmptyState
} from '@/components/ui';
import {
    getPatient,
    savePatient,
} from '@/lib/dataService';

const TABS = [
    { id: 'profile', label: 'Perfil', icon: User },
    { id: 'health', label: 'Saúde', icon: Heart },
    { id: 'preferences', label: 'Preferências', icon: Star },
    { id: 'notes', label: 'Notas', icon: FileText },
];

export default function PatientProfile() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [activeTab, setActiveTab] = useState('profile');
    const [notes, setNotes] = useState([]);
    const [newNote, setNewNote] = useState('');
    const fileInputRef = useRef(null);

    const [patient, setPatient] = useState({
        name: '',
        birthDate: '',
        photo: null,
        diagnosis: '',
        communicationStyle: '',
        allergies: [],
        medications: [],
        doctors: [],
        interests: [],
        strengths: [],
        challenges: [],
        notes: ''
    });

    // Inputs temporários para listas
    const [tempInputs, setTempInputs] = useState({
        allergy: '',
        medication: '',
        interest: '',
        strength: '',
        challenge: '',
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const patientData = await getPatient();
            if (patientData) setPatient(prev => ({ ...prev, ...patientData }));
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setSaved(false);
        try {
            await savePatient(patient);
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch (error) {
            console.error('Erro ao salvar:', error);
        } finally {
            setSaving(false);
        }
    };

    const handlePhotoUpload = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const size = 200;
                    canvas.width = size;
                    canvas.height = size;
                    const ctx = canvas.getContext('2d');
                    const scale = Math.max(size / img.width, size / img.height);
                    const x = (size - img.width * scale) / 2;
                    const y = (size - img.height * scale) / 2;
                    ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
                    const resized = canvas.toDataURL('image/jpeg', 0.8);
                    setPatient({ ...patient, photo: resized });
                };
                img.src = event.target?.result;
            };
            reader.readAsDataURL(file);
        }
    };

    const addToList = (key, value, inputKey) => {
        if (value.trim()) {
            setPatient({
                ...patient,
                [key]: [...(patient[key] || []), value.trim()]
            });
            setTempInputs({ ...tempInputs, [inputKey]: '' });
        }
    };

    const removeFromList = (key, index) => {
        setPatient({
            ...patient,
            [key]: patient[key].filter((_, i) => i !== index)
        });
    };

    const handleAddNote = () => {
        if (newNote.trim()) {
            setNotes([{ content: newNote, timestamp: new Date().toISOString() }, ...notes]);
            setNewNote('');
        }
    };

    const calculateAge = (birthDate) => {
        if (!birthDate) return null;
        const birth = new Date(birthDate);
        const today = new Date();
        let age = today.getFullYear() - birth.getFullYear();
        const m = today.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
        return age;
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
        <div className="max-w-4xl mx-auto px-4 py-6 pb-24 lg:pb-6">

            {/* === HEADER COM FOTO === */}
            <div className="flex flex-col sm:flex-row items-center gap-6 mb-8">
                {/* Foto */}
                <div className="relative group">
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className="w-28 h-28 rounded-full bg-slate-200 dark:bg-slate-700 border-4 border-white dark:border-slate-800 shadow-xl overflow-hidden cursor-pointer"
                    >
                        {patient.photo ? (
                            <img src={patient.photo} alt="Foto" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400 dark:text-slate-500">
                                <User size={48} />
                            </div>
                        )}
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                            <Camera size={28} className="text-white" />
                        </div>
                    </div>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handlePhotoUpload}
                    />
                </div>

                {/* Info */}
                <div className="text-center sm:text-left flex-1">
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white">
                        {patient.name || 'Nome do Paciente'}
                    </h1>
                    <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-3">
                        {patient.birthDate && (
                            <Badge variant="neutral" size="lg">
                                <Calendar size={14} />
                                {calculateAge(patient.birthDate)} anos
                            </Badge>
                        )}
                        {patient.diagnosis && (
                            <Badge variant="primary" size="lg">
                                <Activity size={14} />
                                {patient.diagnosis}
                            </Badge>
                        )}
                    </div>
                </div>

                {/* Botão Salvar */}
                <Button onClick={handleSave} loading={saving} className="w-full sm:w-auto">
                    {saved ? (
                        <>
                            <Check size={18} />
                            Salvo!
                        </>
                    ) : (
                        <>
                            <Save size={18} />
                            Salvar
                        </>
                    )}
                </Button>
            </div>

            {/* === TABS === */}
            <TabNav
                tabs={TABS}
                activeTab={activeTab}
                onChange={setActiveTab}
            />

            {/* === CONTEÚDO DAS TABS === */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                >
                    {/* PERFIL */}
                    {activeTab === 'profile' && (
                        <Card hover={false}>
                            <div className="space-y-5">
                                <Input
                                    label="Nome Completo"
                                    icon={User}
                                    value={patient.name || ''}
                                    onChange={(e) => setPatient({ ...patient, name: e.target.value })}
                                    placeholder="Nome do paciente"
                                />

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <Input
                                        label="Data de Nascimento"
                                        icon={Calendar}
                                        type="date"
                                        value={patient.birthDate || ''}
                                        onChange={(e) => setPatient({ ...patient, birthDate: e.target.value })}
                                    />
                                    <Input
                                        label="Diagnóstico"
                                        icon={Activity}
                                        value={patient.diagnosis || ''}
                                        onChange={(e) => setPatient({ ...patient, diagnosis: e.target.value })}
                                        placeholder="Ex: TEA Nível 1"
                                    />
                                </div>

                                <Input
                                    label="Estilo de Comunicação"
                                    value={patient.communicationStyle || ''}
                                    onChange={(e) => setPatient({ ...patient, communicationStyle: e.target.value })}
                                    placeholder="Ex: Verbal, PECS, Gestos..."
                                />
                            </div>
                        </Card>
                    )}

                    {/* SAÚDE */}
                    {activeTab === 'health' && (
                        <div className="space-y-5">
                            {/* Alergias */}
                            <Card hover={false}>
                                <SectionTitle>🚨 Alergias</SectionTitle>
                                <div className="flex gap-2 mb-4">
                                    <Input
                                        placeholder="Adicionar alergia..."
                                        value={tempInputs.allergy}
                                        onChange={(e) => setTempInputs({ ...tempInputs, allergy: e.target.value })}
                                        className="flex-1"
                                        onKeyDown={(e) => e.key === 'Enter' && addToList('allergies', tempInputs.allergy, 'allergy')}
                                    />
                                    <Button
                                        onClick={() => addToList('allergies', tempInputs.allergy, 'allergy')}
                                        size="md"
                                    >
                                        <Plus size={18} />
                                    </Button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {(patient.allergies || []).length === 0 ? (
                                        <span className="text-sm text-slate-400 dark:text-slate-500">Nenhuma alergia registrada</span>
                                    ) : (
                                        (patient.allergies || []).map((item, idx) => (
                                            <Badge key={idx} variant="error" size="lg">
                                                <AlertCircle size={14} />
                                                {item}
                                                <button onClick={() => removeFromList('allergies', idx)} className="ml-1 hover:text-white">
                                                    <X size={14} />
                                                </button>
                                            </Badge>
                                        ))
                                    )}
                                </div>
                            </Card>

                            {/* Medicamentos */}
                            <Card hover={false}>
                                <SectionTitle>💊 Medicamentos</SectionTitle>
                                <div className="flex gap-2 mb-4">
                                    <Input
                                        placeholder="Adicionar medicamento..."
                                        value={tempInputs.medication}
                                        onChange={(e) => setTempInputs({ ...tempInputs, medication: e.target.value })}
                                        className="flex-1"
                                        onKeyDown={(e) => e.key === 'Enter' && addToList('medications', tempInputs.medication, 'medication')}
                                    />
                                    <Button
                                        onClick={() => addToList('medications', tempInputs.medication, 'medication')}
                                        size="md"
                                    >
                                        <Plus size={18} />
                                    </Button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {(patient.medications || []).length === 0 ? (
                                        <span className="text-sm text-slate-400 dark:text-slate-500">Nenhum medicamento registrado</span>
                                    ) : (
                                        (patient.medications || []).map((item, idx) => (
                                            <Badge key={idx} variant="primary" size="lg">
                                                <Pill size={14} />
                                                {item}
                                                <button onClick={() => removeFromList('medications', idx)} className="ml-1 hover:text-white">
                                                    <X size={14} />
                                                </button>
                                            </Badge>
                                        ))
                                    )}
                                </div>
                            </Card>
                        </div>
                    )}

                    {/* PREFERÊNCIAS */}
                    {activeTab === 'preferences' && (
                        <div className="space-y-5">
                            {/* Interesses */}
                            <Card hover={false}>
                                <SectionTitle>⭐ Interesses</SectionTitle>
                                <div className="flex gap-2 mb-4">
                                    <Input
                                        placeholder="Adicionar interesse..."
                                        value={tempInputs.interest}
                                        onChange={(e) => setTempInputs({ ...tempInputs, interest: e.target.value })}
                                        className="flex-1"
                                        onKeyDown={(e) => e.key === 'Enter' && addToList('interests', tempInputs.interest, 'interest')}
                                    />
                                    <Button
                                        onClick={() => addToList('interests', tempInputs.interest, 'interest')}
                                        size="md"
                                    >
                                        <Plus size={18} />
                                    </Button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {(patient.interests || []).map((item, idx) => (
                                        <Badge key={idx} variant="success" size="lg">
                                            <Star size={14} />
                                            {item}
                                            <button onClick={() => removeFromList('interests', idx)} className="ml-1 hover:text-white">
                                                <X size={14} />
                                            </button>
                                        </Badge>
                                    ))}
                                </div>
                            </Card>

                            {/* Pontos Fortes */}
                            <Card hover={false}>
                                <SectionTitle>💪 Pontos Fortes</SectionTitle>
                                <div className="flex gap-2 mb-4">
                                    <Input
                                        placeholder="Adicionar ponto forte..."
                                        value={tempInputs.strength}
                                        onChange={(e) => setTempInputs({ ...tempInputs, strength: e.target.value })}
                                        className="flex-1"
                                        onKeyDown={(e) => e.key === 'Enter' && addToList('strengths', tempInputs.strength, 'strength')}
                                    />
                                    <Button
                                        onClick={() => addToList('strengths', tempInputs.strength, 'strength')}
                                        size="md"
                                    >
                                        <Plus size={18} />
                                    </Button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {(patient.strengths || []).map((item, idx) => (
                                        <Badge key={idx} variant="purple" size="lg">
                                            {item}
                                            <button onClick={() => removeFromList('strengths', idx)} className="ml-1 hover:text-white">
                                                <X size={14} />
                                            </button>
                                        </Badge>
                                    ))}
                                </div>
                            </Card>

                            {/* Desafios */}
                            <Card hover={false}>
                                <SectionTitle>🎯 Desafios</SectionTitle>
                                <div className="flex gap-2 mb-4">
                                    <Input
                                        placeholder="Adicionar desafio..."
                                        value={tempInputs.challenge}
                                        onChange={(e) => setTempInputs({ ...tempInputs, challenge: e.target.value })}
                                        className="flex-1"
                                        onKeyDown={(e) => e.key === 'Enter' && addToList('challenges', tempInputs.challenge, 'challenge')}
                                    />
                                    <Button
                                        onClick={() => addToList('challenges', tempInputs.challenge, 'challenge')}
                                        size="md"
                                    >
                                        <Plus size={18} />
                                    </Button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {(patient.challenges || []).map((item, idx) => (
                                        <Badge key={idx} variant="warning" size="lg">
                                            {item}
                                            <button onClick={() => removeFromList('challenges', idx)} className="ml-1 hover:text-white">
                                                <X size={14} />
                                            </button>
                                        </Badge>
                                    ))}
                                </div>
                            </Card>
                        </div>
                    )}

                    {/* NOTAS */}
                    {activeTab === 'notes' && (
                        <div className="space-y-5">
                            <Card hover={false}>
                                <Textarea
                                    placeholder="Escreva uma nova observação..."
                                    value={newNote}
                                    onChange={(e) => setNewNote(e.target.value)}
                                    className="mb-4"
                                />
                                <Button
                                    onClick={handleAddNote}
                                    className="w-full"
                                    disabled={!newNote.trim()}
                                >
                                    <Plus size={18} />
                                    Adicionar Nota
                                </Button>
                            </Card>

                            {notes.length === 0 ? (
                                <EmptyState
                                    icon={FileText}
                                    title="Nenhuma nota"
                                    description="Adicione observações importantes sobre o paciente"
                                />
                            ) : (
                                <div className="space-y-3">
                                    {notes.map((note, idx) => (
                                        <Card key={idx} hover={false}>
                                            <p className="text-slate-800 dark:text-white leading-relaxed">{note.content}</p>
                                            <p className="text-xs text-slate-400 dark:text-slate-500 mt-3">
                                                {new Date(note.timestamp).toLocaleDateString('pt-BR', {
                                                    day: '2-digit',
                                                    month: 'short',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </p>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
