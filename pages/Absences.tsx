
import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { LeavePolicy, LeaveBalance, LeaveRequest } from '../types';
import Spinner from '../components/ui/Spinner';
import LeaveBalanceCards from '../components/absences/LeaveBalanceCards';
import LeaveRequestList from '../components/absences/LeaveRequestList';
import LeaveRequestModal from '../components/absences/LeaveRequestModal';
import ManageAbsencesView from '../components/absences/ManageAbsencesView';

const Absences: React.FC = () => {
    const { user, hasPermission } = useAuth();
    const [policies, setPolicies] = useState<LeavePolicy[]>([]);
    const [balances, setBalances] = useState<LeaveBalance[]>([]);
    const [requests, setRequests] = useState<LeaveRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const isManager = hasPermission('absences:manage');
    const [activeTab, setActiveTab] = useState<'my' | 'manage'>(isManager ? 'manage' : 'my');

    const fetchData = useCallback(async () => {
        if (!user) return;
        try {
            setLoading(true);
            const [policiesData, balancesData, requestsData] = await Promise.all([
                api.getLeavePolicies(),
                api.getEmployeeLeaveBalances(user.id),
                api.getEmployeeLeaveRequests(user.id)
            ]);
            setPolicies(policiesData);
            setBalances(balancesData);
            setRequests(requestsData);
        } catch (error) {
            console.error("Failed to fetch absence data", error);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        // Initial fetch or when user changes
        if (activeTab === 'my') {
            fetchData();
        }
    }, [fetchData, activeTab]);

    const handleRequestSaved = () => {
        setIsModalOpen(false);
        if (activeTab === 'my') {
            fetchData();
        }
    };
    
    const handleRequestCancelled = async (requestId: string) => {
        try {
            await api.cancelLeaveRequest(requestId);
            if (activeTab === 'my') {
                fetchData();
            }
        } catch (error) {
            console.error("Failed to cancel request", error);
        }
    };

    if (loading && activeTab === 'my') {
        return <div className="h-full flex items-center justify-center"><Spinner /></div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-on-surface">{isManager ? 'Gestión de Ausencias' : 'Mis Ausencias'}</h1>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-primary text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-primary-dark-hover transition-colors"
                >
                    + Solicitar Ausencia
                </button>
            </div>

            <LeaveBalanceCards policies={policies} balances={balances} />

            {isManager ? (
                <div className="bg-surface rounded-lg shadow-lg border border-neutral-border">
                    <div className="border-b border-neutral-border">
                        <nav className="-mb-px flex space-x-6 px-6" aria-label="Tabs">
                            <button onClick={() => setActiveTab('manage')} className={`${activeTab === 'manage' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>Gestionar Solicitudes</button>
                            <button onClick={() => setActiveTab('my')} className={`${activeTab === 'my' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>Mis Solicitudes</button>
                        </nav>
                    </div>
                    <div className="p-4">
                        {activeTab === 'my' ? (
                             <LeaveRequestList 
                                requests={requests}
                                policies={policies}
                                onCancel={handleRequestCancelled}
                            />
                        ) : (
                            <ManageAbsencesView policies={policies} />
                        )}
                    </div>
                </div>
            ) : (
                <LeaveRequestList 
                    requests={requests}
                    policies={policies}
                    onCancel={handleRequestCancelled}
                />
            )}


            {isModalOpen && (
                <LeaveRequestModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleRequestSaved}
                    policies={policies}
                    employeeId={user!.id}
                />
            )}
        </div>
    );
};

export default Absences;
