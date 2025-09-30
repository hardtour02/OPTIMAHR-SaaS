
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Employee, FormFieldOption, CustomFieldDef } from '../types';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import Spinner from '../components/ui/Spinner';

const FormField: React.FC<{ label: string; children: React.ReactNode; }> = ({ label, children }) => (
    <div>
        <label className="block text-sm font-medium text-on-surface-variant mb-1">{label}</label>
        {children}
    </div>
);

const MyProfile: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [employee, setEmployee] = useState<Employee | null>(null);
    const [formData, setFormData] = useState<Partial<Employee>>({});
    const [fieldOptions, setFieldOptions] = useState<FormFieldOption[]>([]);
    const [customFields, setCustomFields] = useState<CustomFieldDef[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            if (!user) {
                navigate('/login');
                return;
            }
            try {
                const [empData, optionsData, customFieldsData] = await Promise.all([
                    api.getEmployeeByEmail(user.email),
                    api.getFormFieldOptions(),
                    api.getCustomFields(),
                ]);

                if (!empData) {
                    setError('No se pudo encontrar el perfil de empleado asociado a este usuario.');
                    return;
                }
                setEmployee(empData);
                setFormData(empData);
                setFieldOptions(optionsData);
                setCustomFields(customFieldsData);
            } catch (err) {
                setError('No se pudieron cargar los datos de tu perfil.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user, navigate]);
    
    const options = useMemo(() => ({
        genders: fieldOptions.filter(o => o.fieldType === 'gender'),
        civilStatuses: fieldOptions.filter(o => o.fieldType === 'civilStatus'),
        countries: fieldOptions.filter(o => o.fieldType === 'country'),
        states: fieldOptions.filter(o => o.fieldType === 'state'),
        parishes: fieldOptions.filter(o => o.fieldType === 'parish'),
    }), [fieldOptions]);


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleEmergencyContactChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, emergencyContact: { ...prev.emergencyContact, [name]: value } }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!employee) return;
        setIsSubmitting(true);
        setError('');
        setSuccessMessage('');
        try {
            const response = await api.requestProfileUpdate(employee.id, formData, employee.email);
            if (response.success) {
                setSuccessMessage('Tu solicitud de cambio ha sido enviada para aprobación.');
            } else {
                 setError((response as any).message || 'No se detectaron cambios para enviar.');
            }
        } catch (err) {
            setError('Error al enviar la solicitud. Intenta de nuevo.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderCustomFields = (section: 'personal' | 'professional' | 'contact') => {
        return customFields.filter(f => f.section === section).map(field => {
            const customFieldOptions = field.type === 'select' ? fieldOptions.filter(o => o.fieldType === field.label) : [];
            return (
                 <FormField key={field.id} label={field.label}>
                    {field.type === 'text' ? (
                        <input type="text" name={field.label} value={(formData as any)[field.label] || ''} onChange={handleChange} className="w-full bg-background border border-neutral-border rounded-md p-2" />
                    ) : (
                        <select name={field.label} value={(formData as any)[field.label] || ''} onChange={handleChange} className="w-full bg-background border border-neutral-border rounded-md p-2">
                            <option value="">Seleccione...</option>
                            {customFieldOptions.map(opt => <option key={opt.id} value={opt.value}>{opt.value}</option>)}
                        </select>
                    )}
                </FormField>
            )
        })
    };
    
    if (loading) return <div className="h-full flex items-center justify-center"><Spinner /></div>;
    if (error && !employee) return <p className="text-center text-error">{error}</p>;
    if (!employee || !formData) return null;

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-on-surface">Mi Perfil</h1>
                 <button type="submit" disabled={isSubmitting} className="py-2 px-6 rounded-lg bg-primary text-white hover:bg-primary-dark-hover transition-colors font-semibold disabled:opacity-50">
                    {isSubmitting ? 'Enviando...' : 'Guardar y Enviar para Aprobación'}
                </button>
            </div>
            {error && <p className="text-center text-error bg-error/10 p-2 rounded-md">{error}</p>}
            {successMessage && <p className="text-center text-success bg-success/10 p-2 rounded-md">{successMessage}</p>}
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-surface rounded-lg shadow-lg border border-neutral-border p-6 text-center">
                        <img src={employee.photoUrl} alt="Profile" className="w-32 h-32 rounded-full object-cover border-4 border-primary shadow-lg mx-auto"/>
                        <h2 className="text-2xl font-bold text-on-surface mt-4">{employee.firstName} {employee.lastName}</h2>
                        <p className="text-on-surface-variant">{employee.title}</p>
                    </div>
                </div>

                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-surface rounded-lg shadow-lg border border-neutral-border p-6">
                        <h3 className="text-xl font-bold text-on-surface mb-4">Información de Contacto</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField label="Teléfono"><input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full bg-background border border-neutral-border rounded-md p-2"/></FormField>
                            <FormField label="Correo Electrónico"><input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-background border border-neutral-border rounded-md p-2" disabled /></FormField>
                            <FormField label="País"><select name="country" value={formData.country} onChange={handleChange} className="w-full bg-background border border-neutral-border rounded-md p-2"><option value="">Seleccione...</option>{options.countries.map(opt => <option key={opt.id} value={opt.value}>{opt.value}</option>)}</select></FormField>
                            <FormField label="Estado"><select name="state" value={formData.state} onChange={handleChange} className="w-full bg-background border border-neutral-border rounded-md p-2"><option value="">Seleccione...</option>{options.states.map(opt => <option key={opt.id} value={opt.value}>{opt.value}</option>)}</select></FormField>
                            <FormField label="Parroquia"><select name="parish" value={formData.parish} onChange={handleChange} className="w-full bg-background border border-neutral-border rounded-md p-2"><option value="">Seleccione...</option>{options.parishes.map(opt => <option key={opt.id} value={opt.value}>{opt.value}</option>)}</select></FormField>
                             {renderCustomFields('contact')}
                        </div>
                    </div>
                    <div className="bg-surface rounded-lg shadow-lg border border-neutral-border p-6">
                        <h3 className="text-xl font-bold text-on-surface mb-4">Contacto de Emergencia</h3>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField label="Nombre"><input type="text" name="name" value={formData.emergencyContact?.name} onChange={handleEmergencyContactChange} className="w-full bg-background border border-neutral-border rounded-md p-2" /></FormField>
                            <FormField label="Teléfono"><input type="tel" name="phone" value={formData.emergencyContact?.phone} onChange={handleEmergencyContactChange} className="w-full bg-background border border-neutral-border rounded-md p-2" /></FormField>
                         </div>
                    </div>
                     <div className="bg-surface rounded-lg shadow-lg border border-neutral-border p-6">
                        <h3 className="text-xl font-bold text-on-surface mb-4">Información Personal Adicional</h3>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField label="Género"><select name="gender" value={formData.gender} onChange={handleChange} className="w-full bg-background border border-neutral-border rounded-md p-2">{options.genders.map(opt => <option key={opt.id} value={opt.value}>{opt.value}</option>)}</select></FormField>
                            <FormField label="Estado Civil"><select name="civilStatus" value={formData.civilStatus} onChange={handleChange} className="w-full bg-background border border-neutral-border rounded-md p-2">{options.civilStatuses.map(opt => <option key={opt.id} value={opt.value}>{opt.value}</option>)}</select></FormField>
                            {renderCustomFields('personal')}
                         </div>
                    </div>
                </div>
            </div>
        </form>
    );
};

export default MyProfile;
