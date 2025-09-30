import React, { useState } from 'react';
// FIX: Changed to a named import as the module does not have a default export.
import { DashboardView } from '../components/dashboards/DashboardView';

type DashboardType = 'employees' | 'loans' | 'inventory' | 'absences';
type InventorySubView = 'items' | 'accessories';


const Dashboard: React.FC = () => {
    const [activeDashboard, setActiveDashboard] = useState<DashboardType>('employees');
    const [inventorySubView, setInventorySubView] = useState<InventorySubView>('items');

    const TABS: { id: DashboardType; label: string }[] = [
        { id: 'employees', label: 'Dashboard de Empleados' },
        { id: 'loans', label: 'Dashboard de Préstamos' },
        { id: 'inventory', label: 'Dashboard de Inventario' },
        { id: 'absences', label: 'Dashboard de Ausencias' },
    ];

    return (
        <div className="space-y-6">
            <div className="bg-surface rounded-lg shadow-lg border border-neutral-border">
                <div className="border-b border-neutral-border">
                    <nav className="-mb-px flex space-x-6 px-6" aria-label="Tabs">
                        {TABS.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveDashboard(tab.id)}
                                className={`${
                                    activeDashboard === tab.id
                                        ? 'border-primary text-primary'
                                        : 'border-transparent text-on-surface-variant hover:text-on-surface hover:border-on-surface-variant/70'
                                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>
                 {activeDashboard === 'inventory' && (
                    <div className="p-4 border-b border-neutral-border">
                        <nav className="flex space-x-4" aria-label="Inventory Sub-Tabs">
                            <button
                                onClick={() => setInventorySubView('items')}
                                className={`${inventorySubView === 'items' ? 'bg-primary/20 text-primary' : 'text-on-surface-variant hover:bg-primary-light-hover'} py-2 px-3 rounded-md font-medium text-sm transition-colors`}
                            >
                                Ítems
                            </button>
                            <button
                                onClick={() => setInventorySubView('accessories')}
                                className={`${inventorySubView === 'accessories' ? 'bg-primary/20 text-primary' : 'text-on-surface-variant hover:bg-primary-light-hover'} py-2 px-3 rounded-md font-medium text-sm transition-colors`}
                            >
                                Accesorios
                            </button>
                        </nav>
                    </div>
                )}
            </div>
            
            {activeDashboard === 'employees' && <DashboardView key="employees" type="employees" />}
            {activeDashboard === 'loans' && <DashboardView key="loans" type="loans" />}
            {activeDashboard === 'inventory' && inventorySubView === 'items' && <DashboardView key="inventory_items" type="inventory_items" />}
            {activeDashboard === 'inventory' && inventorySubView === 'accessories' && <DashboardView key="inventory_accessories" type="inventory_accessories" />}
            {activeDashboard === 'absences' && <DashboardView key="absences" type="absences" />}

        </div>
    );
};

export default Dashboard;