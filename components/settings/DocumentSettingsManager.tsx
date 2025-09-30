import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { FormFieldOption } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import Spinner from '../ui/Spinner';
import FieldManager from './FieldManager';

const DocumentSettingsManager: React.FC = () => {
    const [options, setOptions] = useState<FormFieldOption[]>([]);
    const [loading, setLoading] = useState(true);
    const { hasPermission } = useAuth();
    const canWrite = hasPermission('settings:write');

    const fetchData = async () => {
        setLoading(true);
        try {
            const optionsData = await api.getFormFieldOptions();
            setOptions(optionsData.filter(o => o.fieldType === 'documentType'));
        } catch (error) {
            console.error("Failed to load document types", error);
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
            fetchData();
        } catch (err) {
            console.error("API operation failed", err);
        }
    };

    const handleAddOption = (fieldType: string, value: string) => {
        handleCrudOperation(api.addFormFieldOption({ fieldType, value }));
    };

    const handleUpdateOption = (option: FormFieldOption) => {
        handleCrudOperation(api.updateFormFieldOption(option));
    };

    const handleDeleteOption = (optionId: string) => {
        handleCrudOperation(api.deleteFormFieldOption(optionId));
    };

    if (loading) return <div className="h-40"><Spinner/></div>;

    return (
        <div className="space-y-6">
             <h2 className="text-2xl font-bold text-on-surface">Tipos de Documento</h2>
             <p className="text-on-surface-variant">Gestiona los tipos de documentos que se pueden subir al sistema.</p>
            <FieldManager
                title="Tipos de Documento Oficiales"
                fieldType="documentType"
                options={options}
                canWrite={canWrite}
                onAdd={handleAddOption}
                onUpdate={handleUpdateOption}
                onDelete={handleDeleteOption}
            />
        </div>
    );
};

export default DocumentSettingsManager;
