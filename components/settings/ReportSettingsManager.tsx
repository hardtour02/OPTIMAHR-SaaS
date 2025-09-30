import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../services/api';
import { ReportDefinition, ReportSettings, ReportCategoryKey } from '../../types';
import Spinner from '../ui/Spinner';

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

const ReportSettingsManager: React.FC = () => {
    const [definitions, setDefinitions] = useState<Record<string, ReportDefinition[]>>({});
    const [settings, setSettings] = useState<ReportSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [defsData, settingsData] = await Promise.all([
                api.getAllReportDefinitions(),
                api.getReportSettings(),
            ]);
            setDefinitions(defsData);
            setSettings(settingsData);
        } catch (err) {
            setError('No se pudo cargar la configuración de reportes.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleSettingsChange = async (newSettings: ReportSettings) => {
        setSettings(newSettings);
        try {
            await api.updateReportSettings(newSettings);
        } catch (err) {
            setError('Error al guardar el cambio.');
            fetchData(); // Revert on error
        }
    };
    
    const handleToggleReport = (reportId: string) => {
        if (!settings) return;
        const newSettings = { ...settings };
        newSettings.reports[reportId].isActive = !newSettings.reports[reportId].isActive;
        handleSettingsChange(newSettings);
    };

    const handlePdfConfigChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        if (!settings) return;
        const { name, value } = e.target;
        const newSettings = { ...settings, pdf: { ...settings.pdf, [name]: value } };
        handleSettingsChange(newSettings);
    };


    if (loading) return <div className="h-64"><Spinner /></div>;
    if (error) return <p className="text-red-400 text-center">{error}</p>;
    if (!settings || !definitions) return null;
    
    const CATEGORIES: { key: ReportCategoryKey, label: string }[] = [
        { key: 'employees', label: 'Empleados' },
        { key: 'loans', label: 'Préstamos' },
        { key: 'inventory', label: 'Inventario' },
        { key: 'system', label: 'Sistema / Auditoría' },
    ];

    return (
        <div className="space-y-8">
            <div className="space-y-6">
                <div>
                    <h2 className="text-2xl font-bold text-on-surface">Visibilidad de Reportes</h2>
                    <p className="text-on-surface-variant mt-1">Active o desactive los reportes que estarán disponibles en la página de Reportes.</p>
                </div>

                <div className="space-y-6">
                    {CATEGORIES.map(cat => (
                        <div key={cat.key}>
                            <h3 className="text-xl font-semibold text-primary mb-3 border-b border-slate-700 pb-2">{cat.label}</h3>
                            <div className="space-y-3">
                                {definitions[cat.key]?.map(report => (
                                    <div key={report.id} className="bg-slate-800/50 p-4 rounded-lg flex justify-between items-center border border-slate-700">
                                        <span className="font-medium text-on-surface">{report.label}</span>
                                        <div className="flex items-center gap-2">
                                            <ToggleSwitch
                                                enabled={settings.reports[report.id]?.isActive || false}
                                                onChange={() => handleToggleReport(report.id)}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="space-y-6">
                 <div>
                    <h2 className="text-2xl font-bold text-on-surface">Personalización de PDF</h2>
                    <p className="text-on-surface-variant mt-1">Configure la apariencia de los reportes exportados en PDF.</p>
                </div>
                <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-on-surface-variant mb-1">Texto del Encabezado</label>
                            <input type="text" name="headerText" value={settings.pdf.headerText} onChange={handlePdfConfigChange} className="w-full bg-slate-700 p-2 rounded-md" />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-on-surface-variant mb-1">Texto del Pie de Página</label>
                            <input type="text" name="footerText" value={settings.pdf.footerText} onChange={handlePdfConfigChange} className="w-full bg-slate-700 p-2 rounded-md" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-on-surface-variant mb-1">URL del Logo (opcional)</label>
                        <input type="text" name="logoUrl" value={settings.pdf.logoUrl} onChange={handlePdfConfigChange} placeholder="https://..." className="w-full bg-slate-700 p-2 rounded-md" />
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-on-surface-variant mb-1">Orientación</label>
                            <select name="orientation" value={settings.pdf.orientation} onChange={handlePdfConfigChange} className="w-full bg-slate-700 p-2 rounded-md">
                                <option value="portrait">Vertical (Portrait)</option>
                                <option value="landscape">Horizontal (Landscape)</option>
                            </select>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-on-surface-variant mb-1">Tamaño de Página</label>
                            <select name="size" value={settings.pdf.size} onChange={handlePdfConfigChange} className="w-full bg-slate-700 p-2 rounded-md">
                                <option value="A4">A4</option>
                                <option value="Letter">Carta (Letter)</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReportSettingsManager;