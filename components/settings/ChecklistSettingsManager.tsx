import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../services/api';
import { ChecklistTemplate } from '../../types';
import Spinner from '../ui/Spinner';
import ConfirmationModal from '../ui/ConfirmationModal';
import ChecklistTemplateModal from './ChecklistTemplateModal';

const ChecklistSettingsManager: React.FC = () => {
    const [templates, setTemplates] = useState<ChecklistTemplate[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<ChecklistTemplate | null>(null);
    const [templateToDelete, setTemplateToDelete] = useState<ChecklistTemplate | null>(null);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const data = await api.getChecklistTemplates();
            setTemplates(data);
        } catch (err) {
            setError('No se pudieron cargar las plantillas.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleSave = async (templateData: Omit<ChecklistTemplate, 'id'> | ChecklistTemplate) => {
        try {
            setError('');
            if ('id' in templateData) {
                await api.updateChecklistTemplate(templateData);
            } else {
                await api.addChecklistTemplate(templateData);
            }
            fetchData();
        } catch (err) {
            setError('Error al guardar la plantilla.');
        } finally {
            setIsModalOpen(false);
        }
    };

    const handleDelete = async () => {
        if (templateToDelete) {
            try {
                setError('');
                await api.deleteChecklistTemplate(templateToDelete.id);
                fetchData();
            } catch (err) {
                setError('Error al eliminar la plantilla.');
            } finally {
                setTemplateToDelete(null);
            }
        }
    };

    if (loading) return <div className="h-64"><Spinner /></div>;

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-on-surface">Plantillas de Checklist</h2>
                <button onClick={() => { setEditingTemplate(null); setIsModalOpen(true); }} className="bg-primary text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-primary/80">
                    + Añadir Plantilla
                </button>
            </div>
            {error && <p className="text-red-400 text-center">{error}</p>}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {templates.map(template => (
                    <div key={template.id} className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="font-bold text-on-surface">{template.name}</h3>
                                <p className={`text-xs font-semibold px-2 py-0.5 rounded-full inline-block mt-1 ${template.type === 'Onboarding' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>{template.type}</p>
                            </div>
                            <div className="flex-shrink-0 space-x-2">
                                <button onClick={() => { setEditingTemplate(template); setIsModalOpen(true); }} className="p-1.5 text-yellow-400 hover:bg-slate-700 rounded-md"><PencilIcon /></button>
                                <button onClick={() => setTemplateToDelete(template)} className="p-1.5 text-red-400 hover:bg-slate-700 rounded-md"><TrashIcon /></button>
                            </div>
                        </div>
                        <ul className="mt-3 text-sm text-on-surface-variant list-disc list-inside space-y-1">
                            {template.tasks.slice(0, 3).map(task => (
                                <li key={task.id}>{task.text}</li>
                            ))}
                            {template.tasks.length > 3 && <li>...y {template.tasks.length - 3} más.</li>}
                        </ul>
                    </div>
                ))}
            </div>
            {templates.length === 0 && <p className="text-center text-on-surface-variant py-8">No hay plantillas creadas.</p>}

            {isModalOpen && <ChecklistTemplateModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSave} template={editingTemplate} />}
            {templateToDelete && (
                <ConfirmationModal
                    isOpen={!!templateToDelete}
                    onClose={() => setTemplateToDelete(null)}
                    onConfirm={handleDelete}
                    title="Confirmar Eliminación"
                    message={`¿Estás seguro de que deseas eliminar la plantilla "${templateToDelete.name}"?`}
                />
            )}
        </div>
    );
};

const PencilIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" /></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;

export default ChecklistSettingsManager;
