'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User,
    Camera,
    Calendar,
    Heart,
    Star,
    Edit2,
    Save,
    Plus,
    X,
    Stethoscope,
    Pill,
    AlertCircle,
    Activity,
    FileText,
    Settings,
    ChevronRight,
    Check
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
    Divider,
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
    { id: 'notes', label: 'Observações', icon: FileText },
];

export default function PatientProfile() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
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
        try {
            await savePatient(patient);
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
                // Redimensionar imagem
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
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="w-10 h-10 border-4 border-[var(--primary-500)]/30 border-t-[var(--primary-500)] rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-6">

            {/* Header com Foto */}
            <div className="flex flex-col sm:flex-row items-center gap-6 mb-8">
                {/* Foto */}
                <div className="relative">
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className="w-28 h-28 rounded-full bg-[var(--bg-tertiary)] border-4 border-[var(--bg-card)] shadow-xl overflow-hidden cursor-pointer group"
                    >
                        {patient.photo ? (
                            <img src={patient.photo} alt="Foto" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-[var(--text-muted)]">
                                <User size={40} />
                            </div>
                        )}
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Camera size={24} className="text-white" />
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
                    <h1 className="text-2xl font-bold text-[var(--text-primary)]">
                        {patient.name || 'Nome do Paciente'}
                    </h1>
                    <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-2">
                        {patient.birthDate && (
                            <Badge variant="neutral">
                                <Calendar size={14} />
                                {calculateAge(patient.birthDate)} anos
                            </Badge>
                        )}
                        {patient.diagnosis && (
                            <Badge variant="primary">
                                <Activity size={14} />
                                {patient.diagnosis}
                            </Badge>
                        )}
                    </div>
                </div>

                {/* Salvar */}
                <Button onClick={handleSave} loading={saving}>
                    <Check size={18} />
                    Salvar
                </Button>
            </div>

            {/* Tabs */}
            <TabNav
                tabs={TABS}
                activeTab={activeTab}
                onChange={setActiveTab}
            />

            {/* Conteúdo das Tabs */}
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
                        <Card>
                            <div className="space-y-4">
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
                        <div className="space-y-4">
                            {/* Alergias */}
                            <Card>
                                <SectionTitle>Alergias</SectionTitle>
                                <div className="flex gap-2 mb-3">
                                    <Input
                                        placeholder="Adicionar alergia..."
                                        value={tempInputs.allergy}
                                        onChange={(e) => setTempInputs({ ...tempInputs, allergy: e.target.value })}
                                        className="flex-1"
                                    />
                                    <Button
                                        onClick={() => addToList('allergies', tempInputs.allergy, 'allergy')}
                                        size="sm"
                                    >
                                        <Plus size={18} />
                                    </Button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {(patient.allergies || []).map((item, idx) => (
                                        <Badge key={idx} variant="error">
                                            <AlertCircle size={12} />
                                            {item}
                                            <button onClick={() => removeFromList('allergies', idx)} className="ml-1">
                                                <X size={12} />
                                            </button>
                                        </Badge>
                                    ))}
                                    {(!patient.allergies || patient.allergies.length === 0) && (
                                        <span className="text-sm text-[var(--text-muted)]">Nenhuma alergia registrada</span>
                                    )}
                                </div>
                            </Card>

                            {/* Medicamentos */}
                            <Card>
                                <SectionTitle>Medicamentos</SectionTitle>
                                <div className="flex gap-2 mb-3">
                                    <Input
                                        placeholder="Adicionar medicamento..."
                                        value={tempInputs.medication}
                                        onChange={(e) => setTempInputs({ ...tempInputs, medication: e.target.value })}
                                        className="flex-1"
                                    />
                                    <Button
                                        onClick={() => addToList('medications', tempInputs.medication, 'medication')}
                                        size="sm"
                                    >
                                        <Plus size={18} />
                                    </Button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {(patient.medications || []).map((item, idx) => (
                                        <Badge key={idx} variant="primary">
                                            <Pill size={12} />
                                            {item}
                                            <button onClick={() => removeFromList('medications', idx)} className="ml-1">
                                                <X size={12} />
                                            </button>
                                        </Badge>
                                    ))}
                                    {(!patient.medications || patient.medications.length === 0) && (
                                        <span className="text-sm text-[var(--text-muted)]">Nenhum medicamento registrado</span>
                                    )}
                                </div>
                            </Card>
                        </div>
                    )}

                    {/* PREFERÊNCIAS */}
                    {activeTab === 'preferences' && (
                        <div className="space-y-4">
                            {/* Interesses */}
                            <Card>
                                <SectionTitle>Interesses</SectionTitle>
                                <div className="flex gap-2 mb-3">
                                    <Input
                                        placeholder="Adicionar interesse..."
                                        value={tempInputs.interest}
                                        onChange={(e) => setTempInputs({ ...tempInputs, interest: e.target.value })}
                                        className="flex-1"
                                    />
                                    <Button
                                        onClick={() => addToList('interests', tempInputs.interest, 'interest')}
                                        size="sm"
                                    >
                                        <Plus size={18} />
                                    </Button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {(patient.interests || []).map((item, idx) => (
                                        <Badge key={idx} variant="success">
                                            <Star size={12} />
                                            {item}
                                            <button onClick={() => removeFromList('interests', idx)} className="ml-1">
                                                <X size={12} />
                                            </button>
                                        </Badge>
                                    ))}
                                </div>
                            </Card>

                            {/* Forças */}
                            <Card>
                                <SectionTitle>Pontos Fortes</SectionTitle>
                                <div className="flex gap-2 mb-3">
                                    <Input
                                        placeholder="Adicionar ponto forte..."
                                        value={tempInputs.strength}
                                        onChange={(e) => setTempInputs({ ...tempInputs, strength: e.target.value })}
                                        className="flex-1"
                                    />
                                    <Button
                                        onClick={() => addToList('strengths', tempInputs.strength, 'strength')}
                                        size="sm"
                                    >
                                        <Plus size={18} />
                                    </Button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {(patient.strengths || []).map((item, idx) => (
                                        <Badge key={idx} variant="purple">
                                            {item}
                                            <button onClick={() => removeFromList('strengths', idx)} className="ml-1">
                                                <X size={12} />
                                            </button>
                                        </Badge>
                                    ))}
                                </div>
                            </Card>

                            {/* Desafios */}
                            <Card>
                                <SectionTitle>Desafios</SectionTitle>
                                <div className="flex gap-2 mb-3">
                                    <Input
                                        placeholder="Adicionar desafio..."
                                        value={tempInputs.challenge}
                                        onChange={(e) => setTempInputs({ ...tempInputs, challenge: e.target.value })}
                                        className="flex-1"
                                    />
                                    <Button
                                        onClick={() => addToList('challenges', tempInputs.challenge, 'challenge')}
                                        size="sm"
                                    >
                                        <Plus size={18} />
                                    </Button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {(patient.challenges || []).map((item, idx) => (
                                        <Badge key={idx} variant="warning">
                                            {item}
                                            <button onClick={() => removeFromList('challenges', idx)} className="ml-1">
                                                <X size={12} />
                                            </button>
                                        </Badge>
                                    ))}
                                </div>
                            </Card>
                        </div>
                    )}

                    {/* OBSERVAÇÕES */}
                    {activeTab === 'notes' && (
                        <div className="space-y-4">
                            <Card>
                                <Textarea
                                    placeholder="Adicionar nova observação..."
                                    value={newNote}
                                    onChange={(e) => setNewNote(e.target.value)}
                                />
                                <Button
                                    onClick={handleAddNote}
                                    className="w-full mt-3"
                                    disabled={!newNote.trim()}
                                >
                                    <Plus size={18} />
                                    Adicionar Nota
                                </Button>
                            </Card>

                            {notes.length === 0 ? (
                                <EmptyState
                                    icon={FileText}
                                    title="Nenhuma observação"
                                    description="Adicione observações importantes sobre o paciente"
                                />
                            ) : (
                                <div className="space-y-3">
                                    {notes.map((note, idx) => (
                                        <Card key={idx} hover={false}>
                                            <p className="text-[var(--text-primary)]">{note.content}</p>
                                            <p className="text-xs text-[var(--text-muted)] mt-2">
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
