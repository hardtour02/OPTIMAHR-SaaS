
import React, { useRef, useState, useEffect, useMemo } from 'react';
import { ReportData, ReportDefinition, ReportSettings, ReportColumn, ReportChartType } from '../../types';
import TableView from './TableView';
import ChartView from './ChartView';
import { api } from '../../services/api';
import Spinner from '../ui/Spinner';

declare const html2canvas: any;
declare const jspdf: any;

interface PdfPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportDef: ReportDefinition;
  reportData: ReportData;
  chartTypeOverrides?: Record<string, ReportChartType>;
}

type PageSize = 'A4' | 'Letter' | 'Legal';
type Orientation = 'portrait' | 'landscape';
type ExportType = 'full' | 'table' | 'charts';

// Page dimensions in points (pt)
const PAGE_SIZES_PT: Record<PageSize, { width: number; height: number }> = {
    A4: { width: 595.28, height: 841.89 },
    Letter: { width: 612, height: 792 },
    Legal: { width: 612, height: 1008 },
};

// Convert millimeters to points
const mmToPt = (mm: number) => mm * 2.83465;

const PdfPreviewModal: React.FC<PdfPreviewModalProps> = ({ isOpen, onClose, reportDef, reportData, chartTypeOverrides = {} }) => {
    const previewRef = useRef<HTMLDivElement>(null);
    const scaleContainerRef = useRef<HTMLDivElement>(null);
    const [settings, setSettings] = useState<ReportSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [isExporting, setIsExporting] = useState(false);
    const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
    const [isCapturing, setIsCapturing] = useState(false); 

    // Print settings state, initialized from fetched settings
    const [scale, setScale] = useState(0.7);
    const [margins, setMargins] = useState({ top: 20, right: 20, bottom: 20, left: 20 }); // in mm
    const [orientation, setOrientation] = useState<Orientation>('portrait');
    const [pageSize, setPageSize] = useState<PageSize>('Letter');
    const [fitTables, setFitTables] = useState(false);
    const [autoAdjustMargins, setAutoAdjustMargins] = useState(false);
    const manualMarginsRef = useRef({ top: 20, right: 20, bottom: 20, left: 20 });

    useEffect(() => {
        if(isOpen) {
            setLoading(true);
            api.getReportSettings().then(settingsData => {
                setSettings(settingsData);
                // Initialize state from fetched settings
                setOrientation(settingsData.pdf.orientation);
                setPageSize(settingsData.pdf.size as PageSize);
            }).finally(() => setLoading(false));
        }
    }, [isOpen]);

    const handleMarginChange = (margin: keyof typeof margins, value: number) => {
        const newMargins = { ...margins, [margin]: value };
        setMargins(newMargins);
        manualMarginsRef.current = newMargins;
    };

    const toggleAutoAdjustMargins = (checked: boolean) => {
        setAutoAdjustMargins(checked);
        if (checked) {
            manualMarginsRef.current = margins; // Save current manual margins
            setMargins({ top: 10, right: 10, bottom: 10, left: 10 });
        } else {
            setMargins(manualMarginsRef.current); // Restore manual margins
        }
    };

    const previewDimensions = useMemo(() => {
        const { width, height } = PAGE_SIZES_PT[pageSize];
        return orientation === 'portrait' ? { width, height } : { width: height, height: width };
    }, [pageSize, orientation]);
    
    // Helper to convert data to CSV format
    const convertToCSV = (objArray: Record<string, any>[], columns: ReportColumn[]) => {
        const header = columns.map(c => c.label).join(',');
        const rows = objArray.map(row => {
            return columns.map(col => {
                let cell = row[col.key] === null || row[col.key] === undefined ? '' : String(row[col.key]);
                cell = cell.replace(/"/g, '""'); // Escape double quotes
                if (cell.search(/("|,|\n)/g) >= 0) {
                    cell = `"${cell}"`; // Quote fields with commas, double quotes, or newlines
                }
                return cell;
            }).join(',');
        });
        return `\uFEFF${[header, ...rows].join('\n')}`; // Add BOM for Excel compatibility
    };
    
    // Handler for CSV export
    const handleExportCsv = () => {
        setIsExportMenuOpen(false);
        const csv = convertToCSV(reportData.tableData, reportDef.columns);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `${reportDef.label.replace(/\s/g, '_')}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Handler for PDF export
    const handleExportPdf = async (exportType: ExportType) => {
        setIsExporting(true);
        setIsExportMenuOpen(false);
        const element = previewRef.current;
        if (!element || !settings) {
            setIsExporting(false);
            return;
        }
    
        setIsCapturing(true); 
        await new Promise(resolve => setTimeout(resolve, 50));
    
        try {
            const { jsPDF } = jspdf;
            const pdf = new jsPDF({ orientation, unit: 'pt', format: pageSize.toLowerCase() });
    
            const pageSelectors: string[] = [];
            if (exportType === 'full') pageSelectors.push('.pdf-page');
            if (exportType === 'table') pageSelectors.push('.pdf-page-table');
            if (exportType === 'charts') pageSelectors.push('.pdf-page-charts');
            
            const pages = Array.from(element.querySelectorAll<HTMLElement>(pageSelectors.join(', ')));
            
            await document.fonts.ready;
        
            for (let i = 0; i < pages.length; i++) {
                const pageElement = pages[i] as HTMLElement;

                const exportContainer = document.createElement('div');
                exportContainer.style.position = 'absolute';
                exportContainer.style.left = '-9999px';
                exportContainer.style.top = '0px';
                exportContainer.style.width = `${previewDimensions.width}pt`;
                exportContainer.style.height = `auto`;
                document.body.appendChild(exportContainer);

                const clone = pageElement.cloneNode(true) as HTMLElement;
                clone.classList.add('pdf-export-font');
                exportContainer.appendChild(clone);
                
                await new Promise(resolve => setTimeout(resolve, 200));
    
                const canvas = await html2canvas(clone, {
                    scale: 2,
                    useCORS: true,
                    backgroundColor: '#ffffff',
                });
                
                document.body.removeChild(exportContainer);
    
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = pdf.internal.pageSize.getHeight();
                const imgData = canvas.toDataURL('image/jpeg', 0.98);
    
                if (i > 0) pdf.addPage();
                
                const canvasWidth = canvas.width;
                const canvasHeight = canvas.height;
                const ratio = canvasWidth / pdfWidth;
                const calculatedHeight = canvasHeight / ratio;

                pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, calculatedHeight > pdfHeight ? pdfHeight : calculatedHeight);
            }
            
            pdf.save(`${reportDef.label.replace(/\s/g, '_')}_${exportType}.pdf`);
        } catch (e) {
            console.error("Error during PDF export:", e);
        } finally {
            setIsCapturing(false);
            setIsExporting(false);
        }
    };

    if (!isOpen) return null;
    
    const hasCharts = reportData.chartData.length > 0;
    const totalPages = hasCharts ? 2 : 1;

    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 print:hidden" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="preview-title">
            <style>{`
                .table-fit table { font-size: 8pt; } 
                .pdf-page { page-break-after: always; } 
                .pdf-export-font, .pdf-export-font * { 
                    font-family: Arial, Helvetica, sans-serif !important;
                    letter-spacing: normal !important;
                }
                .control-input { width: 100%; background-color: rgb(var(--color-background)); border-radius: 0.375rem; padding: 0.5rem; border: 1px solid rgb(var(--color-neutral-border)); } 
                .control-input:disabled { opacity: 0.5; }
            `}</style>
            <div className="bg-background rounded-lg shadow-xl w-full h-full flex" onClick={e => e.stopPropagation()}>
                {/* Control Panel */}
                <aside className="w-72 bg-surface p-4 flex-shrink-0 overflow-y-auto space-y-6">
                    <div className="flex justify-between items-center">
                        <h2 id="preview-title" className="text-xl font-bold text-on-surface">Opciones</h2>
                        <button onClick={onClose} className="p-1 rounded-full hover:bg-primary-light-hover text-2xl leading-none" aria-label="Cerrar">&times;</button>
                    </div>
                    <div>
                        <ControlSection title="Página">
                            <ControlItem label="Tamaño">
                                <select value={pageSize} onChange={e => setPageSize(e.target.value as PageSize)} className="control-input" aria-label="Tamaño de página">
                                    <option value="Letter">Carta (Letter)</option>
                                    <option value="A4">A4</option>
                                    <option value="Legal">Legal</option>
                                </select>
                            </ControlItem>
                             <ControlItem label="Orientación">
                                 <select value={orientation} onChange={e => setOrientation(e.target.value as Orientation)} className="control-input" aria-label="Orientación de página">
                                     <option value="portrait">Vertical</option>
                                     <option value="landscape">Horizontal</option>
                                 </select>
                             </ControlItem>
                        </ControlSection>
                        <ControlSection title="Márgenes (mm)">
                             <label className="flex items-center justify-between text-sm text-on-surface-variant cursor-pointer mb-2">
                                <span>Auto-ajustar márgenes</span>
                                <input type="checkbox" checked={autoAdjustMargins} onChange={e => toggleAutoAdjustMargins(e.target.checked)} className="h-4 w-4 rounded bg-background border-neutral-border text-primary focus:ring-primary"/>
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                <ControlItem label="Sup."><input type="number" value={margins.top} onChange={e => handleMarginChange('top', +e.target.value)} className="control-input" aria-label="Margen superior" disabled={autoAdjustMargins}/></ControlItem>
                                <ControlItem label="Inf."><input type="number" value={margins.bottom} onChange={e => handleMarginChange('bottom', +e.target.value)} className="control-input" aria-label="Margen inferior" disabled={autoAdjustMargins}/></ControlItem>
                                <ControlItem label="Izq."><input type="number" value={margins.left} onChange={e => handleMarginChange('left', +e.target.value)} className="control-input" aria-label="Margen izquierdo" disabled={autoAdjustMargins}/></ControlItem>
                                <ControlItem label="Der."><input type="number" value={margins.right} onChange={e => handleMarginChange('right', +e.target.value)} className="control-input" aria-label="Margen derecho" disabled={autoAdjustMargins}/></ControlItem>
                            </div>
                        </ControlSection>
                        <ControlSection title="Contenido">
                            <label className="flex items-center justify-between text-sm text-on-surface-variant cursor-pointer">
                                <span>Ajustar ancho de tabla</span>
                                <input type="checkbox" checked={fitTables} onChange={e => setFitTables(e.target.checked)} className="h-4 w-4 rounded bg-background border-neutral-border text-primary focus:ring-primary"/>
                            </label>
                        </ControlSection>
                        <ControlSection title="Vista">
                            <ControlItem label={`Zoom: ${Math.round(scale * 100)}%`}>
                                <input type="range" min="0.2" max="2" step="0.05" value={scale} onChange={e => setScale(+e.target.value)} className="w-full h-2 bg-neutral-border/50 rounded-lg appearance-none cursor-pointer" aria-label="Zoom"/>
                            </ControlItem>
                        </ControlSection>
                    </div>
                    <div className="pt-4 border-t border-neutral-border space-y-2">
                        <div className="relative">
                            <button onClick={() => setIsExportMenuOpen(prev => !prev)} disabled={isExporting} className="w-full bg-primary text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-primary-dark-hover disabled:opacity-50 flex items-center justify-center gap-2">
                                {isExporting ? 'Exportando...' : 'Exportar'}
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                            </button>
                            {isExportMenuOpen && (
                                <div className="absolute bottom-full mb-2 w-full bg-surface-variant rounded-md shadow-lg z-10 border border-neutral-border">
                                    <ul className="text-sm text-on-surface">
                                        <li><button onClick={() => handleExportPdf('full')} className="w-full text-left p-2 hover:bg-primary/20 cursor-pointer">PDF (Completo)</button></li>
                                        <li><button onClick={() => handleExportPdf('table')} className="w-full text-left p-2 hover:bg-primary/20 cursor-pointer">PDF (Solo Tabla)</button></li>
                                        {hasCharts && <li><button onClick={() => handleExportPdf('charts')} className="w-full text-left p-2 hover:bg-primary/20 cursor-pointer">PDF (Solo Gráficas)</button></li>}
                                        <li><button onClick={handleExportCsv} className="w-full text-left p-2 hover:bg-primary/20 cursor-pointer">CSV (Solo Tabla)</button></li>
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                </aside>
                {/* Preview Area */}
                <main className="flex-1 bg-background p-6 overflow-auto">
                    {loading || !settings ? <Spinner/> : (
                        <div ref={scaleContainerRef} style={{ transform: `scale(${scale})`, transformOrigin: 'top center' }}>
                            <div ref={previewRef} className="mx-auto">
                                {/* Page 1: Table */}
                                <div className="pdf-page pdf-page-table bg-white shadow-2xl mb-8" style={{ width: `${previewDimensions.width}pt`, minHeight: `${previewDimensions.height}pt` }}>
                                    <div className="flex flex-col h-full" style={{ padding: `${mmToPt(margins.top)}pt ${mmToPt(margins.right)}pt ${mmToPt(margins.bottom)}pt ${mmToPt(margins.left)}pt`}}>
                                        <PageHeader settings={settings} reportDef={reportDef} />
                                        <main className={`py-6 flex-grow ${fitTables ? 'table-fit' : ''}`}>
                                            <TableView columns={reportDef.columns} data={reportData.tableData} theme="light" />
                                        </main>
                                        <PageFooter settings={settings} pageNumber={1} totalPages={totalPages} />
                                    </div>
                                </div>
                                {/* Page 2: Charts (if any) */}
                                {hasCharts && (
                                    <div className="pdf-page pdf-page-charts bg-white shadow-2xl" style={{ width: `${previewDimensions.width}pt`, height: `${previewDimensions.height}pt` }}>
                                        <div className="flex flex-col h-full" style={{ padding: `${mmToPt(margins.top)}pt ${mmToPt(margins.right)}pt ${mmToPt(margins.bottom)}pt ${mmToPt(margins.left)}pt`}}>
                                            <PageHeader settings={settings} reportDef={reportDef} titleOverride="Gráficas de Análisis" />
                                            <main className="py-6 flex-grow">
                                                <div className="grid grid-cols-2 gap-4 h-full">
                                                    {reportData.chartData.map(chart => (
                                                        <div key={chart.id} className="flex flex-col">
                                                            <h4 className="text-sm font-semibold text-gray-700 text-center mb-2">{chart.title}</h4>
                                                            <div className="flex-grow">
                                                                <ChartView chartType={chartTypeOverrides[chart.id] || chart.type} data={chart.data} theme="light" isAnimationActive={!isCapturing} />
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </main>
                                            <PageFooter settings={settings} pageNumber={2} totalPages={totalPages} />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

// --- Helper Sub-components ---
const ControlSection: React.FC<{title: string, children: React.ReactNode}> = ({title, children}) => (
    <div className="pt-4 border-t border-neutral-border">
        <h3 className="text-base font-semibold text-on-surface mb-2">{title}</h3>
        <div className="space-y-2">{children}</div>
    </div>
);
const ControlItem: React.FC<{label: string, children: React.ReactNode}> = ({label, children}) => (
    <div>
        <label className="block text-sm text-on-surface-variant mb-1">{label}</label>
        {children}
    </div>
);

const PageHeader: React.FC<{settings: ReportSettings, reportDef: ReportDefinition, titleOverride?: string}> = ({settings, reportDef, titleOverride}) => (
    <header className="flex justify-between items-start pb-4 border-b border-gray-300">
        {settings.pdf.logoUrl && <img src={settings.pdf.logoUrl} alt="logo" className="h-10 max-w-[150px] object-contain"/>}
        <div className="text-right flex-shrink-0 ml-4">
            <h1 className="text-lg font-bold text-gray-800">{settings.pdf.headerText}</h1>
            <p className="text-sm text-gray-500">{titleOverride || reportDef.label}</p>
            <p className="text-xs text-gray-500">Generado: {new Date().toLocaleString('es-ES')}</p>
        </div>
    </header>
);

const PageFooter: React.FC<{settings: ReportSettings, pageNumber: number, totalPages: number}> = ({settings, pageNumber, totalPages}) => (
    <footer className="flex justify-between text-xs text-gray-400 pt-4 border-t border-gray-300">
        <span>{settings.pdf.footerText}</span>
        <span>Página {pageNumber} de {totalPages}</span>
    </footer>
);

export default PdfPreviewModal;
