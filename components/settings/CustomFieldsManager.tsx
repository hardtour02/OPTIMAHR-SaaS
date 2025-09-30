import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { FormFieldOption, CustomFieldDef } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import Spinner from '../ui/Spinner';
import FieldManager from './FieldManager';
import ConfirmationModal from '../ui/ConfirmationModal';

type SubTab = 'personal' | 'professional' | 'contact';

const CustomFieldsManager: React.FC = () => {
    const [options, setOptions] = useState<FormFieldOption[]>([]);
    const [customFields, setCustomFields] = useState<CustomFieldDef[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeSubTab, setActiveSubTab] = useState<SubTab>('personal');
    const [isAddFieldModalOpen, setIsAddFieldModalOpen] = useState(false);
    const [fieldToDelete, setFieldToDelete] = useState<CustomFieldDef | null>(null);
    
    const { hasPermission } = useAuth();
    const canWrite = hasPermission('settings:write');

    const fetchData = async () => {
        try {
            setLoading(true);
            const [optionsData, fieldsData] = await Promise.all([
                api.getFormFieldOptions(),
                api.getCustomFields(),
            ]);
            setOptions(optionsData);
            setCustomFields(fieldsData);
        } catch (err) {
            setError('Error al cargar la configuración de campos.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleCrudOperation = async (apiCall: Promise<any>) => {
        try {
            await apiCall;
            fetchData(); // Refresh list after any successful operation
        } catch (err) {
            console.error("API operation failed", err);
            setError('La operación falló. Intente de nuevo.');
        }
    };

    const handleAddOption = (fieldType: string, value: string) => {
        if (!value.trim()) return;
        handleCrudOperation(api.addFormFieldOption({ fieldType, value }));
    };

    const handleUpdateOption = (option: FormFieldOption) => {
        if (!option.value.trim()) return;
        handleCrudOperation(api.updateFormFieldOption(option));
    };

    const handleDeleteOption = (optionId: string) => {
        handleCrudOperation(api.deleteFormFieldOption(optionId));
    };

    const handleAddCustomField = (field: Omit<CustomFieldDef, 'id'>) => {
        handleCrudOperation(api.addCustomField(field));
        setIsAddFieldModalOpen(false);
    }
    
    const handleDeleteCustomFieldClick = (field: CustomFieldDef) => {
        setFieldToDelete(field);
    }

    const handleConfirmDeleteCustomField = () => {
        if (fieldToDelete) {
            handleCrudOperation(api.deleteCustomField(fieldToDelete.id));
            setFieldToDelete(null);
        }
    }


    const groupedOptions = options.reduce((acc, option) => {
        (acc[option.fieldType] = acc[option.fieldType] || []).push(option);
        return acc;
    }, {} as Record<string, FormFieldOption[]>);

    const TABS: { id: SubTab, label: string }[] = [
        { id: 'personal', label: 'Información Personal' },
        { id: 'professional', label: 'Información Profesional' },
        { id: 'contact', label: 'Información de Contacto' },
    ];

    const renderFields = (section: SubTab) => {
        const predefinedFieldConfigs: { [key in SubTab]: { key: string, title: string }[] } = {
            personal: [
                { key: "gender", title: "Género" },
                { key: "civilStatus", title: "Estado Civil" },
                { key: "nationality", title: "Nacionalidades" },
                { key: "bloodType", title: "Tipos de Sangre" },
            ],
            professional: [
                 { key: "title", title: "Cargos / Títulos" },
                 { key: "hierarchy", title: "Jerarquías" },
                 { key: "zonaDeTrabajo", title: "Zonas de Trabajo" },
                 { key: "status", title: "Estatus" },
            ],
            contact: [
                 { key: "country", title: "Países" },
                 { key: "state", title: "Estados" },
                 { key: "parish", title: "Parroquias" },
            ],
        };

        const predefinedFields = predefinedFieldConfigs[section].map(config => (
            <FieldManager key={config.key} title={config.title} fieldType={config.key} options={groupedOptions[config.key] || []} canWrite={canWrite} onAdd={handleAddOption} onUpdate={handleUpdateOption} onDelete={handleDeleteOption} />
        ));

        const customFieldsForSection = customFields
            .filter(field => field.section === section)
            .map(field => {
                if (field.type === 'select') {
                    return <FieldManager key={field.id} title={field.label} fieldType={field.label} options={groupedOptions[field.label] || []} canWrite={canWrite} onAdd={handleAddOption} onUpdate={handleUpdateOption} onDelete={handleDeleteOption} />;
                }
                return (
                    <div key={field.id} className="bg-surface p-6 rounded-lg shadow-lg border border-neutral-border">
                         <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-semibold text-on-surface">{field.label}</h3>
                                <p className="text-sm text-on-surface-variant">Campo de texto simple</p>
                            </div>
                            {canWrite && <button onClick={() => handleDeleteCustomFieldClick(field)} className="p-1.5 text-error hover:bg-on-surface-variant/10 rounded-md"><TrashIcon/></button>}
                        </div>
                    </div>
                );
            });

        return [...predefinedFields, ...customFieldsForSection];
    };
    
    const renderContent = () => {
        if (loading) return <div className="h-64 flex items-center justify-center"><Spinner /></div>;
        if (error) return <p className="text-error text-center">{error}</p>;

        return (
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {renderFields(activeSubTab)}
             </div>
        );
    }

    return (
        <div className="space-y-4">
             <div className="flex justify-between items-center border-b border-neutral-border pb-2">
                <nav className="-mb-px flex space-x-6" aria-label="Sub-Tabs">
                    {TABS.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveSubTab(tab.id)}
                            className={`${
                                activeSubTab === tab.id
                                    ? 'border-secondary text-secondary'
                                    : 'border-transparent text-on-surface-variant hover:text-on-surface hover:border-on-surface-variant/70'
                            } whitespace-nowrap pb-2 px-1 border-b-2 font-medium text-sm transition-colors focus:outline-none`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>
                {canWrite && (
                    <button onClick={() => setIsAddFieldModalOpen(true)} className="bg-secondary text-white font-semibold py-1 px-3 rounded-lg shadow-md hover:bg-secondary-dark-hover transition-colors text-sm">
                        + Añadir Campo
                    </button>
                )}
            </div>
            <div className="pt-4">
                {renderContent()}
            </div>
             {isAddFieldModalOpen && <AddCustomFieldModal section={activeSubTab} onSave={handleAddCustomField} onClose={() => setIsAddFieldModalOpen(false)} />}
             {fieldToDelete && (
                 <ConfirmationModal
                    isOpen={!!fieldToDelete}
                    onClose={() => setFieldToDelete(null)}
                    onConfirm={handleConfirmDeleteCustomField}
                    title="Confirmar Eliminación"
                    message={`¿Estás seguro de que deseas eliminar el campo personalizado "${fieldToDelete.label}"? Esto también eliminará todas sus opciones y los datos asociados en los perfiles de los empleados.`}
                />
             )}
        </div>
    );
};

// --- Add Custom Field Modal ---
interface AddCustomFieldModalProps {
    section: 'personal' | 'professional' | 'contact';
    onClose: () => void;
    onSave: (field: Omit<CustomFieldDef, 'id'> & { options?: string[] }) => void;
}
const AddCustomFieldModal: React.FC<AddCustomFieldModalProps> = ({ section, onClose, onSave }) => {
    const [label, setLabel] = useState('');
    const [type, setType] = useState<'text' | 'select'>('text');
    const [options, setOptions] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const fieldData: Omit<CustomFieldDef, 'id'> & { options?: string[] } = {
            label,
            type,
            section,
        };
        if (type === 'select') {
            fieldData.options = options.split(',').map(opt => opt.trim()).filter(Boolean);
        }
        onSave(fieldData);
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4">
            <div className="bg-surface rounded-lg shadow-xl w-full max-w-lg border border-neutral-border">
                <form onSubmit={handleSubmit}>
                    <div className="p-6">
                        <h3 className="text-lg font-bold text-on-surface mb-4">Añadir Campo Personalizado a '{section}'</h3>
                        <div className="space-y-4">
                             <div>
                                <label className="block text-sm font-medium text-on-surface-variant mb-1">Nombre del Campo (Etiqueta)</label>
                                <input value={label} onChange={(e) => setLabel(e.target.value)} required className="w-full bg-background border border-neutral-border rounded-md p-2 text-on-surface focus:ring-primary focus:border-primary" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-on-surface-variant mb-1">Tipo de Campo</label>
                                <select value={type} onChange={(e) => setType(e.target.value as 'text' | 'select')} required className="w-full bg-background border border-neutral-border rounded-md p-2 text-on-surface focus:ring-primary focus:border-primary">
                                    <option value="text">Texto</option>
                                    <option value="select">Con Opciones (Seleccionable)</option>
                                </select>
                            </div>
                            {type === 'select' && (
                                <div>
                                    <label className="block text-sm font-medium text-on-surface-variant mb-1">Opciones (separadas por comas)</label>
                                    <input value={options} onChange={(e) => setOptions(e.target.value)} placeholder="Opción 1, Opción 2, Opción 3" required className="w-full bg-background border border-neutral-border rounded-md p-2 text-on-surface focus:ring-primary focus:border-primary" />
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flex justify-end items-center p-4 border-t border-neutral-border space-x-4">
                        <button type="button" onClick={onClose} className="py-2 px-4 rounded-lg bg-surface border border-neutral-border hover:bg-primary-light-hover transition-colors">Cancelar</button>
                        <button type="submit" className="py-2 px-4 rounded-lg bg-primary text-white hover:bg-primary-dark-hover transition-colors font-semibold">Guardar Campo</button>
                    </div>
                </form>
            </div>
        </div>
    )
}

const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;

export default CustomFieldsManager;