
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import CompanyManager from '../components/settings/CompanyManager';
import UserManager from '../components/settings/UserManager';
import DashboardConfigManager from '../components/settings/DashboardConfigManager';
import SalaryManager from '../components/settings/SalaryManager';
import LoanSettingsManager from '../components/settings/LoanSettingsManager';
import InventorySettingsManager from '../components/settings/InventorySettingsManager';
import Spinner from '../components/ui/Spinner';
import EmployeeSettingsManager from '../components/settings/EmployeeSettingsManager';
import ReportSettingsManager from '../components/settings/ReportSettingsManager';
import CustomizeManager from '../components/settings/CustomizeManager';
import RolesManager from '../components/settings/RolesManager';
import { Permission } from '../types';
import DocumentSettingsManager from '../components/settings/DocumentSettingsManager';
import AbsenceSettingsManager from '../components/settings/AbsenceSettingsManager';

type SettingsTab = 'employee' | 'companies' | 'users' | 'roles' | 'dashboard' | 'salaries' | 'loans' | 'inventory' | 'reports' | 'customize' | 'documents' | 'absences';

const Settings: React.FC = () => {
    const [activeTab, setActiveTab] = useState<SettingsTab>('employee');
    const { user, hasPermission } = useAuth();
    const navigate = useNavigate();
    
    const canAccessSettings = hasPermission('settings:write') || hasPermission('roles:write') || hasPermission('employees:update');

    useEffect(() => {
        if (user && !canAccessSettings) {
            navigate('/');
        }
    }, [user, canAccessSettings, navigate]);


    const TABS: { id: SettingsTab; label: string, permission?: Permission[] }[] = [
        { id: 'employee', label: 'Empleado', permission: ['settings:write'] },
        { id: 'companies', label: 'Empresas', permission: ['settings:write'] },
        { id: 'users', label: 'Usuarios', permission: ['roles:write'] },
        { id: 'roles', label: 'Roles y Permisos', permission: ['roles:write'] },
        { id: 'documents', label: 'Documentos', permission: ['settings:write'] },
        { id: 'absences', label: 'Ausencias', permission: ['settings:write'] },
        { id: 'dashboard', label: 'Dashboard', permission: ['settings:write'] },
        { id: 'salaries', label: 'Contrato', permission: ['settings:write'] },
        { id: 'inventory', label: 'Inventario', permission: ['settings:write'] },
        { id: 'loans', label: 'Préstamos', permission: ['settings:write'] },
        { id: 'reports', label: 'Reportes', permission: ['settings:write'] },
        { id: 'customize', label: 'Personalización', permission: ['settings:write'] },
    ];
    
    const accessibleTabs = TABS.filter(tab => tab.permission ? tab.permission.some(p => hasPermission(p)) : true);

     useEffect(() => {
        // If the current tab is not in the accessible tabs, switch to the first accessible one
        if (!accessibleTabs.find(t => t.id === activeTab)) {
            setActiveTab(accessibleTabs[0]?.id || 'employee');
        }
    }, [activeTab, accessibleTabs]);


    const renderContent = () => {
        switch (activeTab) {
            case 'employee':
                return <EmployeeSettingsManager />;
            case 'companies':
                return <CompanyManager />;
            case 'users':
                return <UserManager />;
            case 'roles':
                return <RolesManager />;
            case 'documents':
                return <DocumentSettingsManager />;
            case 'absences':
                return <AbsenceSettingsManager />;
            case 'dashboard':
                return <DashboardConfigManager />;
            case 'salaries':
                return <SalaryManager />;
            case 'inventory':
                return <InventorySettingsManager />;
            case 'loans':
                return <LoanSettingsManager />;
            case 'reports':
                return <ReportSettingsManager />;
            case 'customize':
                return <CustomizeManager />;
            default:
                return null;
        }
    };
    
    if (!user || !canAccessSettings) {
        return <div className="h-full flex items-center justify-center"><Spinner /></div>;
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-primary">Configuración</h1>

            <div className="bg-surface rounded-lg shadow-lg border border-neutral-border">
                <div className="border-b border-neutral-border">
                    <nav className="-mb-px flex space-x-6 px-6 overflow-x-auto" aria-label="Tabs">
                        {accessibleTabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`${
                                    activeTab === tab.id
                                        ? 'border-primary text-primary'
                                        : 'border-transparent text-on-surface-variant hover:text-on-surface hover:border-on-surface-variant/70'
                                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors focus:outline-none`}
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

export default Settings;