import React, { useState } from 'react';
import { InventoryItem } from '../../types';

interface StockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (itemId: string, quantityChange: number, notes: string) => void;
  item: InventoryItem;
  type: 'add' | 'subtract';
}

const StockModal: React.FC<StockModalProps> = ({ isOpen, onClose, onSave, item, type }) => {
    const [quantity, setQuantity] = useState(1);
    const [notes, setNotes] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const quantityChange = type === 'add' ? quantity : -quantity;
        if (type === 'subtract' && quantity > item.totalStock) {
            alert('No se puede restar más stock del total existente.');
            return;
        }
        onSave(item.id, quantityChange, notes);
    };

    if (!isOpen) return null;

    return (
         <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4">
            <div className="bg-surface rounded-lg shadow-xl w-full max-w-md border border-neutral-border">
                <form onSubmit={handleSubmit}>
                    <div className="p-6">
                        <h3 className="text-lg font-bold text-on-surface mb-1">
                            {type === 'add' ? 'Añadir' : 'Restar'} Stock para <span className="text-primary">{item.name}</span>
                        </h3>
                        <p className="text-sm text-on-surface-variant mb-4">Stock Total Actual: {item.totalStock}</p>
                        <div className="space-y-4">
                             <div>
                                <label className="block text-sm font-medium text-on-surface-variant mb-1">Cantidad</label>
                                <input type="number" value={quantity} onChange={e => setQuantity(Math.max(1, parseInt(e.target.value, 10)))} required min="1" className="w-full bg-background border border-neutral-border rounded-md p-2 text-on-surface focus:ring-primary focus:border-primary" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-on-surface-variant mb-1">Razón / Nota</label>
                                <input value={notes} onChange={e => setNotes(e.target.value)} required placeholder="Ej: Compra de nuevo lote, ítem dañado..." className="w-full bg-background border border-neutral-border rounded-md p-2 text-on-surface focus:ring-primary focus:border-primary" />
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end items-center p-4 border-t border-neutral-border space-x-4">
                        <button type="button" onClick={onClose} className="py-2 px-4 rounded-lg bg-surface border border-neutral-border hover:bg-primary-light-hover transition-colors">Cancelar</button>
                        <button type="submit" className="py-2 px-4 rounded-lg bg-primary text-white hover:bg-primary-dark-hover transition-colors font-semibold">Confirmar Ajuste</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default StockModal;