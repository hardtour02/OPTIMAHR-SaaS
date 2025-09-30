import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { Employee, Document, CustomFieldDef, SalaryConfig, ContractType, Permission, LeaveBalance, LeavePolicy } from '../types';
import Spinner from '../components/ui/Spinner';
import DocumentManager from '../components/employees/DocumentManager';
import { useAuth } from '../contexts/AuthContext';
import { useFormatting } from '../hooks/useFormatting';
import AbsenceHistory from '../components/employees/AbsenceHistory';
import LeaveBalanceCards from '../components/absences/LeaveBalanceCards';

type Tab = 'personal' | 'professional' | 'contact' | 'documents' | 'absences';

const InfoItem: React.FC<{ label: string; value: string | number | undefined }> = ({ label, value }) => (
    <div className="grid grid-cols-2 py-2">
        <dt className="font-medium text-on-surface-variant">{label}</dt>
        <dd className="text-on-surface">{value || 'N/A'}</dd>
    </div>
);

const EmployeeProfile: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [employee, setEmployee] = useState<Employee | null>(null);
    const [customFields, setCustomFields] = useState<CustomFieldDef[]>([]);
    const [salaryConfig, setSalaryConfig] = useState<SalaryConfig | null>(null);
    const [contractTypes, setContractTypes] = useState<ContractType[]>([]);
    const [leaveBalances, setLeaveBalances] = useState<LeaveBalance[]>([]);
    const [leavePolicies, setLeavePolicies] = useState<LeavePolicy[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<Tab>('personal');
    const { user, hasPermission } = useAuth();
    const { formatDate, formatCurrency } = useFormatting();


    const fetchEmployee = async () => {
        if (id) {
            try {
                setLoading(true);
                const [employeeData, fieldsData, configData, contractsData, balancesData, policiesData] = await Promise.all([
                    api.getEmployeeById(id),
                    api.getCustomFields(),
                    api.getSalaryConfig(),
                    api.getContractTypes(),
                    api.getEmployeeLeaveBalances(id),
                    api.getLeavePolicies()
                ]);
                setEmployee(employeeData || null);
                setCustomFields(fieldsData);
                setSalaryConfig(configData);
                setContractTypes(contractsData);
                setLeaveBalances(balancesData);
                setLeavePolicies(policiesData);
            } catch (error) {
                console.error("Failed to fetch employee data", error);
            } finally {
                setLoading(false);
            }
        }
    };

    useEffect(() => {
        fetchEmployee();
    }, [id]);

    const handleDocumentsChange = async (newDocuments: Document[]) => {
        if (!employee) return;
        const updatedEmployee = { ...employee, documents: newDocuments };
        try {
            await api.updateEmployee(updatedEmployee);
            setEmployee(updatedEmployee);
        } catch (error) {
            console.error("Failed to update documents", error);
        }
    };

    if (loading) {
        return <div className="h-full flex items-center justify-center"><Spinner /></div>;
    }

    if (!employee) {
        return <div className="text-center text-on-surface-variant">Empleado no encontrado.</div>;
    }
    
    const contractTypeName = contractTypes.find(ct => ct.id === employee.contractTypeId)?.name || 'No especificado';

    const TABS: { id: Tab, label: string, permission?: Permission }[] = [
        { id: 'personal', label: 'Información Personal' },
        { id: 'professional', label: 'Información Profesional' },
        { id: 'contact', label: 'Información de Contacto' },
        { id: 'absences', label: 'Historial de Ausencias' },
        { id: 'documents', label: 'Documentos' },
    ];
    
    const accessibleTabs = TABS.filter(tab => tab.permission ? hasPermission(tab.permission) : true);

    const renderCustomFields = (section: 'personal' | 'professional' | 'contact') => {
        const fields = customFields.filter(f => f.section === section);
        if (fields.length === 0) return null;
        
        return (
            <>
                <div className="pt-2 mt-2 border-t border-neutral-border">
                    <h3 className="text-sm font-semibold text-primary mt-2">Información Adicional</h3>
                </div>
                {fields.map(field => (
                    <InfoItem key={field.id} label={field.label} value={employee[field.label]} />
                ))}
            </>
        );
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'personal':
                return (
                    <dl className="divide-y divide-neutral-border">
                        <InfoItem label="Nombre Completo" value={`${employee.firstName} ${employee.lastName}`} />
                        <InfoItem label="Cédula" value={employee.idNumber} />
                        <InfoItem label="Género" value={employee.gender} />
                        <InfoItem label="Estado Civil" value={employee.civilStatus} />
                        <InfoItem label="Fecha de Nacimiento" value={formatDate(employee.birthDate)} />
                        <InfoItem label="Tipo de Sangre" value={employee.bloodType} />
                        <InfoItem label="Nacionalidad" value={employee.nationality} />
                        <InfoItem label="Licencia de Conducir" value={employee.licenciaDeConducir} />
                        {renderCustomFields('personal')}
                    </dl>
                );
            case 'professional':
                 return (
                    <dl className="divide-y divide-neutral-border">
                        <InfoItem label="Compañía" value={employee.company} />
                        <InfoItem label="Jerarquía" value={employee.hierarchy} />
                        <InfoItem label="Título" value={employee.title} />
                        <InfoItem label="Tipo de Contrato" value={contractTypeName} />
                        <InfoItem 
                           label={`Salario Actual`} 
                           value={formatCurrency(employee.currentSalary, salaryConfig?.primaryCurrency)} 
                        />
                        <InfoItem label="Zona de Trabajo" value={employee.zonaDeTrabajo.replace(/^\w/, c => c.toUpperCase())} />
                        <InfoItem label="Inicio de Contrato" value={formatDate(employee.contractStartDate)} />
                        <InfoItem label="Fin de Contrato" value={formatDate(employee.contractEndDate)} />
                        <InfoItem label="Estatus" value={employee.status === 'active' ? 'Activo' : 'Inactivo'} />
                        {renderCustomFields('professional')}
                    </dl>
                );
            case 'contact':
                return (
                    <dl className="divide-y divide-neutral-border">
                        <InfoItem label="Teléfono" value={employee.phone} />
                        <InfoItem label="Correo Electrónico" value={employee.email} />
                        <InfoItem label="País" value={employee.country} />
                        <InfoItem label="Estado" value={employee.state} />
                        <InfoItem label="Parroquia" value={employee.parish} />
                        <InfoItem label="Contacto de Emergencia" value={`${employee.emergencyContact.name} (${employee.emergencyContact.phone})`} />
                        {renderCustomFields('contact')}
                    </dl>
                );
            case 'absences':
                return (
                    <div className="space-y-6">
                        <LeaveBalanceCards policies={leavePolicies} balances={leaveBalances} />
                        <AbsenceHistory employeeId={employee.id} />
                    </div>
                );
            case 'documents':
                 return (
                    <DocumentManager 
                        documents={employee.documents}
                        onDocumentsChange={handleDocumentsChange}
                    />
                 );
            default:
                return null;
        }
    };

    return (
        <div className="space-y-6">
            <Link to="/employees" className="text-primary hover:underline">&larr; Volver a Empleados</Link>
            
            <div className="bg-surface rounded-lg shadow-lg border border-neutral-border p-8 flex flex-col md:flex-row items-center gap-8">
                <img src={employee.photoUrl} alt="Profile" className="w-32 h-32 rounded-full object-cover border-4 border-primary shadow-lg"/>
                <div>
                    <h1 className="text-3xl font-bold text-on-surface">{employee.firstName} {employee.lastName}</h1>
                    <p className="text-on-surface-variant">{employee.title}</p>
                    <p className="text-sm text-on-surface-variant">{employee.company}</p>
                </div>
            </div>

            <div className="bg-surface rounded-lg shadow-lg border border-neutral-border">
                <div className="border-b border-neutral-border">
                    <nav className="-mb-px flex space-x-6 px-6" aria-label="Tabs">
                        {accessibleTabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`${
                                    activeTab === tab.id
                                        ? 'border-primary text-primary'
                                        : 'border-transparent text-on-surface-variant hover:text-on-surface hover:border-on-surface-variant/70'
                                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>
                <div className="p-6">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default EmployeeProfile;