
import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../services/api';
import { ChecklistTemplate, AssignedChecklist } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import Spinner from '../ui/Spinner';

interface ChecklistManagerProps {
    employeeId: string;
}

const ChecklistManager: React.FC<ChecklistManagerProps> = ({ employeeId }) => {
    const [assignedChecklists, setAssignedChecklists] = useState<AssignedChecklist[]>([]);
    const [templates, setTemplates] = useState<ChecklistTemplate[]>([]);
    const [selectedTemplate, setSelectedTemplate] = useState('');
    const [loading, setLoading] = useState(true);
    const { hasPermission, user } = useAuth();
    const canAssign = hasPermission('checklists:assign');
    const canUpdate = hasPermission('checklists:update_tasks');

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [assignedData, templatesData] = await Promise.all([
                api.getAssignedChecklists(employeeId),
                api.getChecklistTemplates()
            ]);
            setAssignedChecklists(assignedData);
            setTemplates(templatesData);
            if (templatesData.length > 0) {
                setSelectedTemplate(templatesData[0].id);
            }
        } catch (error) {
            console.error("Failed to fetch checklist data", error);
        } finally {
            setLoading(false);
        }
    }, [employeeId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleAssign = async () => {
        if (selectedTemplate) {
            await api.assignChecklistToEmployee(employeeId, selectedTemplate);
            fetchData();
        }
    };
    
    const handleTaskToggle = async (checklistId: string, taskId: string, isCompleted: boolean) => {
        await api.updateTaskStatus(checklistId, taskId, isCompleted);
        fetchData();
    };

    if (loading) return <div className="h-64"><Spinner /></div>;

    return (
        <div className="space-y-6">
            {canAssign && (
                <div className="bg-surface p-4 rounded-lg border border-neutral-border flex flex-col md:flex-row gap-4 items-end">
                    <div className="flex-grow">
                        <label className="block text-sm font-medium text-on-surface-variant mb-1">Asignar Nueva Checklist</label>
                        <select value={selectedTemplate} onChange={e => setSelectedTemplate(e.target.value)} className="w-full bg-background border border-neutral-border rounded-md p-2">
                            {templates.map(t => <option key={t.id} value={t.id}>{t.name} ({t.type})</option>)}
                        </select>
                    </div>
                    <button onClick={handleAssign} className="bg-primary text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-primary-dark-hover h-10 w-full md:w-auto">
                        Asignar
                    </button>
                </div>
            )}

            {assignedChecklists.length > 0 ? (
                <div className="space-y-6">
                    {assignedChecklists.map(checklist => {
                        const totalTasks = checklist.tasks.length;
                        const completedTasks = checklist.tasks.filter(t => t.isCompleted).length;
                        const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

                        return (
                            <div key={checklist.id} className="bg-surface p-4 rounded-lg border border-neutral-border">
                                <h3 className="text-lg font-bold text-on-surface">{checklist.templateName}</h3>
                                <p className="text-sm text-on-surface-variant">Asignado el {new Date(checklist.assignedDate).toLocaleDateString()}</p>
                                
                                <div className="mt-3">
                                    <div className="flex justify-between items-center text-sm mb-1">
                                        <span className="font-semibold">Progreso</span>
                                        <span>{completedTasks} / {totalTasks} Tareas</span>
                                    </div>
                                    <div className="w-full bg-background rounded-full h-2.5">
                                        <div className="bg-secondary h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                                    </div>
                                </div>

                                <ul className="mt-4 space-y-2">
                                    {checklist.tasks.map(task => (
                                        <li key={task.id} className="flex items-center gap-3 p-2 bg-background rounded">
                                            <input 
                                                type="checkbox" 
                                                checked={task.isCompleted}
                                                onChange={(e) => handleTaskToggle(checklist.id, task.id, e.target.checked)}
                                                disabled={!canUpdate}
                                                className="h-5 w-5 rounded bg-background border-neutral-border text-primary focus:ring-primary disabled:cursor-not-allowed" 
                                            />
                                            <span className={`flex-grow ${task.isCompleted ? 'line-through text-on-surface-variant/70' : ''}`}>{task.text}</span>
                                            <span className="text-xs font-semibold px-2 py-1 rounded-full bg-surface text-on-surface-variant">{task.responsible}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <p className="text-center text-on-surface-variant py-8">No hay checklists asignadas a este empleado.</p>
            )}
        </div>
    );
};

export default ChecklistManager;
