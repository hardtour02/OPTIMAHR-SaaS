import React, { useState, useEffect } from 'react';
import { ChecklistTemplate } from '../../types';

type Task = Omit<ChecklistTemplate['tasks'][0], 'id'> & { id?: string };

interface ChecklistTemplateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (template: Omit<ChecklistTemplate, 'id'> | ChecklistTemplate) => void;
    template: ChecklistTemplate | null;
}

const ChecklistTemplateModal: React.FC<ChecklistTemplateModalProps> = ({ isOpen, onClose, onSave, template }) => {
    const [name, setName] = useState('');
    const [type, setType] = useState<'Onboarding' | 'Offboarding'>('Onboarding');
    const [tasks, setTasks] = useState<Task[]>([]);
    const [newTaskText, setNewTaskText] = useState('');
    const [newTaskResponsible, setNewTaskResponsible] = useState<'Empleado' | 'Gerente' | 'RRHH' | 'TI'>('Empleado');

    useEffect(() => {
        if (template) {
            setName(template.name);
            setType(template.type);
            setTasks(template.tasks);
        } else {
            setName('');
            setType('Onboarding');
            setTasks([]);
        }
    }, [template, isOpen]);

    const handleAddTask = () => {
        if (newTaskText.trim()) {
            setTasks([...tasks, { text: newTaskText.trim(), responsible: newTaskResponsible }]);
            setNewTaskText('');
        }
    };

    const handleRemoveTask = (index: number) => {
        setTasks(tasks.filter((_, i) => i !== index));
    };

    const handleTaskChange = (index: number, field: 'text' | 'responsible', value: string) => {
        const newTasks = [...tasks];
        (newTasks[index] as any)[field] = value;
        setTasks(newTasks);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const templateData = {
            name,
            type,
            tasks: tasks.map(({ id, ...rest }) => ({...rest, id: `task_${Math.random()}`}))
        };
        onSave(template ? { ...templateData, id: template.id } : templateData);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4">
            <div className="bg-surface rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col border border-slate-700">
                <form onSubmit={handleSubmit} className="flex flex-col h-full min-h-0">
                    <div className="p-6 border-b border-slate-700">
                        <h3 className="text-lg font-bold text-on-surface">{template ? 'Editar' : 'Nueva'} Plantilla de Checklist</h3>
                    </div>
                    <div className="p-6 space-y-4 overflow-y-auto flex-grow">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-on-surface-variant mb-1">Nombre de la Plantilla</label>
                                <input value={name} onChange={e => setName(e.target.value)} required className="w-full bg-slate-700 rounded-md p-2" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-on-surface-variant mb-1">Tipo de Checklist</label>
                                <select value={type} onChange={e => setType(e.target.value as any)} className="w-full bg-slate-700 rounded-md p-2">
                                    <option value="Onboarding">Onboarding</option>
                                    <option value="Offboarding">Offboarding</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <h4 className="text-base font-semibold mb-2">Tareas</h4>
                            <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                                {tasks.map((task, index) => (
                                    <div key={index} className="flex items-center gap-2 p-2 bg-slate-800/50 rounded">
                                        <input value={task.text} onChange={e => handleTaskChange(index, 'text', e.target.value)} className="flex-grow bg-slate-700 p-1 rounded" />
                                        <select value={task.responsible} onChange={e => handleTaskChange(index, 'responsible', e.target.value)} className="bg-slate-700 p-1 rounded text-sm">
                                            <option>Empleado</option><option>Gerente</option><option>RRHH</option><option>TI</option>
                                        </select>
                                        <button type="button" onClick={() => handleRemoveTask(index)} className="p-1 text-red-400 hover:bg-slate-700 rounded-full">&times;</button>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-4 flex items-end gap-2 p-2 border-t border-slate-700 pt-4">
                                <div className="flex-grow">
                                    <label className="text-xs text-on-surface-variant">Nueva Tarea</label>
                                    <input value={newTaskText} onChange={e => setNewTaskText(e.target.value)} placeholder="Descripción de la tarea..." className="w-full bg-slate-700 p-2 rounded" />
                                </div>
                                <div>
                                    <label className="text-xs text-on-surface-variant">Responsable</label>
                                    <select value={newTaskResponsible} onChange={e => setNewTaskResponsible(e.target.value as any)} className="bg-slate-700 p-2 rounded text-sm h-10">
                                        <option>Empleado</option><option>Gerente</option><option>RRHH</option><option>TI</option>
                                    </select>
                                </div>
                                <button type="button" onClick={handleAddTask} className="bg-secondary text-white font-semibold py-2 px-3 rounded-lg h-10">+</button>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end items-center p-4 border-t border-slate-700 space-x-4 flex-shrink-0">
                        <button type="button" onClick={onClose} className="py-2 px-4 rounded-lg bg-slate-600 hover:bg-slate-500">Cancelar</button>
                        <button type="submit" className="py-2 px-4 rounded-lg bg-primary hover:bg-primary/80 font-semibold">Guardar Plantilla</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ChecklistTemplateModal;
