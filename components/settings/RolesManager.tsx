import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../../services/api';
import { Role, Permission } from '../../types';
import Spinner from '../ui/Spinner';
import ConfirmationModal from '../ui/ConfirmationModal';

const RolesManager: React.FC = () => {
    const [roles, setRoles] = useState<Role[]>([]);
    const [permissions, setPermissions] = useState<{ id: Permission, label: string, module: string }[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRole, setEditingRole] = useState<Role | null>(null);
    const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [rolesData, permsData] = await Promise.all([
                api.getRoles(),
                api.getPermissions()
            ]);
            setRoles(rolesData);
            setPermissions(permsData);
        } catch (err) {
            setError('No se pudieron cargar los datos de roles y permisos.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSave = async (roleData: Omit<Role, 'id' | 'isDeletable'> | Role) => {
        try {
            if ('id' in roleData) {
                await api.updateRole(roleData);
            } else {
                await api.addRole(roleData as Omit<Role, 'id' | 'isDeletable'>);
            }
            fetchData();
        } catch (err: any) {
            setError(err.message || 'Error al guardar el rol.');
        } finally {
            setIsModalOpen(false);
            setEditingRole(null);
        }
    };
    
    const handleDelete = async () => {
        if(roleToDelete) {
            try {
                await api.deleteRole(roleToDelete.id);
                fetchData();
            } catch (err: any) {
                setError(err.message || 'Error al eliminar el rol.');
            } finally {
                setRoleToDelete(null);
            }
        }
    }

    if (loading) return <div className="h-64"><Spinner /></div>;

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-primary">Gestionar Roles</h2>
                <button onClick={() => { setEditingRole(null); setIsModalOpen(true); }} className="bg-primary text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-primary-dark-hover transition-colors">
                    + Añadir Rol
                </button>
            </div>
            {error && <p className="text-error text-center bg-error/10 p-2 rounded-md">{error}</p>}

            <div className="bg-surface rounded-lg border border-neutral-border overflow-hidden">
                <ul className="divide-y divide-neutral-border">
                    {roles.map(role => (
                        <li key={role.id} className="p-4 hover:bg-primary-light-hover">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="font-bold text-on-surface">{role.name}</h3>
                                    <p className="text-sm text-on-surface-variant">{role.description}</p>
                                    <p className="text-xs text-secondary mt-1">{role.permissions.length} permisos</p>
                                </div>
                                <div className="space-x-2">
                                    <button onClick={() => { setEditingRole(role); setIsModalOpen(true); }} className="p-1.5 text-alert hover:bg-on-surface-variant/10 rounded-md" title="Editar"><PencilIcon/></button>
                                    {role.isDeletable && (
                                        <button onClick={() => setRoleToDelete(role)} className="p-1.5 text-error hover:bg-on-surface-variant/10 rounded-md" title="Eliminar"><TrashIcon/></button>
                                    )}
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
            {isModalOpen && <RoleModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSave} role={editingRole} allPermissions={permissions}/>}
            {roleToDelete && <ConfirmationModal isOpen={!!roleToDelete} onClose={() => setRoleToDelete(null)} onConfirm={handleDelete} title="Confirmar Eliminación" message={`¿Seguro que deseas eliminar el rol "${roleToDelete.name}"?`}/>}
        </div>
    );
};


interface RoleModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: Role | Omit<Role, 'id' | 'isDeletable'>) => void;
    role: Role | null;
    allPermissions: { id: Permission, label: string, module: string }[];
}

const RoleModal: React.FC<RoleModalProps> = ({ isOpen, onClose, onSave, role, allPermissions }) => {
    const [formData, setFormData] = useState({
        name: role?.name || '',
        description: role?.description || '',
    });
    const [selectedPermissions, setSelectedPermissions] = useState<Set<Permission>>(new Set(role?.permissions || []));
    
    const groupedPermissions = useMemo(() => {
        // FIX: Explicitly typing the accumulator ('acc') to prevent TypeScript from inferring 'perms' as 'unknown' later.
        return allPermissions.reduce((acc: Record<string, { id: Permission; label: string; module: string }[]>, perm) => {
            const module = perm.module;
            (acc[module] = acc[module] || []).push(perm);
            return acc;
        }, {} as Record<string, { id: Permission; label: string; module: string }[]>);
    }, [allPermissions]);
    
    const handlePermissionToggle = (permissionId: Permission) => {
        setSelectedPermissions(prev => {
            const newSet = new Set(prev);
            if(newSet.has(permissionId)) newSet.delete(permissionId);
            else newSet.add(permissionId);
            return newSet;
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const roleData = {
            ...formData,
            permissions: Array.from(selectedPermissions),
        };
        onSave(role ? { ...roleData, id: role.id, isDeletable: role.isDeletable } : roleData);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4">
            <div className="bg-surface rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col border border-neutral-border">
                <form onSubmit={handleSubmit} className="flex flex-col h-full min-h-0">
                    <div className="p-6 border-b border-neutral-border">
                        <h3 className="text-lg font-bold text-on-surface">{role ? 'Editar' : 'Añadir'} Rol</h3>
                    </div>
                    <div className="p-6 space-y-4 overflow-y-auto flex-grow">
                        <div>
                            <label className="block text-sm font-medium mb-1">Nombre del Rol</label>
                            <input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required className="w-full bg-background border border-neutral-border rounded-md p-2 text-on-surface focus:ring-primary focus:border-primary" disabled={role?.isDeletable === false}/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Descripción</label>
                            <input value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} required className="w-full bg-background border border-neutral-border rounded-md p-2 text-on-surface focus:ring-primary focus:border-primary"/>
                        </div>
                        <div>
                            <h4 className="text-base font-semibold mb-2">Permisos</h4>
                            <div className="space-y-4">
                                {Object.entries(groupedPermissions).map(([moduleName, perms]) => (
                                    <div key={moduleName}>
                                        <h5 className="font-semibold text-secondary mb-2">{moduleName}</h5>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                            {/* FIX: Explicitly type 'perms' to resolve 'map does not exist on unknown' error. */}
                                            {(perms as { id: Permission; label: string; module: string }[]).map(perm => (
                                                <label key={perm.id} className="flex items-center gap-2 p-2 bg-background rounded-md">
                                                    <input type="checkbox" checked={selectedPermissions.has(perm.id)} onChange={() => handlePermissionToggle(perm.id)} className="h-4 w-4 rounded bg-background border-neutral-border text-primary focus:ring-primary" disabled={role?.isDeletable === false} />
                                                    <span className="text-sm">{perm.label}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end items-center p-4 border-t border-neutral-border space-x-4 flex-shrink-0">
                        <button type="button" onClick={onClose} className="py-2 px-4 rounded-lg bg-surface border border-neutral-border hover:bg-primary-light-hover transition-colors">Cancelar</button>
                        <button type="submit" className="py-2 px-4 rounded-lg bg-primary text-white hover:bg-primary-dark-hover transition-colors font-semibold">Guardar Rol</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const PencilIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" /></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;


export default RolesManager;