
import React, { useState, useEffect, useMemo } from 'react';
import { Loan, Employee, InventoryItem, Accessory, AssignedAccessory, Company } from '../../types';
import { api } from '../../services/api';

interface LoanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (loanData: Omit<Loan, 'id'> | Loan) => void;
  loan: Loan | null;
  categoryId: string;
  allEmployees: Employee[];
  allInventory: InventoryItem[];
  companies: Company[];
}

const LoanModal: React.FC<LoanModalProps> = ({ isOpen, onClose, onSave, loan, categoryId, allEmployees, allInventory, companies }) => {
    const [formData, setFormData] = useState({
        employeeId: '',
        inventoryItemId: '',
        deliveryDate: new Date().toISOString().split('T')[0],
        returnDate: '',
        instanceDetails: '',
    });
    const [selectedCompany, setSelectedCompany] = useState('');
    const [isItemPermanent, setIsItemPermanent] = useState(false);
    const [assignedAccessories, setAssignedAccessories] = useState<Map<string, { isPermanent: boolean }>>(new Map());
    
    const [availableAccessories, setAvailableAccessories] = useState<Accessory[]>([]);
    const [useContractEndDate, setUseContractEndDate] = useState(false);
    
    const employeesOfCompany = useMemo(() => {
        if (!selectedCompany) return [];
        return allEmployees.filter(e => e.company === selectedCompany);
    }, [selectedCompany, allEmployees]);

    useEffect(() => {
        if(isOpen) {
            const fetchAccessories = async () => {
                if (categoryId) {
                    const accessories = await api.getAccessoriesWithStock(categoryId);
                    setAvailableAccessories(accessories);
                }
            };
            fetchAccessories();

            // Populate form if editing
            if (loan) {
                 const employee = allEmployees.find(e => e.id === loan.employeeId);
                setSelectedCompany(employee?.company || '');
                setFormData({
                    employeeId: loan.employeeId,
                    inventoryItemId: loan.inventoryItemId,
                    deliveryDate: loan.deliveryDate.split('T')[0],
                    returnDate: loan.returnDate ? loan.returnDate.split('T')[0] : '',
                    instanceDetails: loan.instanceDetails || '',
                });
                setIsItemPermanent(loan.isItemPermanent);
                const assignedMap = new Map<string, { isPermanent: boolean }>();
                loan.assignedAccessories.forEach(acc => {
                    assignedMap.set(acc.id, { isPermanent: acc.isPermanent });
                });
                setAssignedAccessories(assignedMap);
            } else {
                // Reset form for new loan
                setSelectedCompany('');
                 setFormData({
                    employeeId: '',
                    inventoryItemId: '',
                    deliveryDate: new Date().toISOString().split('T')[0],
                    returnDate: '',
                    instanceDetails: '',
                });
                setIsItemPermanent(false);
                setAssignedAccessories(new Map());
                setUseContractEndDate(false);
            }
        }
    }, [isOpen, loan, categoryId, allEmployees]);
  
  const availableInventory = useMemo(() => {
    return allInventory.filter(i => (i.availableStock && i.availableStock > 0) || i.id === loan?.inventoryItemId);
  }, [allInventory, loan]);

  const selectedEmployee = useMemo(() => {
    return allEmployees.find(e => e.id === formData.employeeId);
  }, [formData.employeeId, allEmployees]);

  const isAllPermanent = useMemo(() => {
      const allSelectedAccessories = Array.from(assignedAccessories.values());
      // This resolves a type inference issue where it was being treated as 'unknown'.
      return isItemPermanent && allSelectedAccessories.every((acc: { isPermanent: boolean }) => acc.isPermanent);
  }, [isItemPermanent, assignedAccessories]);

  useEffect(() => {
      if (useContractEndDate && selectedEmployee?.contractEndDate) {
          setFormData(prev => ({ ...prev, returnDate: selectedEmployee.contractEndDate.split('T')[0] }));
      }
  }, [useContractEndDate, selectedEmployee]);
  
  useEffect(() => {
      if (isAllPermanent) {
          setFormData(prev => ({...prev, returnDate: ''}));
      }
  }, [isAllPermanent]);

  useEffect(() => { setUseContractEndDate(false); }, [formData.employeeId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalAssignedAccessories: AssignedAccessory[] = Array.from(assignedAccessories.entries())
        .map(([id, { isPermanent }]) => ({ id, isPermanent }));

    const dataToSave: Omit<Loan, 'id' | 'status'> = {
        ...formData,
        categoryId,
        deliveryDate: new Date(formData.deliveryDate).toISOString(),
        returnDate: isAllPermanent || !formData.returnDate ? null : new Date(formData.returnDate).toISOString(),
        assignedAccessories: finalAssignedAccessories,
        isItemPermanent,
    };
    onSave(loan ? { ...dataToSave, id: loan.id, status: loan.status } : { ...dataToSave, status: 'Activo' });
  };
  
  const handleCompanyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCompany(e.target.value);
    // Reset employee selection when company changes
    setFormData(prev => ({ ...prev, employeeId: ''}));
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };
  
  const handleAccessoryToggle = (accessoryId: string, isChecked: boolean) => {
    setAssignedAccessories(prev => {
        const newMap = new Map(prev);
        if (isChecked) {
            newMap.set(accessoryId, { isPermanent: false });
        } else {
            newMap.delete(accessoryId);
        }
        return newMap;
    });
  };
  
  const handleAccessoryPermanentToggle = (accessoryId: string, isPermanent: boolean) => {
      setAssignedAccessories(prev => {
          const newMap = new Map(prev);
          if(newMap.has(accessoryId)) {
              newMap.set(accessoryId, { isPermanent });
          }
          return newMap;
      });
  };

  const duration = useMemo(() => {
    if (formData.deliveryDate && formData.returnDate) {
        const start = new Date(formData.deliveryDate);
        const end = new Date(formData.returnDate);
        if (end >= start) {
            const diffTime = Math.abs(end.getTime() - start.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
            return `${diffDays} día(s)`;
        }
    }
    return isAllPermanent ? 'Permanente' : 'N/A';
  }, [formData.deliveryDate, formData.returnDate, isAllPermanent]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4">
      <div className="bg-surface rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col border border-neutral-border">
        <form onSubmit={handleSubmit}>
          <div className="p-6 overflow-y-auto">
            <h3 className="text-lg font-bold text-on-surface mb-4">{loan ? 'Editar' : 'Registrar'} Préstamo</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-medium text-on-surface-variant mb-1">Empresa</label>
                    <select value={selectedCompany} onChange={handleCompanyChange} required className="w-full bg-background border border-neutral-border text-on-surface focus:ring-primary focus:border-primary rounded-md p-2">
                        <option value="" disabled>Seleccione una empresa...</option>
                        {companies.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                    </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-on-surface-variant mb-1">Empleado</label>
                  <select name="employeeId" value={formData.employeeId} onChange={handleChange} required className="w-full bg-background border border-neutral-border text-on-surface focus:ring-primary focus:border-primary rounded-md p-2" disabled={!selectedCompany}>
                      <option value="" disabled>Seleccione un empleado...</option>
                      {employeesOfCompany.map(e => <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>)}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-on-surface-variant mb-1">Ítem del Inventario</label>
                  <select name="inventoryItemId" value={formData.inventoryItemId} onChange={handleChange} required className="w-full bg-background border border-neutral-border text-on-surface focus:ring-primary focus:border-primary rounded-md p-2">
                      <option value="" disabled>Seleccione un ítem disponible...</option>
                      {availableInventory.map(i => <option key={i.id} value={i.id}>{i.name} (Disp: {i.availableStock})</option>)}
                  </select>
                </div>
              </div>

               <div className="flex items-center gap-2 text-sm">
                  <input type="checkbox" id="isItemPermanent" checked={isItemPermanent} onChange={(e) => setIsItemPermanent(e.target.checked)} className="h-4 w-4 rounded bg-background border-neutral-border text-primary focus:ring-primary"/>
                  <label htmlFor="isItemPermanent" className="font-medium text-alert">No devolver (asignación permanente)</label>
              </div>

              <div>
                <label className="block text-sm font-medium text-on-surface-variant mb-1">Detalles de Instancia (Ej. S/N, Placa)</label>
                <input type="text" name="instanceDetails" value={formData.instanceDetails} placeholder="Opcional" className="w-full bg-background border border-neutral-border text-on-surface focus:ring-primary focus:border-primary rounded-md p-2"/>
              </div>

              {availableAccessories.length > 0 && (
                <div>
                    <label className="block text-sm font-medium text-on-surface-variant mb-2">Accesorios/Repuestos a Incluir</label>
                    <div className="space-y-2 p-3 bg-background rounded-md border border-neutral-border">
                        {availableAccessories.map(acc => {
                            const assignment = assignedAccessories.get(acc.id);
                            const isChecked = !!assignment;
                            const isDisabled = !isChecked && (!acc.availableStock || acc.availableStock <= 0);
                            return (
                                <div key={acc.id} className={`flex items-center justify-between p-2 rounded ${isChecked ? 'bg-primary/10' : ''}`}>
                                  <label className={`flex items-center space-x-2 ${isDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}>
                                      <input type="checkbox" checked={isChecked} onChange={(e) => handleAccessoryToggle(acc.id, e.target.checked)} disabled={isDisabled} className="h-4 w-4 rounded bg-background border-neutral-border text-primary"/>
                                      <span className="text-sm">{acc.name} (Disp: {acc.availableStock})</span>
                                  </label>
                                  {isChecked && (
                                    <div className="flex items-center gap-2 text-xs">
                                        <input type="checkbox" id={`perm_${acc.id}`} checked={assignment.isPermanent} onChange={e => handleAccessoryPermanentToggle(acc.id, e.target.checked)} className="h-4 w-4 rounded bg-background border-neutral-border text-primary" />
                                        <label htmlFor={`perm_${acc.id}`} className="font-medium text-alert">No devolver</label>
                                    </div>
                                  )}
                                </div>
                            )
                        })}
                    </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-on-surface-variant mb-1">Fecha de Entrega</label>
                  <input type="date" name="deliveryDate" value={formData.deliveryDate} onChange={handleChange} required className="w-full bg-background border border-neutral-border text-on-surface focus:ring-primary focus:border-primary rounded-md p-2"/>
                </div>
                <div>
                    <label className="block text-sm font-medium text-on-surface-variant mb-1">Fecha de Devolución</label>
                    <input type="date" name="returnDate" value={formData.returnDate} onChange={handleChange} required={!isAllPermanent} disabled={isAllPermanent || useContractEndDate} className="w-full bg-background border border-neutral-border text-on-surface focus:ring-primary focus:border-primary rounded-md p-2 disabled:opacity-50"/>
                    <div className="mt-2 flex items-center gap-2 text-xs text-on-surface-variant">
                        <input type="checkbox" id="useContractEnd" checked={useContractEndDate} onChange={(e) => setUseContractEndDate(e.target.checked)} disabled={!selectedEmployee?.contractEndDate || isAllPermanent} className="h-4 w-4 rounded bg-background text-primary disabled:opacity-50"/>
                        <label htmlFor="useContractEnd" className={!selectedEmployee?.contractEndDate || isAllPermanent ? 'opacity-50' : ''}>
                            Usar fin de contrato: <span className="font-semibold ml-1">{selectedEmployee?.contractEndDate ? new Date(selectedEmployee.contractEndDate).toLocaleDateString('es-ES') : 'N/A'}</span>
                        </label>
                    </div>
                </div>
              </div>
              <div className="text-sm text-center text-on-surface-variant pt-2">Duración: <span className="font-bold text-secondary">{duration}</span></div>
            </div>
          </div>
          <div className="flex justify-end items-center p-4 border-t border-neutral-border space-x-4">
            <button type="button" onClick={onClose} className="py-2 px-4 rounded-lg bg-surface border border-neutral-border hover:bg-primary-light-hover">Cancelar</button>
            <button type="submit" className="py-2 px-4 rounded-lg bg-primary text-white hover:bg-primary-dark-hover font-semibold">Guardar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoanModal;
