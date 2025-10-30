import React, { useState } from 'react';
import CustomFieldsManager from './CustomFieldsManager';
import ContractSettingsManager from './ContractSettingsManager';
import PendingChangesManager from './PendingChangesManager';
import ChecklistSettingsManager from './ChecklistSettingsManager';

type SubTab = 'fields' | 'contracts' | 'pendingChanges' | 'checklists';

const EmployeeSettingsManager: React.FC = () => {
    const [activeSubTab, setActiveSubTab] = useState<SubTab>('fields');

    const TABS: { id: SubTab, label: string }[] = [
        { id: 'fields', label: 'Campos Personalizados' },
        { id: 'contracts', label: 'Tipos de Contrato' },
        { id: 'pendingChanges', label: 'Cambios Pendientes' },
        { id: 'checklists', label: 'Checklists' },
    ];

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
            </div>
            <div className="pt-4">
                {activeSubTab === 'fields' && <CustomFieldsManager />}
                {activeSubTab === 'contracts' && <ContractSettingsManager />}
                {activeSubTab === 'pendingChanges' && <PendingChangesManager />}
                {activeSubTab === 'checklists' && <ChecklistSettingsManager />}
            </div>
        </div>
    );
};

export default EmployeeSettingsManager;