
import React, { useState, useEffect, useMemo } from 'react';
import { OrgNode, Employee } from '../../types';

interface AssignEmployeesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (nodeId: string, employeeIds: string[]) => void;
  node: OrgNode;
  allEmployees: Employee[];
}

const AssignEmployeesModal: React.FC<AssignEmployeesModalProps> = ({ isOpen, onClose, onSave, node, allEmployees }) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isOpen) {
      setSelectedIds(new Set(node.employeeIds));
    }
  }, [isOpen, node.employeeIds]);

  const handleToggle = (employeeId: string) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(employeeId)) {
        newSet.delete(employeeId);
      } else {
        newSet.add(employeeId);
      }
      return newSet;
    });
  };

  const handleSave = () => {
    onSave(node.id, Array.from(selectedIds));
  };
  
  const filteredEmployees = useMemo(() => {
    return allEmployees.filter(emp =>
        `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allEmployees, searchTerm]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4">
      <div className="bg-surface rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col border border-neutral-border">
        <div className="p-6 border-b border-neutral-border">
          <h3 className="text-lg font-bold text-on-surface">Asignar Empleados a '{node.name}'</h3>
          <input
            type="text"
            placeholder="Buscar empleado..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-background border border-neutral-border rounded-md p-2 mt-4 text-on-surface focus:ring-primary focus:border-primary"
          />
        </div>
        <div className="p-6 overflow-y-auto space-y-3">
          {filteredEmployees.map(emp => (
            <div key={emp.id} className="flex items-center justify-between p-2 rounded-md hover:bg-primary-light-hover">
                <div className="flex items-center gap-3">
                    <img src={emp.photoUrl} className="w-8 h-8 rounded-full object-cover" />
                    <div>
                        <p className="font-medium text-on-surface">{emp.firstName} {emp.lastName}</p>
                        <p className="text-xs text-on-surface-variant">{emp.title}</p>
                    </div>
                </div>
                <input
                    type="checkbox"
                    checked={selectedIds.has(emp.id)}
                    onChange={() => handleToggle(emp.id)}
                    className="h-5 w-5 rounded bg-background border-neutral-border text-primary focus:ring-primary"
                />
            </div>
          ))}
        </div>
        <div className="flex justify-end items-center p-4 border-t border-neutral-border space-x-4">
          <button type="button" onClick={onClose} className="py-2 px-4 rounded-lg bg-surface border border-neutral-border hover:bg-primary-light-hover transition-colors">
            Cancelar
          </button>
          <button onClick={handleSave} className="py-2 px-4 rounded-lg bg-primary text-white hover:bg-primary-dark-hover transition-colors font-semibold">
            Guardar Asignaciones ({selectedIds.size})
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignEmployeesModal;
