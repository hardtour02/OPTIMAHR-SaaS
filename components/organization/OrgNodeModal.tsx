
import React, { useState, useEffect } from 'react';
import { OrgNode } from '../../types';

interface OrgNodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, unitType: string) => void;
  node: OrgNode | null;
  error?: string;
  clearError: () => void;
}

const OrgNodeModal: React.FC<OrgNodeModalProps> = ({ isOpen, onClose, onSave, node, error, clearError }) => {
  const [name, setName] = useState('');
  const [unitType, setUnitType] = useState('');

  useEffect(() => {
    if (node) {
      setName(node.name);
      setUnitType(node.unitType);
    } else {
      setName('');
      setUnitType('');
    }
  }, [node, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && unitType.trim()) {
      onSave(name.trim(), unitType.trim());
    }
  };
  
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
    if(error) clearError();
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4">
      <div className="bg-surface rounded-lg shadow-xl w-full max-w-md border border-neutral-border">
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            <h3 className="text-lg font-bold text-on-surface">
              {node ? 'Editar Unidad' : 'Añadir Nueva Unidad'}
            </h3>
            <div>
              <label className="block text-sm font-medium text-on-surface-variant mb-1">Nombre de la Unidad</label>
              <input
                type="text"
                value={name}
                onChange={handleNameChange}
                required
                autoFocus
                className="w-full bg-background border border-neutral-border rounded-md p-2 text-on-surface focus:ring-primary focus:border-primary"
              />
            </div>
             <div>
              <label className="block text-sm font-medium text-on-surface-variant mb-1">Tipo de Unidad (e.g., Gerencia, Equipo)</label>
              <input
                type="text"
                value={unitType}
                onChange={(e) => setUnitType(e.target.value)}
                required
                className="w-full bg-background border border-neutral-border rounded-md p-2 text-on-surface focus:ring-primary focus:border-primary"
              />
            </div>
            {error && <p className="text-sm text-error">{error}</p>}
          </div>
          <div className="flex justify-end items-center p-4 border-t border-neutral-border space-x-4">
            <button type="button" onClick={onClose} className="py-2 px-4 rounded-lg bg-surface border border-neutral-border hover:bg-primary-light-hover transition-colors">
              Cancelar
            </button>
            <button type="submit" className="py-2 px-4 rounded-lg bg-primary text-white hover:bg-primary-dark-hover transition-colors font-semibold">
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OrgNodeModal;
