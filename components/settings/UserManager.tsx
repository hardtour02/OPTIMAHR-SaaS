import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { User, Role } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import Spinner from '../ui/Spinner';
import ConfirmationModal from '../ui/ConfirmationModal';

const ToggleSwitch: React.FC<{ enabled: boolean; onChange: () => void; }> = ({ enabled, onChange }) => (
    <button
        type="button"
        className={`${enabled ? 'bg-success' : 'bg-on-surface-variant/50'} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface`}
        onClick={onChange}
    >
        <span
            aria-hidden="true"
            className={`${enabled ? 'translate-x-5' : 'translate-x-0'} pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
        />
    </button>
);

const UserManager: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);
    const { user: loggedInUser } = useAuth();

    const fetchUsersAndRoles = async () => {
        try {
            setLoading(true);
            const [usersData, rolesData] = await Promise.all([
                api.getUsers(),
                api.getRoles()
            ]);
            setUsers(usersData);
            setRoles(rolesData);
        } catch (err) {
            setError('No se pudieron cargar los datos.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsersAndRoles();
    }, []);

    const handleToggleStatus = async (user: User) => {
        try {
            await api.toggleUserStatus(user.id);
            fetchUsersAndRoles();
        } catch(err) {
            setError('Error al cambiar el estado del usuario');
        }
    };

    const handleAdd = () => {
        setEditingUser(null);
        setIsModalOpen(true);
    };

    const handleEdit = (user: User) => {
        setEditingUser(user);
        setIsModalOpen(true);
    };
    
    const handleDelete = (user: User) => {
        setUserToDelete(user);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (userToDelete) {
            try {
                await api.deleteUser(userToDelete.id);
                fetchUsersAndRoles();
            } catch (err) {
                 setError('Error al eliminar el usuario.');
            } finally {
                setIsDeleteModalOpen(false);
                setUserToDelete(null);
            }
        }
    };

    const handleSave = async (userData: Omit<User, 'id'> | User) => {
        try {
            if ('id' in userData) {
                await api.updateUser(userData);
            } else {
                await api.addUser(userData as Omit<User, 'id' | 'isActive'>);
            }
            fetchUsersAndRoles();
            setIsModalOpen(false);
        } catch (err) {
            setError('No se pudo guardar el usuario.');
        }
    };
    
    const roleMap = new Map(roles.map(r => [r.id, r.name]));

    return (
        <div className="space-y-4">
             <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-primary">Gestionar Usuarios</h2>
                <button onClick={handleAdd} className="bg-primary text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-primary-dark-hover transition-colors">
                    Añadir Usuario
                </button>
            </div>
            {error && <p className="text-error text-center">{error}</p>}
            {loading ? <div className="h-64"><Spinner /></div> : (
                 <div className="bg-surface rounded-lg border border-neutral-border overflow-hidden">
                    <table className="w-full text-sm text-left text-on-surface-variant">
                        <thead className="text-xs text-white uppercase bg-primary">
                            <tr>
                                <th scope="col" className="px-6 py-3">Correo Electrónico</th>
                                <th scope="col" className="px-6 py-3">Rol</th>
                                <th scope="col" className="px-6 py-3">Estado</th>
                                <th scope="col" className="px-6 py-3 text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user.id} className="bg-surface border-b border-neutral-border hover:bg-primary-light-hover">
                                    <td className="px-6 py-4 font-medium text-on-surface">{user.email}</td>
                                    <td className="px-6 py-4">{roleMap.get(user.roleId) || 'Desconocido'}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                           <ToggleSwitch enabled={user.isActive} onChange={() => handleToggleStatus(user)} />
                                           <span className={user.isActive ? 'text-success' : 'text-error'}>{user.isActive ? 'Activo' : 'Inactivo'}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center space-x-2">
                                        <button onClick={() => handleEdit(user)} className="p-1.5 text-alert hover:bg-on-surface-variant/10 rounded-md"><PencilIcon /></button>
                                        {user.id !== loggedInUser?.id && (
                                            <button onClick={() => handleDelete(user)} className="p-1.5 text-error hover:bg-on-surface-variant/10 rounded-md"><TrashIcon /></button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
             {isModalOpen && <UserModal onClose={() => setIsModalOpen(false)} onSave={handleSave} user={editingUser} roles={roles} />}
             {userToDelete && (
                <ConfirmationModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => setUserToDelete(null)}
                    onConfirm={handleConfirmDelete}
                    title="Confirmar Eliminación"
                    message={`¿Estás seguro de que deseas eliminar al usuario ${userToDelete.email}?`}
                />
            )}
        </div>
    );
};

// --- Modal Component ---
interface UserModalProps {
    onClose: () => void;
    onSave: (userData: Omit<User, 'id'> | User) => void;
    user: User | null;
    roles: Role[];
}
const UserModal: React.FC<UserModalProps> = ({ onClose, onSave, user, roles }) => {
    const [formData, setFormData] = useState({
        email: user?.email || '',
        roleId: user?.roleId || (roles[1]?.id || ''),
        password: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const dataToSend: any = { ...formData };
        if (!dataToSend.password) {
            delete dataToSend.password;
        }

        onSave(user ? { ...dataToSend, id: user.id, isActive: user.isActive } : { ...dataToSend });
    };

    return (
         <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4">
            <div className="bg-surface rounded-lg shadow-xl w-full max-w-lg border border-neutral-border">
                <form onSubmit={handleSubmit}>
                    <div className="p-6">
                        <h3 className="text-lg font-bold text-on-surface mb-4">{user ? 'Editar' : 'Añadir'} Usuario</h3>
                        <div className="space-y-4">
                             <div>
                                <label className="block text-sm font-medium text-on-surface-variant mb-1">Correo Electrónico</label>
                                <input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full bg-background border border-neutral-border rounded-md p-2 text-on-surface focus:ring-primary focus:border-primary" />
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-on-surface-variant mb-1">Contraseña</label>
                                <input type="password" name="password" value={formData.password} placeholder={user ? 'Dejar en blanco para no cambiar' : ''} required={!user} className="w-full bg-background border border-neutral-border rounded-md p-2 text-on-surface focus:ring-primary focus:border-primary" />
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-on-surface-variant mb-1">Rol</label>
                                <select name="roleId" value={formData.roleId} onChange={handleChange} required className="w-full bg-background border border-neutral-border rounded-md p-2 text-on-surface focus:ring-primary focus:border-primary">
                                    {roles.filter(r => r.name !== 'Admin').map(role => (
                                        <option key={role.id} value={role.id}>{role.name}</option>
                                    ))}
                                </select>
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
}

// Icons
const PencilIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" /></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;

export default UserManager;