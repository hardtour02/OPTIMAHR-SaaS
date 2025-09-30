
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { Employee, Document, FormFieldOption, Company, CustomFieldDef, ContractType } from '../types';
import { api } from '../services/api';
import Spinner from '../components/ui/Spinner';
import DocumentManager from '../components/employees/DocumentManager';

type Tab = 'personal' | 'professional' | 'contact' | 'documents';

const FormField: React.FC<{ label: string; children: React.ReactNode; required?: boolean }> = ({ label, children, required }) => (
    <div>
        <label className="block text-sm font-medium text-on-surface-variant mb-1">
            {label} {required && <span className="text-error">*</span>}
        </label>
        {children}
    </div>
);

const EditEmployee: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [formData, setFormData] = useState<Employee | null>(null);
    const [fieldOptions, setFieldOptions] = useState<FormFieldOption[]>([]);
    const [customFields, setCustomFields] = useState<CustomFieldDef[]>([]);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [contractTypes, setContractTypes] = useState<ContractType[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState<Tab>('personal');

    useEffect(() => {
        const fetchData = async () => {
            if (!id) {
                setError('No se especificó un ID de empleado.');
                setLoading(false);
                return;
            }
            try {
                const [employeeData, optionsData, companiesData, customFieldsData, contractsData] = await Promise.all([
                    api.getEmployeeById(id),
                    api.getFormFieldOptions(),
                    api.getCompanies(),
                    api.getCustomFields(),
                    api.getContractTypes(),
                ]);
                
                if (!employeeData) {
                    setError('Empleado no encontrado.');
                    return;
                }

                setFormData(employeeData);
                setFieldOptions(optionsData);
                setCompanies(companiesData);
                setCustomFields(customFieldsData);
                setContractTypes(contractsData.filter(c => c.isActive || c.id === employeeData.contractTypeId));

            } catch (err) {
                setError('No se pudieron cargar los datos del formulario.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const options = useMemo(() => ({
        nationalities: fieldOptions.filter(o => o.fieldType === 'nationality'),
        titles: fieldOptions.filter(o => o.fieldType === 'title'),
        hierarchies: fieldOptions.filter(o => o.fieldType === 'hierarchy'),
        zonasDeTrabajo: fieldOptions.filter(o => o.fieldType === 'zonaDeTrabajo'),
        genders: fieldOptions.filter(o => o.fieldType === 'gender'),
        civilStatuses: fieldOptions.filter(o => o.fieldType === 'civilStatus'),
        bloodTypes: fieldOptions.filter(o => o.fieldType === 'bloodType'),
        licenciasDeConducir: fieldOptions.filter(o => o.fieldType === 'licenciaDeConducir'),
        statuses: fieldOptions.filter(o => o.fieldType === 'status'),
        countries: fieldOptions.filter(o => o.fieldType === 'country'),
        states: fieldOptions.filter(o => o.fieldType === 'state'),
        parishes: fieldOptions.filter(o => o.fieldType === 'parish'),
    }), [fieldOptions]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        const isSalaryField = ['minSalary', 'currentSalary', 'maxSalary'].includes(name);
        setFormData(prev => prev ? ({ 
            ...prev, 
            [name]: isSalaryField ? parseFloat(value) || 0 : value 
        }) : null);
    };

    const handleEmergencyContactChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => prev ? ({ ...prev, emergencyContact: { ...prev.emergencyContact, [name]: value } }) : null);
    };

    const handleDocumentsChange = (newDocuments: Document[]) => {
        setFormData(prev => prev ? ({...prev, documents: newDocuments }) : null);
    };
    
    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!formData) return;
        const file = e.target.files?.[0];
        if (file) {
            const photoUrl = URL.createObjectURL(file);
             if (formData.photoUrl.startsWith('blob:')) URL.revokeObjectURL(formData.photoUrl);
            setFormData(prev => prev ? ({ ...prev, photoUrl }) : null);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData) return;
        setIsSubmitting(true);
        setError('');
        try {
            await api.updateEmployee(formData);
            navigate('/employees');
        } catch (err) {
            setError('Error al actualizar el empleado. Intente de nuevo.');
            setIsSubmitting(false);
        }
    };

    const renderCustomFields = (section: 'personal' | 'professional' | 'contact') => {
        if (!formData) return null;
        return customFields.filter(f => f.section === section).map(field => {
            const customFieldOptions = field.type === 'select' ? fieldOptions.filter(o => o.fieldType === field.label) : [];
            return (
                 <FormField key={field.id} label={field.label}>
                    {field.type === 'text' ? (
                        <input type="text" name={field.label} value={formData[field.label] || ''} onChange={handleChange} className="w-full bg-background border border-neutral-border text-on-surface focus:ring-primary focus:border-primary rounded-md p-2" />
                    ) : (
                        <select name={field.label} value={formData[field.label] || ''} onChange={handleChange} className="w-full bg-background border border-neutral-border text-on-surface focus:ring-primary focus:border-primary rounded-md p-2">
                            <option value="">Seleccione...</option>
                            {customFieldOptions.map(opt => <option key={opt.id} value={opt.value}>{opt.value}</option>)}
                        </select>
                    )}
                </FormField>
            )
        })
    };

    const TABS: { id: Tab, label: string }[] = [
        { id: 'personal', label: 'Información Personal' },
        { id: 'professional', label: 'Información Profesional' },
        { id: 'contact', label: 'Información de Contacto' },
        { id: 'documents', label: 'Documentos' },
    ];
    
    const renderContent = () => {
         if (!formData) return null;
         switch (activeTab) {
            case 'personal':
                return <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                         <FormField label="Foto de Perfil"><div className="flex items-center gap-4"><img src={formData.photoUrl || 'https://picsum.photos/seed/placeholder/200'} alt="Preview" className="w-16 h-16 rounded-full object-cover bg-background" /><input type="file" name="photo" onChange={handlePhotoChange} accept="image/*" className="w-full text-sm text-on-surface-variant file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/20 file:text-primary hover:file:bg-primary/30" /></div></FormField>
                    </div>
                    <FormField label="Nombres" required><input type="text" name="firstName" value={formData.firstName} onChange={handleChange} className="w-full bg-background border border-neutral-border text-on-surface focus:ring-primary focus:border-primary rounded-md p-2" required /></FormField>
                    <FormField label="Apellidos" required><input type="text" name="lastName" value={formData.lastName} onChange={handleChange} className="w-full bg-background border border-neutral-border text-on-surface focus:ring-primary focus:border-primary rounded-md p-2" required /></FormField>
                    <FormField label="Cédula" required><input type="text" name="idNumber" value={formData.idNumber} onChange={handleChange} className="w-full bg-background border border-neutral-border text-on-surface focus:ring-primary focus:border-primary rounded-md p-2" required /></FormField>
                    <FormField label="Fecha de Nacimiento" required><input type="date" name="birthDate" value={formData.birthDate} onChange={handleChange} className="w-full bg-background border border-neutral-border text-on-surface focus:ring-primary focus:border-primary rounded-md p-2" required /></FormField>
                    <FormField label="Género"><select name="gender" value={formData.gender} onChange={handleChange} className="w-full bg-background border border-neutral-border text-on-surface focus:ring-primary focus:border-primary rounded-md p-2">{options.genders.map(opt => <option key={opt.id} value={opt.value}>{opt.value}</option>)}</select></FormField>
                    <FormField label="Estado Civil"><select name="civilStatus" value={formData.civilStatus} onChange={handleChange} className="w-full bg-background border border-neutral-border text-on-surface focus:ring-primary focus:border-primary rounded-md p-2">{options.civilStatuses.map(opt => <option key={opt.id} value={opt.value}>{opt.value}</option>)}</select></FormField>
                    <FormField label="Nacionalidad"><select name="nationality" value={formData.nationality} onChange={handleChange} className="w-full bg-background border border-neutral-border text-on-surface focus:ring-primary focus:border-primary rounded-md p-2"><option value="">Seleccione...</option>{options.nationalities.map(opt => <option key={opt.id} value={opt.value}>{opt.value}</option>)}</select></FormField>
                    <FormField label="Tipo de Sangre"><select name="bloodType" value={formData.bloodType} onChange={handleChange} className="w-full bg-background border border-neutral-border text-on-surface focus:ring-primary focus:border-primary rounded-md p-2">{options.bloodTypes.map(opt => <option key={opt.id} value={opt.value}>{opt.value}</option>)}</select></FormField>
                    <FormField label="Licencia de Conducir"><select name="licenciaDeConducir" value={formData.licenciaDeConducir} onChange={handleChange} className="w-full bg-background border border-neutral-border text-on-surface focus:ring-primary focus:border-primary rounded-md p-2"><option value="">Seleccione...</option>{options.licenciasDeConducir.map(opt => <option key={opt.id} value={opt.value}>{opt.value}</option>)}</select></FormField>
                    {renderCustomFields('personal')}
                </div>
            case 'professional':
                 return <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField label="Empresa" required><select name="company" value={formData.company} onChange={handleChange} className="w-full bg-background border border-neutral-border text-on-surface focus:ring-primary focus:border-primary rounded-md p-2" required><option value="">Seleccione...</option>{companies.map(comp => <option key={comp.id} value={comp.name}>{comp.name}</option>)}</select></FormField>
                    <FormField label="Cargo / Título" required><select name="title" value={formData.title} onChange={handleChange} className="w-full bg-background border border-neutral-border text-on-surface focus:ring-primary focus:border-primary rounded-md p-2" required><option value="">Seleccione...</option>{options.titles.map(opt => <option key={opt.id} value={opt.value}>{opt.value}</option>)}</select></FormField>
                    <FormField label="Tipo de Contrato"><select name="contractTypeId" value={formData.contractTypeId} onChange={handleChange} className="w-full bg-background border border-neutral-border text-on-surface focus:ring-primary focus:border-primary rounded-md p-2"><option value="">Seleccione...</option>{contractTypes.map(ct => <option key={ct.id} value={ct.id}>{ct.name}</option>)}</select></FormField>
                    <FormField label="Jerarquía"><select name="hierarchy" value={formData.hierarchy} onChange={handleChange} className="w-full bg-background border border-neutral-border text-on-surface focus:ring-primary focus:border-primary rounded-md p-2"><option value="">Seleccione...</option>{options.hierarchies.map(opt => <option key={opt.id} value={opt.value}>{opt.value}</option>)}</select></FormField>
                    <FormField label="Zona de Trabajo"><select name="zonaDeTrabajo" value={formData.zonaDeTrabajo} onChange={handleChange} className="w-full bg-background border border-neutral-border text-on-surface focus:ring-primary focus:border-primary rounded-md p-2">{options.zonasDeTrabajo.map(opt => <option key={opt.id} value={opt.value}>{opt.value.replace(/^\w/, c => c.toUpperCase())}</option>)}</select></FormField>
                    <FormField label="Salario Mínimo"><input type="number" step="0.01" name="minSalary" value={formData.minSalary} onChange={handleChange} className="w-full bg-background border border-neutral-border text-on-surface focus:ring-primary focus:border-primary rounded-md p-2" /></FormField>
                    <FormField label="Salario Actual" required><input type="number" step="0.01" name="currentSalary" value={formData.currentSalary} onChange={handleChange} className="w-full bg-background border border-neutral-border text-on-surface focus:ring-primary focus:border-primary rounded-md p-2" required /></FormField>
                    <FormField label="Salario Máximo"><input type="number" step="0.01" name="maxSalary" value={formData.maxSalary} onChange={handleChange} className="w-full bg-background border border-neutral-border text-on-surface focus:ring-primary focus:border-primary rounded-md p-2" /></FormField>
                    <FormField label="Inicio de Contrato" required><input type="date" name="contractStartDate" value={formData.contractStartDate} onChange={handleChange} className="w-full bg-background border border-neutral-border text-on-surface focus:ring-primary focus:border-primary rounded-md p-2" required /></FormField>
                    <FormField label="Fin de Contrato"><input type="date" name="contractEndDate" value={formData.contractEndDate} onChange={handleChange} className="w-full bg-background border border-neutral-border text-on-surface focus:ring-primary focus:border-primary rounded-md p-2" /></FormField>
                    <FormField label="Estatus"><select name="status" value={formData.status} onChange={handleChange} className="w-full bg-background border border-neutral-border text-on-surface focus:ring-primary focus:border-primary rounded-md p-2">{options.statuses.map(opt => <option key={opt.id} value={opt.value}>{opt.value === 'active' ? 'Activo' : 'Inactivo'}</option>)}</select></FormField>
                    {renderCustomFields('professional')}
                </div>
            case 'contact':
                return <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField label="Teléfono" required><input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full bg-background border border-neutral-border text-on-surface focus:ring-primary focus:border-primary rounded-md p-2" required /></FormField>
                    <FormField label="Correo Electrónico" required><input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-background border border-neutral-border text-on-surface focus:ring-primary focus:border-primary rounded-md p-2" required /></FormField>
                    <FormField label="País"><select name="country" value={formData.country} onChange={handleChange} className="w-full bg-background border border-neutral-border text-on-surface focus:ring-primary focus:border-primary rounded-md p-2"><option value="">Seleccione...</option>{options.countries.map(opt => <option key={opt.id} value={opt.value}>{opt.value}</option>)}</select></FormField>
                    <FormField label="Estado"><select name="state" value={formData.state} onChange={handleChange} className="w-full bg-background border border-neutral-border text-on-surface focus:ring-primary focus:border-primary rounded-md p-2"><option value="">Seleccione...</option>{options.states.map(opt => <option key={opt.id} value={opt.value}>{opt.value}</option>)}</select></FormField>
                    <FormField label="Parroquia"><select name="parish" value={formData.parish} onChange={handleChange} className="w-full bg-background border border-neutral-border text-on-surface focus:ring-primary focus:border-primary rounded-md p-2"><option value="">Seleccione...</option>{options.parishes.map(opt => <option key={opt.id} value={opt.value}>{opt.value}</option>)}</select></FormField>
                    <FormField label="Contacto de Emergencia (Nombre)"><input type="text" name="name" value={formData.emergencyContact.name} onChange={handleEmergencyContactChange} className="w-full bg-background border border-neutral-border text-on-surface focus:ring-primary focus:border-primary rounded-md p-2" /></FormField>
                    <FormField label="Contacto de Emergencia (Teléfono)"><input type="tel" name="phone" value={formData.emergencyContact.phone} onChange={handleEmergencyContactChange} className="w-full bg-background border border-neutral-border text-on-surface focus:ring-primary focus:border-primary rounded-md p-2" /></FormField>
                    {renderCustomFields('contact')}
                </div>
            case 'documents':
                return <DocumentManager documents={formData.documents} onDocumentsChange={handleDocumentsChange} />;
            default: return null;
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex justify-between items-center">
                 <Link to="/employees" className="text-primary hover:underline">&larr; Volver a Empleados</Link>
                <h1 className="text-3xl font-bold text-on-surface">Editar Empleado</h1>
                <div className="space-x-4">
                     <button type="button" onClick={() => navigate('/employees')} className="py-2 px-4 rounded-lg bg-surface border border-neutral-border hover:bg-primary-light-hover transition-colors">Cancelar</button>
                     <button type="submit" disabled={isSubmitting || loading || !formData} className="py-2 px-4 rounded-lg bg-primary hover:bg-primary-dark-hover transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed">
                        {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                </div>
            </div>
            {(error) && <p className="text-center text-error bg-error/10 p-2 rounded-md">{error}</p>}
            
            <div className="bg-surface rounded-lg shadow-lg border border-neutral-border">
                <div className="border-b border-neutral-border">
                     <nav className="-mb-px flex space-x-6 px-6" aria-label="Tabs">
                        {TABS.map(tab => (
                            <button
                                type="button"
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`${ activeTab === tab.id ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface hover:border-neutral-border' } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>
                <div className="p-6">
                    {loading ? <div className="h-64 flex items-center justify-center"><Spinner /></div> : renderContent()}
                </div>
            </div>
        </form>
    );
};

export default EditEmployee;
