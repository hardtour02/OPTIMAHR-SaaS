import React, { useState, useEffect } from 'react';
import { Accessory, InventoryMovementLog } from '../../types';
import { api } from '../../services/api';
import Spinner from '../ui/Spinner';

interface AccessoryMovementsModalProps {
  isOpen: boolean;
  onClose: () => void;
  accessory: Accessory;
}

const AccessoryMovementsModal: React.FC<AccessoryMovementsModalProps> = ({ isOpen, onClose, accessory }) => {
    const [movements, setMovements] = useState<InventoryMovementLog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen) {
            setLoading(true);
            api.getAccessoryMovements(accessory.id)
                .then(setMovements)
                .finally(() => setLoading(false));
        }
    }, [isOpen, accessory.id]);

    if (!isOpen) return null;

    const getActionColor = (action: InventoryMovementLog['action']) => {
        if (action.includes('(+)')) return 'text-success';
        if (action.includes('(-)') || action.includes('Creado') || action.includes('Eliminado')) return 'text-error';
        if (action.includes('Devuelto')) return 'text-info';
        return 'text-on-surface-variant';
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4">
            <div className="bg-surface rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col border border-neutral-border">
                <div className="p-4 border-b border-neutral-border flex justify-between items-center">
                    <h3 className="text-lg font-bold text-on-surface">Historial de Movimientos: <span className="text-primary">{accessory.name}</span></h3>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-on-surface-variant/10 text-2xl leading-none">&times;</button>
                </div>
                <div className="p-4 overflow-y-auto">
                    {loading ? <Spinner /> : (
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-on-surface-variant uppercase">
                                <tr>
                                    <th className="py-2">Fecha</th>
                                    <th className="py-2">Acción</th>
                                    <th className="py-2">Cambio</th>
                                    <th className="py-2">Usuario</th>
                                    <th className="py-2">Notas</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-border">
                                {movements.map(mov => (
                                    <tr key={mov.id}>
                                        <td className="py-2">{new Date(mov.timestamp).toLocaleString()}</td>
                                        <td className={`py-2 font-semibold ${getActionColor(mov.action)}`}>{mov.action}</td>
                                        <td className={`py-2 font-mono ${mov.quantityChange > 0 ? 'text-success' : 'text-error'}`}>
                                            {mov.quantityChange > 0 ? `+${mov.quantityChange}` : mov.quantityChange}
                                        </td>
                                        <td className="py-2">{mov.user}</td>
                                        <td className="py-2 text-xs">{mov.notes}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                    {!loading && movements.length === 0 && <p className="text-center text-on-surface-variant py-8">No hay movimientos registrados para este accesorio.</p>}
                </div>
                 <div className="flex justify-end items-center p-4 border-t border-neutral-border">
                    <button type="button" onClick={onClose} className="py-2 px-4 rounded-lg bg-surface border border-neutral-border hover:bg-primary-light-hover transition-colors">Cerrar</button>
                </div>
            </div>
        </div>
    );
};

export default AccessoryMovementsModal;