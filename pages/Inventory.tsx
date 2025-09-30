import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { api } from '../services/api';
import { InventoryItem, Accessory, InventoryCategory, FormFieldOption, Company } from '../types';
import Spinner from '../components/ui/Spinner';
import { useAuth } from '../contexts/AuthContext';
import ItemModal from '../components/inventory/ItemModal';
import StockModal from '../components/inventory/StockModal';
import MovementsModal from '../components/inventory/MovementsModal';
import ConfirmationModal from '../components/ui/ConfirmationModal';
import AccessoryModal from '../components/settings/AccessoryModal';
import AccessoryStockModal from '../components/settings/AccessoryStockModal';
import AccessoryMovementsModal from '../components/settings/AccessoryMovementsModal';

type SortableKeys = 'name' | 'category' | 'identifier' | 'totalStock' | 'availableStock' | 'status';
type Tab = 'items' | 'accessories';

const Inventory: React.FC = () => {
    const [activeTab, setActiveTab] = useState<Tab>('items');

    const [items, setItems] = useState<InventoryItem[]>([]);
    const [accessories, setAccessories] = useState<Accessory[]>([]);
    const [categories, setCategories] = useState<InventoryCategory[]>([]);
    const [inventoryUnits, setInventoryUnits] = useState<FormFieldOption[]>([]);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [companyFilter, setCompanyFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const { hasPermission } = useAuth();
    
    // Modals state
    const [isItemModalOpen, setIsItemModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
    const [isStockModalOpen, setIsStockModalOpen] = useState(false);
    const [stockAdjustItem, setStockAdjustItem] = useState<InventoryItem | null>(null);
    const [stockAdjustType, setStockAdjustType] = useState<'add' | 'subtract'>('add');
    const [isMovementsModalOpen, setIsMovementsModalOpen] = useState(false);
    const [movementsItem, setMovementsItem] = useState<InventoryItem | null>(null);
    const [itemToDelete, setItemToDelete] = useState<InventoryItem | null>(null);

    // Accessory Modals State
    const [isAccModalOpen, setIsAccModalOpen] = useState(false);
    const [editingAcc, setEditingAcc] = useState<Accessory | null>(null);
    const [isAccStockModalOpen, setIsAccStockModalOpen] = useState(false);
    const [stockAdjustAcc, setStockAdjustAcc] = useState<Accessory | null>(null);
    const [isAccMovementsModalOpen, setIsAccMovementsModalOpen] = useState(false);
    const [movementsAcc, setMovementsAcc] = useState<Accessory | null>(null);
    const [accToDelete, setAccToDelete] = useState<Accessory | null>(null);


    const categoryMap = useMemo(() => new Map(categories.map(c => [c.id, c.name])), [categories]);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [itemsData, catsData, allAccessoriesData, optionsData, compData] = await Promise.all([
                api.getInventoryItemsWithStock(),
                api.getInventoryCategories(),
                api.getAllAccessories(),
                api.getFormFieldOptions(),
                api.getCompanies(),
            ]);
            setItems(itemsData);
            setCategories(catsData);
            setCompanies(compData);
            setInventoryUnits(optionsData.filter(o => o.fieldType === 'inventoryUnit'));
            
             const accessoriesWithStock = await Promise.all(allAccessoriesData.map(async acc => {
                const stockData = await api.getAccessoriesWithStock(acc.categoryId);
                const match = stockData.find(s => s.id === acc.id);
                return match || acc;
            }));
            setAccessories(accessoriesWithStock);

        } catch (error) {
            console.error("Failed to fetch inventory data", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const processedItems = useMemo(() => {
        return items
            .map(item => ({...item, categoryName: categoryMap.get(item.categoryId) || 'N/A' }))
            .filter(item => 
                (item.name.toLowerCase().includes(searchTerm.toLowerCase()) || item.identifier.toLowerCase().includes(searchTerm.toLowerCase())) &&
                (!categoryFilter || item.categoryId === categoryFilter) &&
                (!companyFilter || item.company === companyFilter) &&
                (!statusFilter || item.status === statusFilter)
            );
    }, [items, searchTerm, categoryFilter, companyFilter, statusFilter, categoryMap]);
    
    const processedAccessories = useMemo(() => {
        return accessories
            .map(acc => ({...acc, categoryName: categoryMap.get(acc.categoryId) || 'N/A'}))
            .filter(acc =>
                (acc.name.toLowerCase().includes(searchTerm.toLowerCase())) &&
                (!categoryFilter || acc.categoryId === categoryFilter) &&
                (!companyFilter || acc.company === companyFilter) &&
                (!statusFilter || acc.status === statusFilter)
            );
    }, [accessories, searchTerm, categoryFilter, companyFilter, statusFilter, categoryMap]);
    
    // Handlers for Items
    const handleSaveItem = async (data: Omit<InventoryItem, 'id'> | InventoryItem) => {
        await ('id' in data ? api.updateInventoryItem(data) : api.addInventoryItem(data));
        setIsItemModalOpen(false);
        fetchData();
    };
    const handleAdjustStock = async (itemId: string, quantity: number, notes: string) => {
        await api.adjustInventoryStock(itemId, quantity, notes);
        setIsStockModalOpen(false);
        fetchData();
    };
    const handleConfirmDeleteItem = async () => {
        if(itemToDelete) {
            await api.deleteInventoryItem(itemToDelete.id);
            setItemToDelete(null);
            fetchData();
        }
    };

    // Handlers for Accessories
    const handleSaveAccessory = async (data: Omit<Accessory, 'id'> | Accessory) => {
        await ('id' in data ? api.updateAccessory(data) : api.addAccessory(data));
        setIsAccModalOpen(false);
        fetchData();
    };
    const handleAdjustAccessoryStock = async (accessoryId: string, quantity: number, notes: string) => {
        await api.adjustAccessoryStock(accessoryId, quantity, notes);
        setIsAccStockModalOpen(false);
        fetchData();
    };
    const handleConfirmDeleteAccessory = async () => {
        if(accToDelete) {
            await api.deleteAccessory(accToDelete.id);
            setAccToDelete(null);
            fetchData();
        }
    };


    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-primary">Inventario General</h1>
                {hasPermission('inventory:create') && (
                    <button onClick={() => { activeTab === 'items' ? (setEditingItem(null), setIsItemModalOpen(true)) : (setEditingAcc(null), setIsAccModalOpen(true)) }} className="bg-primary text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-primary-dark-hover transition-colors">
                        {activeTab === 'items' ? '+ Agregar Ítem' : '+ Agregar Accesorio'}
                    </button>
                )}
            </div>

            <div className="bg-surface rounded-lg shadow-lg border border-neutral-border">
                 <div className="border-b border-neutral-border">
                    <nav className="-mb-px flex space-x-6 px-6" aria-label="Tabs">
                        <button onClick={() => setActiveTab('items')} className={`${activeTab === 'items' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>Ítems de Inventario</button>
                        <button onClick={() => setActiveTab('accessories')} className={`${activeTab === 'accessories' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>Accesorios y Repuestos</button>
                    </nav>
                </div>

                <div className="p-4 grid grid-cols-1 md:grid-cols-4 gap-4 border-b border-neutral-border">
                    <input type="text" placeholder="Buscar por nombre o código..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="md:col-span-4 bg-background border border-neutral-border rounded-md p-2" />
                    <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="bg-background border border-neutral-border rounded-md p-2">
                        <option value="">Todas las Categorías</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <select value={companyFilter} onChange={e => setCompanyFilter(e.target.value)} className="bg-background border border-neutral-border rounded-md p-2">
                        <option value="">Todas las Empresas</option>
                        {companies.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                    </select>
                    <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="bg-background border border-neutral-border rounded-md p-2">
                        <option value="">Todos los Estados</option>
                        <option value="Activo">Activo</option>
                        <option value="Inactivo">Inactivo</option>
                    </select>
                </div>
                
                <div className="overflow-x-auto">
                    {loading ? <div className="h-96"><Spinner/></div> : (
                        activeTab === 'items' 
                        ? <ItemsTable items={processedItems} hasPermission={hasPermission} setMovementsItem={setMovementsItem} setIsMovementsModalOpen={setIsMovementsModalOpen} setEditingItem={setEditingItem} setIsItemModalOpen={setIsItemModalOpen} setItemToDelete={setItemToDelete} setStockAdjustItem={setStockAdjustItem} setStockAdjustType={setStockAdjustType} setIsStockModalOpen={setIsStockModalOpen} />
                        : <AccessoriesTable accessories={processedAccessories} hasPermission={hasPermission} setMovementsAcc={setMovementsAcc} setIsAccMovementsModalOpen={setIsAccMovementsModalOpen} setEditingAcc={setEditingAcc} setIsAccModalOpen={setIsAccModalOpen} setAccToDelete={setAccToDelete} setStockAdjustAcc={setStockAdjustAcc} setStockAdjustType={setStockAdjustType} setIsAccStockModalOpen={setIsAccStockModalOpen} />
                    )}
                </div>
            </div>
            
            {/* Item Modals */}
            {isItemModalOpen && <ItemModal isOpen={isItemModalOpen} onClose={() => setIsItemModalOpen(false)} onSave={handleSaveItem} item={editingItem} categories={categories} inventoryUnits={inventoryUnits} companies={companies} />}
            {isStockModalOpen && stockAdjustItem && <StockModal isOpen={isStockModalOpen} onClose={() => setIsStockModalOpen(false)} onSave={handleAdjustStock} item={stockAdjustItem} type={stockAdjustType}/>}
            {isMovementsModalOpen && movementsItem && <MovementsModal isOpen={isMovementsModalOpen} onClose={() => setIsMovementsModalOpen(false)} item={movementsItem} />}
            {itemToDelete && <ConfirmationModal isOpen={!!itemToDelete} onClose={() => setItemToDelete(null)} onConfirm={handleConfirmDeleteItem} title="Confirmar Eliminación" message={`¿Eliminar el ítem "${itemToDelete.name}"? Esta acción no se puede deshacer.`} />}

             {/* Accessory Modals */}
            {isAccModalOpen && <AccessoryModal isOpen={isAccModalOpen} onClose={() => setIsAccModalOpen(false)} onSave={handleSaveAccessory} accessory={editingAcc} categories={categories} inventoryUnits={inventoryUnits} companies={companies}/>}
            {isAccStockModalOpen && stockAdjustAcc && <AccessoryStockModal isOpen={isAccStockModalOpen} onClose={() => setIsAccStockModalOpen(false)} onSave={handleAdjustAccessoryStock} accessory={stockAdjustAcc} type={stockAdjustType}/>}
            {isAccMovementsModalOpen && movementsAcc && <AccessoryMovementsModal isOpen={isAccMovementsModalOpen} onClose={() => setIsAccMovementsModalOpen(false)} accessory={movementsAcc} />}
            {accToDelete && <ConfirmationModal isOpen={!!accToDelete} onClose={() => setAccToDelete(null)} onConfirm={handleConfirmDeleteAccessory} title="Confirmar Eliminación" message={`¿Eliminar el accesorio "${accToDelete.name}"? Esta acción no se puede deshacer.`} />}
        </div>
    );
};

// --- Table Components ---
const ItemsTable = ({items, hasPermission, setMovementsItem, setIsMovementsModalOpen, setEditingItem, setIsItemModalOpen, setItemToDelete, setStockAdjustItem, setStockAdjustType, setIsStockModalOpen}: any) => (
    <table className="w-full text-sm text-left text-on-surface-variant">
        <thead className="text-xs text-white uppercase bg-primary">
            <tr>
                <th className="px-4 py-3">Categoría</th>
                <th className="px-4 py-3">Ítem</th>
                <th className="px-4 py-3">Empresa</th>
                <th className="px-4 py-3">Stock Total</th>
                <th className="px-4 py-3">Disponible</th>
                <th className="px-4 py-3">Mínimo</th>
                <th className="px-4 py-3">Estado</th>
                {(hasPermission('inventory:update') || hasPermission('inventory:delete')) && <th className="px-4 py-3 text-center">Acciones</th>}
            </tr>
        </thead>
        <tbody>
            {items.map((item: any) => (
                <tr key={item.id} className="bg-surface border-b border-neutral-border hover:bg-primary-light-hover">
                    <td className="px-4 py-2">{item.categoryName}</td>
                    <td className="px-4 py-2 font-medium text-on-surface">{item.name} <span className="text-xs text-on-surface-variant/80">({item.identifier})</span></td>
                    <td className="px-4 py-2">{item.company}</td>
                    <td className="px-4 py-2 text-center">{item.totalStock}</td>
                    <td className={`px-4 py-2 text-center font-bold ${item.availableStock! <= item.minStock ? 'text-error' : 'text-success'}`}>{item.availableStock}</td>
                    <td className="px-4 py-2 text-center">{item.minStock}</td>
                    <td className="px-4 py-2"><span className={`px-2 py-1 text-xs font-medium rounded-full ${item.status === 'Activo' ? 'bg-success/20 text-success' : 'bg-on-surface-variant/20 text-on-surface-variant'}`}>{item.status}</span></td>
                    {(hasPermission('inventory:update') || hasPermission('inventory:delete')) && (
                        <td className="px-4 py-2 text-center space-x-1">
                            <button onClick={()=>{setMovementsItem(item); setIsMovementsModalOpen(true);}} className="p-1.5 hover:bg-on-surface-variant/10 rounded-md" title="Ver Movimientos"><HistoryIcon/></button>
                            {hasPermission('inventory:update') && <>
                                <button onClick={()=>{setEditingItem(item); setIsItemModalOpen(true);}} className="p-1.5 text-alert hover:bg-on-surface-variant/10 rounded-md" title="Editar"><PencilIcon/></button>
                                <button onClick={()=>{setStockAdjustItem(item); setStockAdjustType('add'); setIsStockModalOpen(true);}} className="p-1.5 text-success" title="Añadir Stock"><PlusCircleIcon/></button>
                                <button onClick={()=>{setStockAdjustItem(item); setStockAdjustType('subtract'); setIsStockModalOpen(true);}} className="p-1.5 text-error" title="Restar Stock"><MinusCircleIcon/></button>
                            </>}
                            {hasPermission('inventory:delete') && <button onClick={()=>{setItemToDelete(item)}} className="p-1.5 text-error hover:bg-on-surface-variant/10 rounded-md" title="Eliminar"><TrashIcon/></button>}
                        </td>
                    )}
                </tr>
            ))}
        </tbody>
    </table>
);

const AccessoriesTable = ({accessories, hasPermission, setMovementsAcc, setIsAccMovementsModalOpen, setEditingAcc, setIsAccModalOpen, setAccToDelete, setStockAdjustAcc, setStockAdjustType, setIsAccStockModalOpen}: any) => (
    <table className="w-full text-sm text-left text-on-surface-variant">
        <thead className="text-xs text-white uppercase bg-primary">
            <tr>
                <th className="px-4 py-3">Categoría Asociada</th>
                <th className="px-4 py-3">Accesorio</th>
                <th className="px-4 py-3">Empresa</th>
                <th className="px-4 py-3">Stock Total</th>
                <th className="px-4 py-3">Disponible</th>
                <th className="px-4 py-3">Mínimo</th>
                <th className="px-4 py-3">Estado</th>
                {(hasPermission('inventory:update') || hasPermission('inventory:delete')) && <th className="px-4 py-3 text-center">Acciones</th>}
            </tr>
        </thead>
        <tbody>
            {accessories.map((acc: any) => (
                <tr key={acc.id} className="bg-surface border-b border-neutral-border hover:bg-primary-light-hover">
                    <td className="px-4 py-2">{acc.categoryName}</td>
                    <td className="px-4 py-2 font-medium text-on-surface">{acc.name}</td>
                    <td className="px-4 py-2">{acc.company}</td>
                    <td className="px-4 py-2 text-center">{acc.totalStock}</td>
                    <td className={`px-4 py-2 text-center font-bold ${acc.availableStock! <= acc.minStock ? 'text-error' : 'text-success'}`}>{acc.availableStock}</td>
                    <td className="px-4 py-2 text-center">{acc.minStock}</td>
                    <td className="px-4 py-2"><span className={`px-2 py-1 text-xs font-medium rounded-full ${acc.status === 'Activo' ? 'bg-success/20 text-success' : 'bg-on-surface-variant/20 text-on-surface-variant'}`}>{acc.status}</span></td>
                     {(hasPermission('inventory:update') || hasPermission('inventory:delete')) && (
                        <td className="px-4 py-2 text-center space-x-1">
                            <button onClick={()=>{setMovementsAcc(acc); setIsAccMovementsModalOpen(true);}} className="p-1.5 hover:bg-on-surface-variant/10 rounded-md" title="Ver Movimientos"><HistoryIcon/></button>
                            {hasPermission('inventory:update') && <>
                                <button onClick={()=>{setEditingAcc(acc); setIsAccModalOpen(true);}} className="p-1.5 text-alert hover:bg-on-surface-variant/10 rounded-md" title="Editar"><PencilIcon/></button>
                                <button onClick={()=>{setStockAdjustAcc(acc); setStockAdjustType('add'); setIsAccStockModalOpen(true);}} className="p-1.5 text-success" title="Añadir Stock"><PlusCircleIcon/></button>
                                <button onClick={()=>{setStockAdjustAcc(acc); setStockAdjustType('subtract'); setIsAccStockModalOpen(true);}} className="p-1.5 text-error" title="Restar Stock"><MinusCircleIcon/></button>
                            </>}
                            {hasPermission('inventory:delete') && <button onClick={()=>{setAccToDelete(acc)}} className="p-1.5 text-error hover:bg-on-surface-variant/10 rounded-md" title="Eliminar"><TrashIcon/></button>}
                        </td>
                    )}
                </tr>
            ))}
        </tbody>
    </table>
);


// Icons
const HistoryIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const PencilIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" /></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;
const PlusCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const MinusCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;

export default Inventory;