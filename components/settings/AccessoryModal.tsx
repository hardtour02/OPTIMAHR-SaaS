import React, { useState, useEffect } from 'react';
import { Accessory, InventoryCategory, FormFieldOption, Company } from '../../types';

interface AccessoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<Accessory, 'id'> | Accessory) => void;
  accessory: Accessory | null;
  categories: InventoryCategory[];
  inventoryUnits: FormFieldOption[];
  companies: Company[];
}

const AccessoryModal: React.FC<AccessoryModalProps> = ({ isOpen, onClose, onSave, accessory, categories, inventoryUnits, companies }) => {
    const [formData, setFormData] = useState({
        categoryId: accessory?.categoryId || (categories[0]?.id || ''),
        name: accessory?.name || '',
        company: accessory?.company || '',
        totalStock: accessory?.totalStock || 1,
        minStock: accessory?.minStock || 0,
        unit: accessory?.unit || (inventoryUnits[0]?.value || 'Unidad'),
        status: accessory?.status || 'Activo' as 'Activo' | 'Inactivo',
    });

    useEffect(() => {
        if (isOpen) {
            if (accessory) {
                setFormData({
                    categoryId: accessory.categoryId,
                    name: accessory.name,
                    company: accessory.company,
                    totalStock: accessory.totalStock,
                    minStock: accessory.minStock,
                    unit: accessory.unit,
                    status: accessory.status,
                });
            } else {
                 setFormData({
                    categoryId: categories[0]?.id || '',
                    name: '',
                    company: '',
                    totalStock: 1,
                    minStock: 0,
                    unit: inventoryUnits[0]?.value || 'Unidad',
                    status: 'Activo',
                });
            }
        }
    }, [accessory, categories, inventoryUnits, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        const isNumber = ['totalStock', 'minStock'].includes(name);
        setFormData(prev => ({ ...prev, [name]: isNumber ? parseInt(value, 10) || 0 : value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (accessory) {
            onSave({ ...formData, id: accessory.id });
        } else {
            onSave(formData);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4">
            <div className="bg-surface rounded-lg shadow-xl w-full max-w-lg border border-neutral-border">
                <form onSubmit={handleSubmit}>
                    <div className="p-6">
                        <h3 className="text-lg font-bold text-on-surface mb-4">{accessory ? 'Editar' : 'Agregar'} Accesorio/Repuesto</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-on-surface-variant mb-1">Categoría</label>
                                <select name="categoryId" value={formData.categoryId} onChange={handleChange} required className="w-full bg-background border border-neutral-border rounded-md p-2 text-on-surface focus:ring-primary focus:border-primary" disabled={!!accessory}>
                                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                                {!!accessory && <p className="text-xs text-on-surface-variant/80 mt-1">La categoría de un accesorio no se puede cambiar después de su creación.</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-on-surface-variant mb-1">Nombre</label>
                                <input name="name" value={formData.name} onChange={handleChange} required className="w-full bg-background border border-neutral-border rounded-md p-2 text-on-surface focus:ring-primary focus:border-primary" />
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

export default AccessoryModal;