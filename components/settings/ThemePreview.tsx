import React from 'react';
import { PaletteColors } from '../../types';

interface ThemePreviewProps {
  palettes: {
    light: PaletteColors;
    dark: PaletteColors;
  };
  title: string;
}

const PreviewComponent: React.FC<{ palette: PaletteColors; title: string }> = ({ palette, title }) => {
    const style: React.CSSProperties = {};
    for (const [key, value] of Object.entries(palette)) {
        style[key as any] = value;
    }

    return (
        <div style={style} className="p-4 rounded-lg border border-neutral-border bg-background text-on-surface">
            <h4 className="font-bold mb-4 text-on-surface">{title}</h4>
            <div className="space-y-4">
                {/* Buttons */}
                <div className="flex flex-wrap gap-2">
                    <button className="bg-primary text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-primary-dark-hover">Botón Primario</button>
                    <button className="bg-secondary text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-secondary-dark-hover">Botón Secundario</button>
                     <button className="bg-error text-white font-semibold py-2 px-4 rounded-lg">Error</button>
                </div>
                {/* Alerts */}
                <div className="space-y-2">
                    <div className="p-2 rounded-md bg-success/20 text-success text-sm">Alerta de éxito.</div>
                    <div className="p-2 rounded-md bg-alert/20 text-alert text-sm">Alerta de advertencia.</div>
                </div>
                {/* Table */}
                <div className="overflow-hidden border border-neutral-border rounded-lg">
                    <table className="w-full text-sm">
                        <thead className="bg-primary text-white">
                            <tr><th className="p-2 text-left">Encabezado</th><th className="p-2 text-left">de Tabla</th></tr>
                        </thead>
                        <tbody>
                            <tr className="border-b border-neutral-border bg-surface hover:bg-primary-light-hover"><td className="p-2">Fila de ejemplo</td><td className="p-2">con datos.</td></tr>
                            <tr className="bg-table-row-striped hover:bg-primary-light-hover"><td className="p-2">Otra fila</td><td className="p-2">de ejemplo.</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};


const ThemePreview: React.FC<ThemePreviewProps> = ({ palettes, title }) => {
  return (
    <div>
        <h3 className="text-lg font-semibold text-on-surface mb-2">{title}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <PreviewComponent palette={palettes.light} title="Tema Claro" />
            <PreviewComponent palette={palettes.dark} title="Tema Oscuro" />
        </div>
    </div>
  );
};

export default ThemePreview;
