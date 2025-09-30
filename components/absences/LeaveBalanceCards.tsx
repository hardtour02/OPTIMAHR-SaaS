
import React from 'react';
import { LeavePolicy, LeaveBalance } from '../../types';

interface LeaveBalanceCardsProps {
    policies: LeavePolicy[];
    balances: LeaveBalance[];
}

const LeaveBalanceCards: React.FC<LeaveBalanceCardsProps> = ({ policies, balances }) => {
    const policyMap = new Map(policies.map(p => [p.id, p.name]));
    
    return (
        <div>
            <h2 className="text-2xl font-bold text-on-surface mb-4">Mis Saldos</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {balances.map(balance => (
                    <div key={balance.policyId} className="bg-surface p-6 rounded-lg shadow-lg border border-neutral-border">
                        <p className="text-sm font-medium text-on-surface-variant">{policyMap.get(balance.policyId) || 'Política desconocida'}</p>
                        <p className="text-3xl font-bold text-on-surface">{balance.balance} <span className="text-xl font-normal">días</span></p>
                    </div>
                ))}
                {balances.length === 0 && <p className="text-on-surface-variant col-span-full">No tienes saldos de ausencia asignados.</p>}
            </div>
        </div>
    );
};

export default LeaveBalanceCards;
