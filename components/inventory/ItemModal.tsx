import React, { useState, useEffect } from 'react';
import { InventoryItem, InventoryCategory, FormFieldOption, Company } from '../../types';

interface ItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<InventoryItem, 'id'> | InventoryItem) => void;
  item: InventoryItem | null;
  categories: InventoryCategory[];
  inventoryUnits: FormFieldOption[];
  companies: Company[];
}

const ItemModal: React.FC<ItemModalProps> = ({ isOpen, onClose, onSave, item, categories, inventoryUnits, companies }) => {
    const [formData, setFormData] = useState({
        categoryId: item?.categoryId || (categories[0]?.id || ''),
        name: item?.name || '',
        identifier: item?.identifier || '',
        company: item?.company || '',
        totalStock: item?.totalStock || 0,
        minStock: item?.minStock || 0,
        status: item?.status || 'Activo' as 'Activo' | 'Inactivo',
        unit: item?.unit || (inventoryUnits[0]?.value || 'Unidad'),
    });

    useEffect(() => {
        if (item) {
            setFormData({
                categoryId: item.categoryId,
                name: item.name,
                identifier: item.identifier,
                company: item.company,
                totalStock: item.totalStock,
                minStock: item.minStock,
                status: item.status,
                unit: item.unit || (inventoryUnits[0]?.value || 'Unidad'),
            });
        } else {
             setFormData({
                categoryId: categories[0]?.id || '',
                name: '',
                identifier: '',
                company: '',
                totalStock: 0,
                minStock: 0,
                status: 'Activo',
                unit: inventoryUnits[0]?.value || 'Unidad',
            });
        }
    }, [item, categories, inventoryUnits, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        const isNumber = ['totalStock', 'minStock'].includes(name);
        setFormData(prev => ({ ...prev, [name]: isNumber ? parseInt(value, 10) || 0 : value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(item ? { ...formData, id: item.id } : formData);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4">
            <div className="bg-surface rounded-lg shadow-xl w-full max-w-lg border border-neutral-border">
                <form onSubmit={handleSubmit}>
                    <div className="p-6">
                        <h3 className="text-lg font-bold text-on-surface mb-4">{item ? 'Editar' : 'Agregar'} Ítem de Inventario</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-on-surface-variant mb-1">Categoría</label>
                                <select name="categoryId" value={formData.categoryId} onChange={handleChange} required className="w-full bg-background border border-neutral-border rounded-md p-2 text-on-surface focus:ring-primary focus:border-primary">
                                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-on-surface-variant mb-1">Nombre del Ítem</label>
                                <input name="name" value={formData.name} onChange={handleChange} required className="w-full bg-background border border-neutral-border rounded-md p-2 text-on-surface focus:ring-primary focus:border-primary" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-on-surface-variant mb-1">Código / Identificador</label>
                                <input name="identifier" value={formData.identifier} onChange={handleChange} required className="w-full bg-background border border-neutral-border rounded-md p-2 text-on-surface focus:ring-primary focus:border-primary" />
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-on-surface-variant mb-1">Empresa</label>
                                <select name="company" value={formData.company} onChange={handleChange} required className="w-full bg-background border border-neutral-border rounded-md p-2 text-on-surface focus:ring-primary focus:border-primary">
                                    <option value="" disabled>Seleccione una empresa...</option>
                                    {companies.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-on-surface-variant mb-1">Stock Total</label>
                                    <input type="number" name="totalStock" value={formData.totalStock} onChange={handleChange} required min="0" className="w-full bg-background border border-neutral-border rounded-md p-2 text-on-surface focus:ring-primary focus:border-primary" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-on-surface-variant mb-1">Stock Mínimo</label>
                                    <input type="number" name="minStock" value={formData.minStock} onChange={handleChange} required min="0" className="w-full bg-background border border-neutral-border rounded-md p-2 text-on-surface focus:ring-primary focus:border-primary" />
                                </div>
                            </div>
                             <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-on-surface-variant mb-1">Unidad</label>
                                    <select name="unit" value={formData.unit} onChange={handleChange} required className="w-full bg-background border border-neutral-border rounded-md p-2 text-on-surface focus:ring-primary focus:border-primary">
                                        {inventoryUnits.length > 0 ? (
                                            inventoryUnits.map(unit => <option key={unit.id} value={unit.value}>{unit.value}</option>)
                                        ) : (
                                            <option value="Unidad">Unidad</option>
                                        )}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-on-surface-variant mb-1">Estado</label>
                                    <select name="status" value={formData.status} onChange={handleChange} required className="w-full bg-background border border-neutral-border rounded-md p-2 text-on-surface focus:ring-primary focus:border-primary">
                                        <option value="Activo">Activo</option>
                                        <option value="Inactivo">Inactivo</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end items-center p-4 border-t border-neutral-border space-x-4">
                        <button type="button" onClick={onClose} className="py-2 px-4 rounded-lg bg-surface border border-neutral-border hover:bg-primary-light-hover transition-colors">Cancelar</button>
                        <button type="submit" className="py-2 px-4 rounded-lg bg-primary text-white hover:bg-primary-dark-hover transition-colors font-semibold">Guardar</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ItemModal;