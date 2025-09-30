import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../services/api';
import { LeavePolicy } from '../../types';
import Spinner from '../ui/Spinner';
import ConfirmationModal from '../ui/ConfirmationModal';

const LeavePolicyManager: React.FC = () => {
    const [policies, setPolicies] = useState<LeavePolicy[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPolicy, setEditingPolicy] = useState<LeavePolicy | null>(null);
    const [policyToDelete, setPolicyToDelete] = useState<LeavePolicy | null>(null);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const data = await api.getLeavePolicies();
            setPolicies(data);
        } catch (err) {
            setError('No se pudieron cargar las políticas de ausencia.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleSave = async (policyData: Omit<LeavePolicy, 'id'> | LeavePolicy) => {
        try {
            setError('');
            if ('id' in policyData) {
                await api.updateLeavePolicy(policyData);
            } else {
                await api.addLeavePolicy(policyData);
            }
            fetchData();
        } catch (err) {
            setError('Error al guardar la política.');
        } finally {
            setIsModalOpen(false);
        }
    };

    const handleDelete = async () => {
        if (policyToDelete) {
            try {
                setError('');
                await api.deleteLeavePolicy(policyToDelete.id);
                fetchData();
            } catch (err) {
                setError('Error al eliminar la política.');
            } finally {
                setPolicyToDelete(null);
            }
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-on-surface">Políticas de Ausencia</h2>
                <button onClick={() => { setEditingPolicy(null); setIsModalOpen(true); }} className="bg-primary text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-primary/80">
                    + Añadir Política
                </button>
            </div>
            {error && <p className="text-red-400 text-center">{error}</p>}
            {loading ? <div className="h-64"><Spinner /></div> : (
                <div className="bg-slate-800/50 rounded-lg border border-slate-700 overflow-hidden">
                    <table className="w-full text-sm text-left text-on-surface-variant">
                        <thead className="text-xs text-on-surface uppercase bg-slate-700/50">
                            <tr>
                                <th scope="col" className="px-6 py-3">Nombre de la Política</th>
                                <th scope="col" className="px-6 py-3">Días por Año</th>
                                <th scope="col" className="px-6 py-3">Permite Saldo Negativo</th>
                                <th scope="col" className="px-6 py-3 text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {policies.map(policy => (
                                <tr key={policy.id} className="bg-surface border-b border-slate-700 hover:bg-slate-800">
                                    <td className="px-6 py-4 font-medium text-on-surface">{policy.name}</td>
                                    <td className="px-6 py-4">{policy.daysPerYear}</td>
                                    <td className="px-6 py-4">{policy.allowNegativeBalance ? 'Sí' : 'No'}</td>
                                    <td className="px-6 py-4 text-center space-x-2">
                                        <button onClick={() => { setEditingPolicy(policy); setIsModalOpen(true); }} className="p-1.5 text-yellow-400 hover:bg-slate-700 rounded-md"><PencilIcon /></button>
                                        <button onClick={() => setPolicyToDelete(policy)} className="p-1.5 text-red-400 hover:bg-slate-700 rounded-md"><TrashIcon /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            {isModalOpen && <PolicyModal onClose={() => setIsModalOpen(false)} onSave={handleSave} policy={editingPolicy} />}
            {policyToDelete && (
                <ConfirmationModal
                    isOpen={!!policyToDelete}
                    onClose={() => setPolicyToDelete(null)}
                    onConfirm={handleDelete}
                    title="Confirmar Eliminación"
                    message={`¿Estás seguro de que deseas eliminar la política "${policyToDelete.name}"?`}
                />
            )}
        </div>
    );
};

interface PolicyModalProps {
    onClose: () => void;
    onSave: (policyData: Omit<LeavePolicy, 'id'> | LeavePolicy) => void;
    policy: LeavePolicy | null;
}
const PolicyModal: React.FC<PolicyModalProps> = ({ onClose, onSave, policy }) => {
    const [formData, setFormData] = useState({
        name: policy?.name || '',
        daysPerYear: policy?.daysPerYear || 1,
        allowNegativeBalance: policy?.allowNegativeBalance || false,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData({ ...formData, [name]: type === 'checkbox' ? checked : (type === 'number' ? parseInt(value) : value) });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(policy ? { ...formData, id: policy.id } : formData);
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4">
            <div className="bg-surface rounded-lg shadow-xl w-full max-w-lg border border-slate-700">
                <form onSubmit={handleSubmit}>
                    <div className="p-6">
                        <h3 className="text-lg font-bold text-on-surface mb-4">{policy ? 'Editar' : 'Añadir'} Política de Ausencia</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-on-surface-variant mb-1">Nombre de la Política</label>
                                <input name="name" value={formData.name} onChange={handleChange} required className="w-full bg-slate-700 rounded-md p-2" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-on-surface-variant mb-1">Días por Año</label>
                                <input type="number" name="daysPerYear" min="0" value={formData.daysPerYear} onChange={handleChange} required className="w-full bg-slate-700 rounded-md p-2" />
                            </div>
                            <div className="flex items-center gap-2">
                                <input type="checkbox" name="allowNegativeBalance" checked={formData.allowNegativeBalance} onChange={handleChange} className="h-4 w-4 rounded bg-slate-700 text-primary focus:ring-primary" />
                                <label className="text-sm font-medium text-on-surface-variant">Permitir saldo negativo</label>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end items-center p-4 border-t border-slate-700 space-x-4">
                        <button type="button" onClick={onClose} className="py-2 px-4 rounded-lg bg-slate-600 hover:bg-slate-500">Cancelar</button>
                        <button type="submit" className="py-2 px-4 rounded-lg bg-primary hover:bg-primary/80 font-semibold">Guardar</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const PencilIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" /></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;

export default LeavePolicyManager;
