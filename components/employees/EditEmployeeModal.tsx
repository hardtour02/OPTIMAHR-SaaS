
import React, { useState, useEffect, useMemo } from 'react';
import { Employee, Document, FormFieldOption, Company, CustomFieldDef } from '../../types';
import { api } from '../../services/api';
import Spinner from '../ui/Spinner';
import DocumentManager from './DocumentManager';

interface EditEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEmployeeUpdated: () => void;
  employee: Employee;
}

const FormField: React.FC<{ label: string; children: React.ReactNode; required?: boolean }> = ({ label, children, required }) => (
    <div>
        <label className="block text-sm font-medium text-on-surface-variant mb-1">
            {label} {required && <span className="text-red-400">*</span>}
        </label>
        {children}
    </div>
);

const EditEmployeeModal: React.FC<EditEmployeeModalProps> = ({ isOpen, onClose, onEmployeeUpdated, employee }) => {
    const [formData, setFormData] = useState<Employee>(employee);
    const [fieldOptions, setFieldOptions] = useState<FormFieldOption[]>([]);
    const [customFields, setCustomFields] = useState<CustomFieldDef[]>([]);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [loading, setLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            setLoading(true);
            Promise.all([
                api.getFormFieldOptions(),
                api.getCompanies(),
                api.getCustomFields(),
            ]).then(([optionsData, companiesData, customFieldsData]) => {
                setFieldOptions(optionsData);
                setCompanies(companiesData);
                setCustomFields(customFieldsData);
            }).catch(() => setError('No se pudieron cargar los datos del formulario.'))
            .finally(() => setLoading(false));

            setFormData(employee);
            setError('');
        }
    }, [isOpen, employee]);
    
    const nationalities = useMemo(() => fieldOptions.filter(o => o.fieldType === 'nationality'), [fieldOptions]);
    const titles = useMemo(() => fieldOptions.filter(o => o.fieldType === 'title'), [fieldOptions]);
    const hierarchies = useMemo(() => fieldOptions.filter(o => o.fieldType === 'hierarchy'), [fieldOptions]);
    const zonasDeTrabajo = useMemo(() => fieldOptions.filter(o => o.fieldType === 'zonaDeTrabajo'), [fieldOptions]);
    const genders = useMemo(() => fieldOptions.filter(o => o.fieldType === 'gender'), [fieldOptions]);
    const civilStatuses = useMemo(() => fieldOptions.filter(o => o.fieldType === 'civilStatus'), [fieldOptions]);
    const bloodTypes = useMemo(() => fieldOptions.filter(o => o.fieldType === 'bloodType'), [fieldOptions]);
    const statuses = useMemo(() => fieldOptions.filter(o => o.fieldType === 'status'), [fieldOptions]);
    const countries = useMemo(() => fieldOptions.filter(o => o.fieldType === 'country'), [fieldOptions]);
    const states = useMemo(() => fieldOptions.filter(o => o.fieldType === 'state'), [fieldOptions]);
    const parishes = useMemo(() => fieldOptions.filter(o => o.fieldType === 'parish'), [fieldOptions]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name === 'salary' ? parseFloat(value) || 0 : value } as Employee));
    };

    const handleEmergencyContactChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            emergencyContact: {
                ...prev.emergencyContact,
                [name]: value,
            },
        }));
    };
    
    const handleDocumentsChange = (newDocuments: Document[]) => {
        setFormData(prev => ({...prev, documents: newDocuments }));
    };

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                setError('La foto no debe exceder los 5MB.');
                return;
            }
            const photoUrl = URL.createObjectURL(file);
            if (formData.photoUrl.startsWith('blob:')) {
                URL.revokeObjectURL(formData.photoUrl);
            }
            setFormData(prev => ({ ...prev, photoUrl }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');
        try {
            await api.updateEmployee(formData);
            onEmployeeUpdated();
        } catch (err) {
            setError('Error al actualizar el empleado. Intente de nuevo.');
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const renderCustomFields = (section: 'personal' | 'professional' | 'contact') => {
        return customFields.filter(f => f.section === section).map(field => {
            const options = field.type === 'select' ? fieldOptions.filter(o => o.fieldType === field.label) : [];
            return (
                <FormField key={field.id} label={field.label}>
                    {field.type === 'text' ? (
                        <input
                            type="text"
                            name={field.label}
                            value={formData[field.label] || ''}
                            onChange={handleChange}
                            className="w-full bg-slate-700 rounded-md p-2"
                        />
                    ) : (
                        <select
                            name={field.label}
                            value={formData[field.label] || ''}
                            onChange={handleChange}
                            className="w-full bg-slate-700 rounded-md p-2"
                        >
                            <option value="">Seleccione...</option>
                            {options.map(opt => <option key={opt.id} value={opt.value}>{opt.value}</option>)}
                        </select>
                    )}
                </FormField>
            );
        });
    };
    
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4" aria-modal="true" role="dialog">
            <div className="bg-surface rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col border border-slate-700">
                <div className="flex justify-between items-center p-4 border-b border-slate-700">
                    <h2 className="text-xl font-bold text-on-surface">Editar Empleado</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-700">&times;</button>
                </div>
                <div className="p-6 overflow-y-auto">
                    {loading ? <Spinner /> : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <fieldset className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <legend className="text-lg font-semibold text-primary mb-2 col-span-full">Información Personal</legend>
                                <div className="md:col-span-2">
                                  <FormField label="Foto de Perfil">
                                    <div className="flex items-center gap-4">
                                      <img src={formData.photoUrl || 'https://picsum.photos/seed/placeholder/200'} alt="Preview" className="w-16 h-16 rounded-full object-cover bg-slate-600" />
                                      <input type="file" name="photo" onChange={handlePhotoChange} accept="image/*" className="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/20 file:text-primary hover:file:bg-primary/30" />
                                    </div>
                                  </FormField>
                                </div>
                                <FormField label="Nombres" required><input type="text" name="firstName" value={formData.firstName} onChange={handleChange} className="w-full bg-slate-700 rounded-md p-2" required /></FormField>
                                <FormField label="Apellidos" required><input type="text" name="lastName" value={formData.lastName} onChange={handleChange} className="w-full bg-slate-700 rounded-md p-2" required /></FormField>
                                <FormField label="Cédula" required><input type="text" name="idNumber" value={formData.idNumber} onChange={handleChange} className="w-full bg-slate-700 rounded-md p-2" required /></FormField>
                                <FormField label="Fecha de Nacimiento" required><input type="date" name="birthDate" value={formData.birthDate} onChange={handleChange} className="w-full bg-slate-700 rounded-md p-2" required /></FormField>
                                <FormField label="Género"><select name="gender" value={formData.gender} onChange={handleChange} className="w-full bg-slate-700 rounded-md p-2">{genders.map(opt => <option key={opt.id} value={opt.value}>{opt.value}</option>)}</select></FormField>
                                <FormField label="Estado Civil"><select name="civilStatus" value={formData.civilStatus} onChange={handleChange} className="w-full bg-slate-700 rounded-md p-2">{civilStatuses.map(opt => <option key={opt.id} value={opt.value}>{opt.value}</option>)}</select></FormField>
                                <FormField label="Nacionalidad"><select name="nationality" value={formData.nationality} onChange={handleChange} className="w-full bg-slate-700 rounded-md p-2"><option value="">Seleccione...</option>{nationalities.map(opt => <option key={opt.id} value={opt.value}>{opt.value}</option>)}</select></FormField>
                                <FormField label="Tipo de Sangre"><select name="bloodType" value={formData.bloodType} onChange={handleChange} className="w-full bg-slate-700 rounded-md p-2">
                                    {bloodTypes.map(type => <option key={type.id} value={type.value}>{type.value}</option>)}
                                </select></FormField>
                                {renderCustomFields('personal')}
                            </fieldset>

                             <fieldset className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <legend className="text-lg font-semibold text-primary mb-2 col-span-full">Información Profesional</legend>
                                <FormField label="Empresa" required><select name="company" value={formData.company} onChange={handleChange} className="w-full bg-slate-700 rounded-md p-2" required><option value="">Seleccione...</option>{companies.map(comp => <option key={comp.id} value={comp.name}>{comp.name}</option>)}</select></FormField>
                                <FormField label="Cargo / Título" required><select name="title" value={formData.title} onChange={handleChange} className="w-full bg-slate-700 rounded-md p-2" required><option value="">Seleccione...</option>{titles.map(opt => <option key={opt.id} value={opt.value}>{opt.value}</option>)}</select></FormField>
                                <FormField label="Jerarquía"><select name="hierarchy" value={formData.hierarchy} onChange={handleChange} className="w-full bg-slate-700 rounded-md p-2"><option value="">Seleccione...</option>{hierarchies.map(opt => <option key={opt.id} value={opt.value}>{opt.value}</option>)}</select></FormField>
                                 <FormField label="Zona de Trabajo">
                                    <select name="zonaDeTrabajo" value={formData.zonaDeTrabajo} onChange={handleChange} className="w-full bg-slate-700 rounded-md p-2">
                                        {zonasDeTrabajo.map(opt => <option key={opt.id} value={opt.value}>{opt.value.replace(/^\w/, c => c.toUpperCase())}</option>)}
                                    </select>
                                </FormField>
                                <FormField label="Salario (USD)"><input type="number" name="salary" value={formData.salary} onChange={handleChange} className="w-full bg-slate-700 rounded-md p-2" /></FormField>
                                <FormField label="Inicio de Contrato" required><input type="date" name="contractStartDate" value={formData.contractStartDate} onChange={handleChange} className="w-full bg-slate-700 rounded-md p-2" required /></FormField>
                                <FormField label="Fin de Contrato"><input type="date" name="contractEndDate" value={formData.contractEndDate} onChange={handleChange} className="w-full bg-slate-700 rounded-md p-2" /></FormField>
                                <FormField label="Estatus"><select name="status" value={formData.status} onChange={handleChange} className="w-full bg-slate-700 rounded-md p-2">{statuses.map(opt => <option key={opt.id} value={opt.value}>{opt.value === 'active' ? 'Activo' : 'Inactivo'}</option>)}</select></FormField>
                                {renderCustomFields('professional')}
                             </fieldset>
                             
                             <fieldset className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <legend className="text-lg font-semibold text-primary mb-2 col-span-full">Información de Contacto</legend>
                                <FormField label="Teléfono" required><input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full bg-slate-700 rounded-md p-2" required /></FormField>
                                <FormField label="Correo Electrónico" required><input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-slate-700 rounded-md p-2" required /></FormField>
                                <FormField label="País"><select name="country" value={formData.country} onChange={handleChange} className="w-full bg-slate-700 rounded-md p-2"><option value="">Seleccione...</option>{countries.map(opt => <option key={opt.id} value={opt.value}>{opt.value}</option>)}</select></FormField>
                                <FormField label="Estado"><select name="state" value={formData.state} onChange={handleChange} className="w-full bg-slate-700 rounded-md p-2"><option value="">Seleccione...</option>{states.map(opt => <option key={opt.id} value={opt.value}>{opt.value}</option>)}</select></FormField>
                                <FormField label="Parroquia"><select name="parish" value={formData.parish} onChange={handleChange} className="w-full bg-slate-700 rounded-md p-2"><option value="">Seleccione...</option>{parishes.map(opt => <option key={opt.id} value={opt.value}>{opt.value}</option>)}</select></FormField>
                                <FormField label="Contacto de Emergencia (Nombre)"><input type="text" name="name" value={formData.emergencyContact.name} onChange={handleEmergencyContactChange} className="w-full bg-slate-700 rounded-md p-2" /></FormField>
                                <FormField label="Contacto de Emergencia (Teléfono)"><input type="tel" name="phone" value={formData.emergencyContact.phone} onChange={handleEmergencyContactChange} className="w-full bg-slate-700 rounded-md p-2" /></FormField>
                                {renderCustomFields('contact')}
                             </fieldset>

                             <fieldset>
                                 <DocumentManager 
                                    documents={formData.documents}
                                    onDocumentsChange={handleDocumentsChange}
                                 />
                             </fieldset>
                        </form>
                    )}
                </div>
                <div className="flex justify-end items-center p-4 border-t border-slate-700 space-x-4">
                     {error && <p className="text-sm text-red-400">{error}</p>}
                    <button type="button" onClick={onClose} className="py-2 px-4 rounded-lg bg-slate-600 hover:bg-slate-500 transition-colors">Cancelar</button>
                    <button onClick={handleSubmit} disabled={isSubmitting} className="py-2 px-4 rounded-lg bg-primary hover:bg-primary/80 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed">
                        {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditEmployeeModal;