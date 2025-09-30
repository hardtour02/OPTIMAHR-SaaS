
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { User } from '../types';
import { useCustomize } from '../contexts/CustomizeContext';

const Login: React.FC = () => {
    const [email, setEmail] = useState('admin@hrpro.com');
    const [password, setPassword] = useState('password');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const { settings } = useCustomize();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const response = await api.login(email, password);
            // FIX: The `response` object is a discriminated union. By checking for the failure case `!response.success` first, TypeScript can correctly narrow the type in the `if` block, allowing safe access to the `message` property on failure.
            if (!response.success) {
                setError(response.message);
            } else {
                login(response.user);
                navigate('/');
            }
        } catch (err) {
            setError('Ocurrió un error inesperado.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="dark flex items-center justify-center min-h-screen bg-background font-sans">
            <div className="w-full max-w-md p-8 space-y-8 bg-surface rounded-xl shadow-lg border border-neutral-border">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-on-surface tracking-wider">OPTIMA<span className="font-light text-primary">HR</span></h1>
                    <p className="mt-2 text-on-surface-variant">{settings?.branding.loginWelcomeMessage || 'Inicia sesión para continuar'}</p>
                </div>
                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div>
                        <label className="text-sm font-medium text-on-surface-variant block mb-2">Correo Electrónico</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full px-4 py-2 bg-background border border-neutral-border rounded-lg text-on-surface focus:ring-primary focus:border-primary"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-on-surface-variant block mb-2">Contraseña</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full px-4 py-2 bg-background border border-neutral-border rounded-lg text-on-surface focus:ring-primary focus:border-primary"
                        />
                    </div>
                    {error && <p className="text-sm text-red-400 text-center">{error}</p>}
                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
                        >
                            {loading ? 'Ingresando...' : 'Ingresar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
