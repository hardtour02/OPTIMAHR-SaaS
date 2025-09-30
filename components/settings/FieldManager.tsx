import React, { useState } from 'react';
import { FormFieldOption } from '../../types';
import ConfirmationModal from '../ui/ConfirmationModal';

interface FieldManagerProps {
    title: string;
    fieldType: FormFieldOption['fieldType'];
    options: FormFieldOption[];
    canWrite: boolean;
    onAdd: (fieldType: FormFieldOption['fieldType'], value: string) => void;
    onUpdate: (option: FormFieldOption) => void;
    onDelete: (optionId: string) => void;
}

const FieldManager: React.FC<FieldManagerProps> = ({ title, fieldType, options, canWrite, onAdd, onUpdate, onDelete }) => {
    const [newValue, setNewValue] = useState('');
    const [editingOption, setEditingOption] = useState<FormFieldOption | null>(null);
    const [editingValue, setEditingValue] = useState('');
    const [optionToDelete, setOptionToDelete] = useState<FormFieldOption | null>(null);

    const handleAddSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newValue.trim()) return;
        onAdd(fieldType, newValue);
        setNewValue('');
    };

    const handleEditStart = (option: FormFieldOption) => {
        setEditingOption(option);
        setEditingValue(option.value);
    };

    const handleEditCancel = () => {
        setEditingOption(null);
        setEditingValue('');
    };

    const handleEditSave = () => {
        if (editingOption && editingValue.trim()) {
            onUpdate({ ...editingOption, value: editingValue });
        }
        handleEditCancel();
    };

    const handleDeleteClick = (option: FormFieldOption) => {
        setOptionToDelete(option);
    };
    
    const handleConfirmDelete = () => {
        if (optionToDelete) {
            onDelete(optionToDelete.id);
            setOptionToDelete(null);
        }
    };


    return (
        <div className="bg-surface p-6 rounded-lg shadow-lg border border-neutral-border">
            <h3 className="text-xl font-semibold mb-4 text-on-surface">{title}</h3>
            {canWrite && (
                <form onSubmit={handleAddSubmit} className="flex gap-2 mb-4">
                    <input
                        type="text"
                        value={newValue}
                        onChange={(e) => setNewValue(e.target.value)}
                        placeholder={`Añadir nueva opción para ${title}`}
                        className="flex-grow bg-background border border-neutral-border rounded-md p-2 text-on-surface focus:ring-primary focus:border-primary"
                    />
                    <button type="submit" className="bg-primary text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-primary-dark-hover transition-colors">
                        Añadir
                    </button>
                </form>
            )}

            <ul className="space-y-2">
                {options.map(option => (
                    <li key={option.id} className="flex items-center justify-between p-2 bg-background rounded-md">
                        {editingOption?.id === option.id ? (
                            <input
                                type="text"
                                value={editingValue}
                                onChange={(e) => setEditingValue(e.target.value)}
                                className="bg-surface border border-neutral-border rounded-md p-1 text-on-surface"
                                autoFocus
                            />
                        ) : (
                            <span className="text-on-surface-variant">{option.value}</span>
                        )}
                         {canWrite && (
                            <div className="flex gap-2">
                                {editingOption?.id === option.id ? (
                                    <>
                                        <button onClick={handleEditSave} className="p-1.5 text-success hover:bg-on-surface-variant/10 rounded-md"><CheckIcon /></button>
                                        <button onClick={handleEditCancel} className="p-1.5 text-error hover:bg-on-surface-variant/10 rounded-md"><XIcon /></button>
                                    </>
                                ) : (
                                    <>
                                        <button onClick={() => handleEditStart(option)} className="p-1.5 text-alert hover:bg-on-surface-variant/10 rounded-md"><PencilIcon /></button>
                                        <button onClick={() => handleDeleteClick(option)} className="p-1.5 text-error hover:bg-on-surface-variant/10 rounded-md"><TrashIcon /></button>
                                    </>
                                )}
                            </div>
                        )}
                    </li>
                ))}
                {options.length === 0 && <p className="text-sm text-center text-on-surface-variant/80 py-4">No hay opciones definidas.</p>}
            </ul>
            {optionToDelete && (
                 <ConfirmationModal
                    isOpen={!!optionToDelete}
                    onClose={() => setOptionToDelete(null)}
                    onConfirm={handleConfirmDelete}
                    title="Confirmar Eliminación"
                    message={`¿Estás seguro de que deseas eliminar la opción "${optionToDelete.value}"?`}
                />
            )}
        </div>
    );
};

// Icons
const PencilIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" /></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;
const CheckIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>;
const XIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>;

export default FieldManager;