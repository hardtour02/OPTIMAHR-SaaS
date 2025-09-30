import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../services/api';
import { CustomizeSettings, CustomTheme } from '../../types';
import Spinner from '../ui/Spinner';
import { useCustomize } from '../../contexts/CustomizeContext';
import ConfirmationModal from '../ui/ConfirmationModal';
import { generatePalettes } from '../../utils/colorUtils';
import ThemePreview from './ThemePreview';

type SubTab = 'branding' | 'theme' | 'layout' | 'globalFormat' | 'tables' | 'notifications' | 'accessibility';

const PALETTE_PREVIEWS = {
    dark: {
      default: { name: 'Predeterminado', primary: '#1E88E5', secondary: '#43A047', background: '#121212' },
      variant1: { name: 'Carmesí', primary: '#dc2626', secondary: '#f43f5e', background: '#171717' },
      variant2: { name: 'Ámbar', primary: '#f59e0b', secondary: '#f97316', background: '#1c1917' },
    },
    light: {
      default: { name: 'Predeterminado', primary: '#1E88E5', secondary: '#43A047', background: '#F5F5F5' },
      variant1: { name: 'Cielo', primary: '#0ea5e9', secondary: '#06b6d4', background: '#f0f9ff' },
      variant2: { name: 'Fucsia', primary: '#c026d3', secondary: '#ec4899', background: '#fdf2f8' },
    }
};

const CustomizeManager: React.FC = () => {
    const [activeTab, setActiveTab] = useState<SubTab>('branding');
    const [settings, setSettings] = useState<CustomizeSettings | null>(null);
    const [initialSettings, setInitialSettings] = useState<CustomizeSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');
    const { refetchSettings } = useCustomize();
    const importFileRef = useRef<HTMLInputElement>(null);

    const [isRevertModalOpen, setIsRevertModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [importPreview, setImportPreview] = useState<string | null>(null);
    const [importedSettings, setImportedSettings] = useState<CustomizeSettings | null>(null);
    

    useEffect(() => {
        api.getCustomizeSettings().then(data => {
            setSettings(data);
            setInitialSettings(JSON.parse(JSON.stringify(data)));
        }).catch(() => {
            setError('Error al cargar la configuración.');
        }).finally(() => {
            setLoading(false);
        });
    }, []);

    const handleSave = async () => {
        if (!settings) return;
        setIsSaving(true);
        setError('');
        try {
            await api.updateCustomizeSettings(settings);
            setInitialSettings(JSON.parse(JSON.stringify(settings)));
            refetchSettings(); // Refetch settings globally
        } catch (err) {
            setError('Error al guardar los cambios.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleRevert = async () => {
        setSettings(JSON.parse(JSON.stringify(initialSettings)));
        setIsRevertModalOpen(false);
    };

    const handleExport = async () => {
        try {
            const jsonString = await api.exportCustomizeSettings();
            const blob = new Blob([jsonString], {type: "application/json"});
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `hrpro-settings-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (err) {
            setError("Error al exportar la configuración.");
        }
    };
    
    const handleImportClick = () => {
        importFileRef.current?.click();
    };

    const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = async (event) => {
                const content = event.target?.result as string;
                try {
                    const parsedSettings = await api.importCustomizeSettings(content);
                    setImportedSettings(parsedSettings);
                    setImportPreview(JSON.stringify(parsedSettings, null, 2));
                    setIsImportModalOpen(true);
                } catch (err) {
                    setError("El archivo de importación es inválido o está corrupto.");
                }
            };
            reader.readAsText(file);
        }
        e.target.value = ''; // Reset input
    };
    
    const handleApplyImport = () => {
        if(importedSettings) {
            setSettings(importedSettings);
            setIsImportModalOpen(false);
            setImportPreview(null);
            setImportedSettings(null);
        }
    };

    const TABS = [
        { id: 'branding', label: 'Branding', render: () => <BrandingSettings settings={settings!} setSettings={setSettings} /> },
        { id: 'theme', label: 'Temas y Estilos', render: () => <ThemeSettings settings={settings!} setSettings={setSettings} /> },
        { id: 'layout', label: 'Layout y Navegación', render: () => <LayoutSettings settings={settings!} setSettings={setSettings} /> },
        { id: 'globalFormat', label: 'Formato Global', render: () => <GlobalFormatSettings settings={settings!} setSettings={setSettings} /> },
        { id: 'tables', label: 'Tablas y Listados', render: () => <TableSettings settings={settings!} setSettings={setSettings} /> },
        { id: 'notifications', label: 'Notificaciones', render: () => <NotificationSettings settings={settings!} setSettings={setSettings} /> },
        { id: 'accessibility', label: 'Accesibilidad & Export/Import', render: () => <AccessibilitySettings settings={settings!} setSettings={setSettings} onExport={handleExport} onImport={handleImportClick} onRevert={() => setIsRevertModalOpen(true)} /> },
    ];

    if (loading || !settings) return <div className="h-64"><Spinner /></div>;

    return (
        <div className="space-y-6">
             <input type="file" ref={importFileRef} onChange={handleFileImport} className="hidden" accept="application/json" />
             <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-on-surface">Personalización del Sistema</h2>
                <button onClick={handleSave} disabled={isSaving} className="bg-primary text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-primary-dark-hover disabled:opacity-50">
                    {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                </button>
            </div>
            {error && <p className="text-error text-center bg-error/10 p-2 rounded-md">{error}</p>}
            
             <div className="flex justify-start items-center border-b border-neutral-border">
                <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Sub-Tabs">
                    {TABS.map(tab => (
                         <button key={tab.id} onClick={() => setActiveTab(tab.id as SubTab)} className={`${activeTab === tab.id ? 'border-secondary text-secondary' : 'border-transparent text-on-surface-variant'} whitespace-nowrap pb-2 px-1 border-b-2 font-medium text-sm`}>{tab.label}</button>
                    ))}
                </nav>
            </div>
            
            <div className="pt-4">
                {TABS.find(t => t.id === activeTab)?.render()}
            </div>

            <ConfirmationModal isOpen={isRevertModalOpen} onClose={() => setIsRevertModalOpen(false)} onConfirm={handleRevert} title="Revertir Cambios" message="¿Seguro que quieres descartar todos los cambios no guardados y volver a la última configuración guardada?" />
            {isImportModalOpen && (
                 <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4">
                    <div className="bg-surface rounded-lg shadow-xl w-full max-w-2xl border border-neutral-border max-h-[80vh] flex flex-col">
                        <div className="p-4 border-b border-neutral-border"><h3 className="text-lg font-bold">Vista Previa de Importación</h3></div>
                        <div className="p-4 overflow-auto"><pre className="text-xs bg-background p-2 rounded">{importPreview}</pre></div>
                        <div className="flex justify-end p-4 border-t border-neutral-border space-x-4">
                            <button onClick={() => setIsImportModalOpen(false)} className="py-2 px-4 rounded-lg bg-surface border border-neutral-border hover:bg-primary-light-hover">Cancelar</button>
                            <button onClick={handleApplyImport} className="py-2 px-4 rounded-lg bg-primary font-semibold">Aplicar Configuración</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- Child Components for each tab ---
const BrandingSettings = ({ settings, setSettings }: { settings: CustomizeSettings, setSettings: React.Dispatch<React.SetStateAction<CustomizeSettings | null>> }) => {
    const handleBrandingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setSettings(prev => prev && { ...prev, branding: { ...prev.branding, [name]: value } });
    };
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, fieldName: keyof CustomizeSettings['branding']) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) return;
            const reader = new FileReader();
            reader.onloadend = () => {
                setSettings(prev => prev && { ...prev, branding: { ...prev.branding, [fieldName]: reader.result as string } });
            };
            reader.readAsDataURL(file);
        }
    };
    return (
        <div className="space-y-6">
            <h3 className="text-xl font-bold text-on-surface">Logos y Favicon</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ImageUpload fieldName="logoUrlMain" label="Logo Principal" currentImage={settings.branding.logoUrlMain} onChange={handleFileUpload} />
                <ImageUpload fieldName="logoUrlAlt" label="Logo Alternativo" currentImage={settings.branding.logoUrlAlt} onChange={handleFileUpload} />
                <ImageUpload fieldName="logoUrlPdf" label="Logo para PDF" currentImage={settings.branding.logoUrlPdf} onChange={handleFileUpload} />
                <ImageUpload fieldName="faviconUrl" label="Favicon" currentImage={settings.branding.faviconUrl} onChange={handleFileUpload} />
            </div>
            <h3 className="text-xl font-bold text-on-surface">Textos del Sistema</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <TextInput label="Título del Header" name="headerTitle" value={settings.branding.headerTitle} onChange={handleBrandingChange} helpText="Usa {userRole} para el rol."/>
                 <TextInput label="Subtítulo del Header" name="headerSubtitle" value={settings.branding.headerSubtitle} onChange={handleBrandingChange} />
                 <TextInput label="Texto del Footer" name="footerText" value={settings.branding.footerText} onChange={handleBrandingChange} />
                 <TextInput label="Mensaje de Bienvenida (Login)" name="loginWelcomeMessage" value={settings.branding.loginWelcomeMessage} onChange={handleBrandingChange} />
            </div>
        </div>
    )
}

const ThemeSettings = ({ settings, setSettings }: { settings: CustomizeSettings, setSettings: React.Dispatch<React.SetStateAction<CustomizeSettings | null>> }) => {
    const [primaryColor, setPrimaryColor] = useState('#1E88E5');
    const [newThemeName, setNewThemeName] = useState('');
    const [generatedPalettes, setGeneratedPalettes] = useState<{ light: any, dark: any } | null>(null);
    const [themeToDelete, setThemeToDelete] = useState<CustomTheme | null>(null);
    
    const handleThemeChange = (field: keyof CustomizeSettings['theme'], value: string) => {
        setSettings(prev => prev && { ...prev, theme: { ...prev.theme, [field]: value } });
    };
    
    const handleGenerate = () => {
        if (/^#[0-9A-F]{6}$/i.test(primaryColor)) {
            const palettes = generatePalettes(primaryColor);
            setGeneratedPalettes(palettes);
        } else {
            alert("Por favor, ingrese un color hexadecimal válido (ej. #1E88E5).");
        }
    };

    const handleSaveTheme = () => {
        if (!generatedPalettes || !newThemeName.trim()) return;
        const newTheme: CustomTheme = {
            id: `custom_${Date.now()}`,
            name: newThemeName.trim(),
            palettes: generatedPalettes,
        };
        setSettings(prev => {
            if (!prev) return null;
            const updatedThemes = [...(prev.customThemes || []), newTheme];
            return { ...prev, customThemes: updatedThemes };
        });
        setNewThemeName('');
        setGeneratedPalettes(null);
    };

    const handleDeleteTheme = () => {
        if (!themeToDelete) return;
        setSettings(prev => {
            if (!prev) return null;
            const newSettings = { ...prev };
            newSettings.customThemes = newSettings.customThemes.filter(t => t.id !== themeToDelete.id);
            // If the deleted theme was active, fall back to default
            if (newSettings.theme.colorVariant === themeToDelete.id) {
                newSettings.theme.colorVariant = 'default';
            }
            return newSettings;
        });
        setThemeToDelete(null);
    };

     return (
        <div className="space-y-8">
            <div>
                <h3 className="text-xl font-bold text-on-surface">Modo de Apariencia</h3>
                <div className="mt-2 flex items-center gap-4 p-4 bg-background rounded-lg border border-neutral-border">
                    <RadioInput name="themeMode" value="light" checked={settings.theme.mode === 'light'} onChange={() => handleThemeChange('mode', 'light')} label="Claro" />
                    <RadioInput name="themeMode" value="dark" checked={settings.theme.mode === 'dark'} onChange={() => handleThemeChange('mode', 'dark')} label="Oscuro" />
                </div>
            </div>
            <div>
                 <h3 className="text-xl font-bold text-on-surface">Selección de Tema</h3>
                 <div className="mt-2">
                    <PalettePicker 
                        palettes={PALETTE_PREVIEWS[settings.theme.mode]} 
                        customThemes={settings.customThemes || []}
                        currentVariant={settings.theme.colorVariant} 
                        onSelect={(v) => handleThemeChange('colorVariant', v)} 
                        onDelete={setThemeToDelete}
                    />
                 </div>
            </div>
             <div className="space-y-4 pt-4 border-t border-neutral-border">
                <h3 className="text-xl font-bold text-on-surface">Creador de Tema Corporativo</h3>
                <div className="bg-background p-4 rounded-lg border border-neutral-border space-y-4">
                    <div className="flex flex-col md:flex-row gap-4 items-end">
                        <div className="flex-grow">
                            <label className="block text-sm font-medium text-on-surface-variant mb-1">1. Ingrese Color Principal (HEX)</label>
                            <div className="flex items-center gap-2">
                                <input type="color" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} className="h-10 w-10 p-1 bg-background border border-neutral-border rounded-md cursor-pointer"/>
                                <input type="text" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} placeholder="#1E88E5" className="w-full bg-background border border-neutral-border rounded-md p-2 h-10"/>
                            </div>
                        </div>
                        <button onClick={handleGenerate} className="bg-secondary text-white font-semibold py-2 px-6 rounded-lg shadow-md hover:bg-secondary-dark-hover h-10 w-full md:w-auto">
                            2. Generar y Previsualizar
                        </button>
                    </div>
                     {generatedPalettes && (
                        <div className="border-t border-neutral-border pt-4 space-y-4">
                             <ThemePreview palettes={generatedPalettes} title="Vista Previa del Tema Generado" />
                             <div className="flex flex-col md:flex-row gap-4 items-end">
                                <div className="flex-grow">
                                    <label className="block text-sm font-medium text-on-surface-variant mb-1">3. Nombre del Tema</label>
                                    <input value={newThemeName} onChange={e => setNewThemeName(e.target.value)} placeholder="Ej: Tema Azul Corporativo" required className="w-full bg-background border border-neutral-border rounded-md p-2 h-10"/>
                                </div>
                                <button onClick={handleSaveTheme} disabled={!newThemeName.trim()} className="bg-primary text-white font-semibold py-2 px-6 rounded-lg shadow-md hover:bg-primary-dark-hover h-10 w-full md:w-auto disabled:opacity-50">
                                    4. Guardar Tema
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            {themeToDelete && <ConfirmationModal isOpen={!!themeToDelete} onClose={() => setThemeToDelete(null)} onConfirm={handleDeleteTheme} title="Confirmar Eliminación" message={`¿Seguro que quieres eliminar el tema "${themeToDelete.name}"?`} />}
        </div>
    );
}

const LayoutSettings = ({ settings, setSettings }: { settings: CustomizeSettings, setSettings: React.Dispatch<React.SetStateAction<CustomizeSettings | null>> }) => {
     const handleLayoutChange = (field: keyof CustomizeSettings['layout'], value: boolean) => {
        setSettings(prev => prev && { ...prev, layout: { ...prev.layout, [field]: value } });
    };
    return (
         <div className="space-y-6">
            <div>
                <h3 className="text-xl font-bold text-on-surface">Barra Lateral (Sidebar)</h3>
                <div className="mt-2 p-4 bg-background rounded-lg border border-neutral-border">
                    <p className="block text-sm font-medium text-on-surface-variant mb-2">Estado por defecto</p>
                    <div className="flex items-center gap-4">
                        <RadioInput name="sidebarDefault" value="expanded" checked={!settings.layout.sidebarDefaultCollapsed} onChange={() => handleLayoutChange('sidebarDefaultCollapsed', false)} label="Expandido" />
                        <RadioInput name="sidebarDefault" value="collapsed" checked={settings.layout.sidebarDefaultCollapsed} onChange={() => handleLayoutChange('sidebarDefaultCollapsed', true)} label="Colapsado" />
                    </div>
                </div>
            </div>
            <div>
                <h3 className="text-xl font-bold text-on-surface">Animaciones y Visibilidad</h3>
                 <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <ToggleControl label="Animaciones UI" enabled={settings.layout.animationsEnabled} onToggle={() => handleLayoutChange('animationsEnabled', !settings.layout.animationsEnabled)} />
                    <ToggleControl label="Header Visible" enabled={settings.layout.headerVisible} onToggle={() => handleLayoutChange('headerVisible', !settings.layout.headerVisible)} />
                    <ToggleControl label="Footer Visible" enabled={settings.layout.footerVisible} onToggle={() => handleLayoutChange('footerVisible', !settings.layout.footerVisible)} />
                 </div>
            </div>
        </div>
    );
};

const GlobalFormatSettings = ({ settings, setSettings }: { settings: CustomizeSettings, setSettings: React.Dispatch<React.SetStateAction<CustomizeSettings | null>> }) => {
    const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
        const { name, value } = e.target;
        const isNumber = ['decimalPlaces'].includes(name);
        setSettings(prev => prev && { ...prev, globalFormat: { ...prev.globalFormat, [name]: isNumber ? parseInt(value) : value } });
    };
    const timezones = ['America/Caracas', 'America/Bogota', 'America/New_York', 'Europe/Madrid'];
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <SelectInput label="Formato de Fecha" name="dateFormat" value={settings.globalFormat.dateFormat} onChange={handleChange} options={[{v:'DD/MM/YYYY'},{v:'MM/DD/YYYY'},{v:'YYYY-MM-DD'}]} />
            <SelectInput label="Formato de Hora" name="timeFormat" value={settings.globalFormat.timeFormat} onChange={handleChange} options={[{v:'12h'},{v:'24h'}]} />
            <SelectInput label="Zona Horaria" name="timezone" value={settings.globalFormat.timezone} onChange={handleChange} options={timezones.map(tz => ({v: tz}))} />
            <SelectInput label="Estilo de Moneda" name="currencyStyle" value={settings.globalFormat.currencyStyle} onChange={handleChange} options={[{v:'symbol_before', l:'Símbolo antes'}, {v:'symbol_after', l:'Símbolo después'}]} />
            <SelectInput label="Separador Decimal" name="decimalSeparator" value={settings.globalFormat.decimalSeparator} onChange={handleChange} options={[{v:'.', l:'Punto (.)'},{v:',', l:'Coma (,)'}]} />
            <SelectInput label="Separador de Miles" name="thousandsSeparator" value={settings.globalFormat.thousandsSeparator} onChange={handleChange} options={[{v:'.', l:'Punto (.)'},{v:',', l:'Coma (,)'}, {v:' ', l:'Espacio ( )'}]} />
            <TextInput label="Lugares Decimales" name="decimalPlaces" type="number" value={String(settings.globalFormat.decimalPlaces)} onChange={handleChange}/>
            <TextInput label="Unidad por Defecto" name="defaultUnit" value={settings.globalFormat.defaultUnit} onChange={handleChange}/>
        </div>
    );
}

const TableSettings = ({ settings, setSettings }: { settings: CustomizeSettings, setSettings: React.Dispatch<React.SetStateAction<CustomizeSettings | null>> }) => {
     const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        const isNumber = ['defaultPageSize'].includes(name);
        setSettings(prev => prev && { ...prev, tables: { ...prev.tables, [name]: isNumber ? parseInt(value) : value } });
    };
    const handleToggle = () => setSettings(prev => prev && { ...prev, tables: { ...prev.tables, showExport: !prev.tables.showExport }});
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <SelectInput label="Densidad de Fila" name="density" value={settings.tables.density} onChange={handleChange} options={[{v: 'compacta'}, {v: 'media'}, {v: 'amplia'}]} />
            <SelectInput label="Estilo de Fila" name="rowStyle" value={settings.tables.rowStyle} onChange={handleChange} options={[{v: 'plain', l:'Plano'}, {v: 'striped', l:'Alternado'}]} />
            <SelectInput label="Paginación por Defecto" name="defaultPageSize" value={String(settings.tables.defaultPageSize)} onChange={handleChange} options={[{v:'10'},{v:'20'},{v:'50'}]} />
            <ToggleControl label="Mostrar Botón de Exportar" enabled={settings.tables.showExport} onToggle={handleToggle} />
        </div>
    )
}

const NotificationSettings = ({ settings, setSettings }: { settings: CustomizeSettings, setSettings: React.Dispatch<React.SetStateAction<CustomizeSettings | null>> }) => {
    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        setSettings(prev => prev && { ...prev, notifications: { ...prev.notifications, [name]: value } });
    };
     const handleToggle = (field: keyof typeof settings.notifications.enabledModules) => {
        setSettings(prev => prev && { ...prev, notifications: { ...prev.notifications, enabledModules: {...prev.notifications.enabledModules, [field]: !prev.notifications.enabledModules[field] } } });
    };
     const handleSoundToggle = () => setSettings(prev => prev && { ...prev, notifications: { ...prev.notifications, soundEnabled: !prev.notifications.soundEnabled }});

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <SelectInput label="Posición" name="position" value={settings.notifications.position} onChange={handleSelectChange} options={[{v:'top-right'}, {v:'top-left'}, {v:'bottom-right'}, {v:'bottom-left'}]} />
                <ToggleControl label="Activar Sonido" enabled={settings.notifications.soundEnabled} onToggle={handleSoundToggle} />
                <SelectInput label="Sonido de Alerta" name="soundName" value={settings.notifications.soundName} onChange={handleSelectChange} options={[{v:'default'},{v:'chime'},{v:'ding'}]} />
            </div>
             <div>
                <h3 className="text-xl font-bold text-on-surface">Activación por Módulo</h3>
                <div className="mt-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <ToggleControl label="Inventario" enabled={settings.notifications.enabledModules.inventory} onToggle={() => handleToggle('inventory')} />
                    <ToggleControl label="Préstamos" enabled={settings.notifications.enabledModules.loans} onToggle={() => handleToggle('loans')} />
                    <ToggleControl label="Contratos" enabled={settings.notifications.enabledModules.contracts} onToggle={() => handleToggle('contracts')} />
                    <ToggleControl label="Cumpleaños" enabled={settings.notifications.enabledModules.birthdays} onToggle={() => handleToggle('birthdays')} />
                </div>
            </div>
        </div>
    )
}

const AccessibilitySettings = ({ settings, setSettings, onExport, onImport, onRevert }: { settings: CustomizeSettings, setSettings: React.Dispatch<React.SetStateAction<CustomizeSettings | null>>, onExport:()=>void, onImport:()=>void, onRevert:()=>void }) => {
    const handleSelectChange = (field: keyof CustomizeSettings['accessibility'], value: any) => {
         setSettings(prev => prev && { ...prev, accessibility: { ...prev.accessibility, [field]: value } });
    };
    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-xl font-bold text-on-surface">Lectura</h3>
                 <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-background rounded-lg border border-neutral-border">
                        <p className="block text-sm font-medium text-on-surface-variant mb-2">Tamaño de Fuente Global</p>
                        <div className="flex items-center gap-4">
                            <RadioInput name="fontSize" value="small" checked={settings.accessibility.fontSize === 'small'} onChange={() => handleSelectChange('fontSize', 'small')} label="Pequeño" />
                            <RadioInput name="fontSize" value="medium" checked={settings.accessibility.fontSize === 'medium'} onChange={() => handleSelectChange('fontSize', 'medium')} label="Mediano" />
                            <RadioInput name="fontSize" value="large" checked={settings.accessibility.fontSize === 'large'} onChange={() => handleSelectChange('fontSize', 'large')} label="Grande" />
                        </div>
                    </div>
                    <ToggleControl label="Modo de Alto Contraste" enabled={settings.accessibility.highContrast} onToggle={() => handleSelectChange('highContrast', !settings.accessibility.highContrast)} />
                </div>
            </div>
            <div>
                 <h3 className="text-xl font-bold text-on-surface">Gestión de Configuración</h3>
                 <div className="mt-2 p-4 bg-background rounded-lg border border-neutral-border flex flex-col md:flex-row gap-4 justify-between items-center">
                    <p className="text-on-surface-variant text-sm">Exporta, importa o revierte tus configuraciones de personalización.</p>
                    <div className="flex gap-2 flex-wrap">
                        <button onClick={onImport} className="bg-secondary text-white font-semibold py-2 px-4 rounded-lg text-sm">Importar</button>
                        <button onClick={onExport} className="bg-info text-white font-semibold py-2 px-4 rounded-lg text-sm">Exportar</button>
                        <button onClick={onRevert} className="bg-error text-white font-semibold py-2 px-4 rounded-lg text-sm">Revertir</button>
                    </div>
                 </div>
            </div>
        </div>
    )
}


// --- Generic UI Helper Components ---
const TextInput: React.FC<{label: string, name: string, value: string, onChange: (e: any) => void, helpText?: string, type?: string}> = ({label, name, value, onChange, helpText, type="text"}) => (
    <div>
        <label className="block text-sm font-medium text-on-surface-variant mb-1">{label}</label>
        <input type={type} name={name} value={value} onChange={onChange} className="w-full bg-background p-2 rounded-md border border-neutral-border" />
        {helpText && <p className="text-xs text-on-surface-variant/80 mt-1">{helpText}</p>}
    </div>
);
const SelectInput: React.FC<{label:string, name:string, value:string, onChange:(e:any)=>void, options: {v:string, l?:string}[]}> = ({label,name,value,onChange,options}) => (
    <div>
        <label className="block text-sm font-medium text-on-surface-variant mb-1">{label}</label>
        <select name={name} value={value} onChange={onChange} className="w-full bg-background p-2 rounded-md border border-neutral-border capitalize">
            {options.map(opt => <option key={opt.v} value={opt.v}>{opt.l || opt.v}</option>)}
        </select>
    </div>
);
const ImageUpload: React.FC<{label: string, fieldName: any, currentImage: string, onChange: (e: any, f:any) => void}> = ({label, fieldName, currentImage, onChange}) => (
    <div className="bg-background p-4 rounded-lg border border-neutral-border">
        <label className="block text-sm font-medium text-on-surface-variant mb-2">{label}</label>
        <div className="flex items-center gap-4">
            <img src={currentImage || 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'} alt={label} className="h-16 w-32 bg-background p-1 rounded object-contain border border-neutral-border" />
            <input type="file" onChange={(e) => onChange(e, fieldName)} accept="image/png, image/svg+xml, image/jpeg" className="text-sm text-on-surface-variant file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/20 file:text-primary hover:file:bg-primary/30" />
        </div>
    </div>
);
const ToggleControl: React.FC<{ label: string; enabled: boolean; onToggle: () => void }> = ({ label, enabled, onToggle }) => (
    <div className="bg-background p-4 rounded-lg border border-neutral-border flex justify-between items-center">
        <label className="font-medium text-on-surface">{label}</label>
        <button type="button" className={`${enabled ? 'bg-primary' : 'bg-on-surface-variant/50'} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors`} onClick={onToggle} aria-pressed={enabled} >
            <span aria-hidden="true" className={`${enabled ? 'translate-x-5' : 'translate-x-0'} pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition`} />
        </button>
    </div>
);
const RadioInput: React.FC<{name:string, value:string, checked:boolean, onChange:(e:any)=>void, label:string}> = ({name, value, checked, onChange, label}) => (
    <label className="flex items-center gap-2 cursor-pointer">
        <input type="radio" name={name} value={value} checked={checked} onChange={onChange} className="form-radio h-4 w-4 text-primary bg-background border-neutral-border focus:ring-primary"/>
        <span>{label}</span>
    </label>
);
const PalettePicker: React.FC<{ palettes: any, customThemes: CustomTheme[], currentVariant: string, onSelect: (v: string) => void, onDelete: (t: CustomTheme) => void }> = ({ palettes, customThemes, currentVariant, onSelect, onDelete }) => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.entries(palettes).map(([variantKey, colors]: [string, any]) => (
            <div key={variantKey} onClick={() => onSelect(variantKey)} className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${currentVariant === variantKey ? 'border-primary shadow-lg' : 'border-neutral-border hover:border-on-surface-variant/50'}`} >
                <p className="font-semibold mb-2 capitalize">{colors.name}</p>
                <div className="flex gap-2 h-10">
                    <div className="w-1/3 rounded" style={{ backgroundColor: colors.primary }} title="Primario"></div>
                    <div className="w-1/3 rounded" style={{ backgroundColor: colors.secondary }} title="Secundario"></div>
                    <div className="w-1/3 rounded border border-neutral-border" style={{ backgroundColor: colors.background }} title="Fondo"></div>
                </div>
            </div>
        ))}
         {customThemes.map((theme) => {
            const colors = theme.palettes.dark; // Show dark preview for consistency
            return (
                <div key={theme.id} onClick={() => onSelect(theme.id)} className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all ${currentVariant === theme.id ? 'border-primary shadow-lg' : 'border-neutral-border hover:border-on-surface-variant/50'}`} >
                    <button type="button" onClick={(e) => { e.stopPropagation(); onDelete(theme); }} className="absolute top-1 right-1 p-1 text-error hover:bg-error/20 rounded-full text-xs">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                    <p className="font-semibold mb-2 capitalize">{theme.name}</p>
                    <div className="flex gap-2 h-10">
                        <div className="w-1/3 rounded" style={{ backgroundColor: `rgb(${colors['--color-primary']})` }} title="Primario"></div>
                        <div className="w-1/3 rounded" style={{ backgroundColor: `rgb(${colors['--color-secondary']})` }} title="Secundario"></div>
                        <div className="w-1/3 rounded border border-neutral-border" style={{ backgroundColor: `rgb(${colors['--color-background']})` }} title="Fondo"></div>
                    </div>
                </div>
            )
         })}
    </div>
);

export default CustomizeManager;