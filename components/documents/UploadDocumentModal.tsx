import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Employee, FormFieldOption } from '../../types';

interface UploadDocumentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUploadSuccess: () => void;
}

const UploadDocumentModal: React.FC<UploadDocumentModalProps> = ({ isOpen, onClose, onUploadSuccess }) => {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [docTypes, setDocTypes] = useState<FormFieldOption[]>([]);
    const [selectedEmployee, setSelectedEmployee] = useState('');
    const [selectedDocType, setSelectedDocType] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            const fetchData = async () => {
                const [empData, optionsData] = await Promise.all([
                    api.getEmployees(),
                    api.getFormFieldOptions()
                ]);
                setEmployees(empData);
                const docTypesData = optionsData.filter(o => o.fieldType === 'documentType');
                setDocTypes(docTypesData);
                if (docTypesData.length > 0) {
                    setSelectedDocType(docTypesData[0].value);
                }
            };
            fetchData();
        }
    }, [isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedEmployee || !selectedDocType || !selectedFile) {
            setError('Por favor, complete todos los campos.');
            return;
        }
        setError('');
        setIsSubmitting(true);
        try {
            await api.addDocumentToEmployee(selectedEmployee, selectedFile, selectedDocType);
            onUploadSuccess();
        } catch (err) {
            setError('Error al subir el documento.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4">
            <div className="bg-surface rounded-lg shadow-xl w-full max-w-lg border border-neutral-border">
                <form onSubmit={handleSubmit}>
                    <div className="p-6">
                        <h3 className="text-lg font-bold text-on-surface mb-4">Subir Nuevo Documento</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-on-surface-variant mb-1">Empleado</label>
                                <select value={selectedEmployee} onChange={e => setSelectedEmployee(e.target.value)} required className="w-full bg-background border border-neutral-border rounded-md p-2 text-on-surface focus:ring-primary focus:border-primary">
                                    <option value="" disabled>Seleccione un empleado...</option>
                                    {employees.map(e => <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>)}
                                </select>
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-on-surface-variant mb-1">Tipo de Documento</label>
                                <select value={selectedDocType} onChange={e => setSelectedDocType(e.target.value)} required className="w-full bg-background border border-neutral-border rounded-md p-2 text-on-surface focus:ring-primary focus:border-primary">
                                     {docTypes.map(d => <option key={d.id} value={d.value}>{d.value}</option>)}
                                </select>
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-on-surface-variant mb-1">Archivo</label>
                                <input type="file" onChange={e => setSelectedFile(e.target.files ? e.target.files[0] : null)} required className="w-full text-sm text-on-surface-variant file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/20 file:text-primary hover:file:bg-primary/30"/>
                            </div>
                            {error && <p className="text-sm text-error text-center">{error}</p>}
                        </div>
                    </div>
                    <div className="flex justify-end items-center p-4 border-t border-neutral-border space-x-4">
                        <button type="button" onClick={onClose} className="py-2 px-4 rounded-lg bg-surface border border-neutral-border hover:bg-primary-light-hover transition-colors">Cancelar</button>
                        <button type="submit" disabled={isSubmitting} className="py-2 px-4 rounded-lg bg-primary text-white hover:bg-primary-dark-hover transition-colors font-semibold disabled:opacity-50">
                           {isSubmitting ? 'Subiendo...' : 'Subir'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UploadDocumentModal;