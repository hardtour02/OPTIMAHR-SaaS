
import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { InventoryConfig, InventoryCategory, FormFieldOption } from '../../types';
import Spinner from '../ui/Spinner';
import ConfirmationModal from '../ui/ConfirmationModal';
import FieldManager from './FieldManager';
import { useAuth } from '../../contexts/AuthContext';


const ToggleSwitch: React.FC<{ enabled: boolean; onChange: () => void; }> = ({ enabled, onChange }) => (
    <button
        type="button"
        className={`${enabled ? 'bg-primary' : 'bg-slate-600'} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface`}
        onClick={onChange}
    >
        <span
            aria-hidden="true"
            className={`${enabled ? 'translate-x-5' : 'translate-x-0'} pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
        />
    </button>
);

const InventorySettingsManager: React.FC = () => {
    const [config, setConfig] = useState<InventoryConfig | null>(null);
    const [categories, setCategories] = useState<InventoryCategory[]>([]);
    const [fieldOptions, setFieldOptions] = useState<FormFieldOption[]>([]);
    const [loading, setLoading] = useState(true);
    const { hasPermission } = useAuth();
    const canWrite = hasPermission('settings:write');
    
    // Modal state
    const [isCatModalOpen, setIsCatModalOpen] = useState(false);
    const [editingCat, setEditingCat] = useState<InventoryCategory | null>(null);
    const [catToDelete, setCatToDelete] = useState<InventoryCategory | null>(null);


    const fetchData = async () => {
        setLoading(true);
        try {
            const [configData, catData, optionsData] = await Promise.all([
                api.getInventoryConfig(),
                api.getInventoryCategories(),
                api.getFormFieldOptions()
            ]);
            setConfig(configData);
            setCategories(catData);
            setFieldOptions(optionsData);
        } catch (error) {
            console.error("Failed to load inventory settings", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleToggleAlerts = async () => {
        if (config) {
            const newConfig = { ...config, enableLowStockAlerts: !config.enableLowStockAlerts };
            setConfig(newConfig);
            await api.updateInventoryConfig(newConfig);
        }
    };

    const handleSaveCategory = async (catData: Omit<InventoryCategory, 'id'> | InventoryCategory) => {
        await ('id' in catData ? api.updateInventoryCategory(catData) : api.addInventoryCategory(catData));
        setIsCatModalOpen(false);
        fetchData();
    };

    const confirmDeleteCategory = async () => {
        if(catToDelete) {
            await api.deleteInventoryCategory(catToDelete.id);
            setCatToDelete(null);
            fetchData();
        }
    };

    const handleFieldOptionUpdate = async (apiCall: Promise<any>) => {
        await apiCall;
        fetchData();
    };

    if (loading) return <div className="h-40"><Spinner /></div>;

    return (
        <div className="space-y-6">
             <h2 className="text-2xl font-bold text-on-surface">Configuración de Inventario</h2>
             <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700">
                <div className="flex justify-between items-center">
                    <div>
                        <h3 className="text-lg font-semibold text-on-surface">Alertas de Bajo Stock</h3>
                        <p className="text-sm text-on-surface-variant">Activa para recibir notificaciones cuando el stock disponible de un ítem llegue a su mínimo configurado.</p>
                    </div>
                    {config && <ToggleSwitch enabled={config.enableLowStockAlerts} onChange={handleToggleAlerts} />}
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-xl font-bold text-on-surface">Categorías de Inventario</h3>
                        <button onClick={() => { setEditingCat(null); setIsCatModalOpen(true); }} className="bg-primary text-white font-semibold py-1 px-3 rounded-lg shadow-md hover:bg-primary/80 text-sm">+ Añadir Categoría</button>
                    </div>
                    <div className="bg-slate-800/50 rounded-lg border border-slate-700 overflow-hidden">
                        <ul className="divide-y divide-slate-700">
                            {categories.map(cat => (
                                <li key={cat.id} className="p-3 flex justify-between items-center hover:bg-slate-800">
                                    <span className="font-medium">{cat.name}</span>
                                    <div className="space-x-2">
                                        <button onClick={() => { setEditingCat(cat); setIsCatModalOpen(true); }} className="p-1.5 text-yellow-400"><PencilIcon/></button>
                                        <button onClick={() => setCatToDelete(cat)} className="p-1.5 text-red-400"><TrashIcon/></button>
                                    </div>
                                </li>
                            ))}
                            {categories.length === 0 && <p className="text-center p-4 text-sm text-slate-500">No hay categorías definidas.</p>}
                        </ul>
                    </div>
                </div>
                 <FieldManager
                    title="Unidades de Medida"
                    fieldType="inventoryUnit"
                    options={fieldOptions.filter(o => o.fieldType === 'inventoryUnit')}
                    canWrite={canWrite}
                    onAdd={(fieldType, value) => handleFieldOptionUpdate(api.addFormFieldOption({ fieldType, value }))}
                    onUpdate={(option) => handleFieldOptionUpdate(api.updateFormFieldOption(option))}
                    onDelete={(id) => handleFieldOptionUpdate(api.deleteFormFieldOption(id))}
                />
            </div>


            {isCatModalOpen && <CategoryModal onClose={() => setIsCatModalOpen(false)} onSave={handleSaveCategory} category={editingCat}/>}
            {catToDelete && <ConfirmationModal isOpen={!!catToDelete} onClose={() => setCatToDelete(null)} onConfirm={confirmDeleteCategory} title="Confirmar Eliminación" message={`¿Eliminar la categoría "${catToDelete.name}"? Todo su inventario y accesorios también serán eliminados.`}/>}

        </div>
    );
};


// --- Modal Component ---
const CategoryModal: React.FC<{onClose: () => void, onSave: (d: any) => void, category: InventoryCategory | null}> = ({onClose, onSave, category}) => {
    const [name, setName] = useState(category?.name || '');
    const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onSave(category ? { ...category, name } : { name }); };
    
    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center"><div className="bg-surface rounded-lg shadow-xl w-full max-w-lg border border-slate-700">
            <form onSubmit={handleSubmit}>
                <div className="p-6 space-y-4">
                    <h3 className="text-lg font-bold">{category ? 'Editar Categoría' : 'Añadir Categoría'}</h3>
                    <div>
                        <label>Nombre de la Categoría</label>
                        <input value={name} onChange={e => setName(e.target.value)} required className="w-full bg-slate-700 p-2 rounded-md mt-1"/>
                    </div>
                </div>
                <div className="flex justify-end p-4 border-t border-slate-700 space-x-4">
                    <button type="button" onClick={onClose} className="py-2 px-4 rounded-lg bg-slate-600 hover:bg-slate-500">Cancelar</button>
                    <button type="submit" className="py-2 px-4 rounded-lg bg-primary hover:bg-primary/80 font-semibold">Guardar</button>
                </div>
            </form>
        </div></div>
    );
};

const PencilIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" /></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;


export default InventorySettingsManager;