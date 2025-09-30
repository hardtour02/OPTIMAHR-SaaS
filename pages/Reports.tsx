
import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../services/api';
import { ReportDefinition, ReportData, ReportCategoryKey, ReportChartType, Company, SalaryConfig } from '../types';
import Spinner from '../components/ui/Spinner';
import PdfPreviewModal from '../components/reports/PdfPreviewModal';
import TableView from '../components/reports/TableView';
import ChartView from '../components/reports/ChartView';
import { useFormatting } from '../hooks/useFormatting';

const Reports: React.FC = () => {
    const [definitions, setDefinitions] = useState<Record<string, ReportDefinition[]>>({});
    const [selectedCategory, setSelectedCategory] = useState<ReportCategoryKey>('employees');
    const [selectedReportId, setSelectedReportId] = useState<string>('');
    const [reportData, setReportData] = useState<ReportData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [chartTypeOverrides, setChartTypeOverrides] = useState<Record<string, ReportChartType>>({});
    const [companies, setCompanies] = useState<Company[]>([]);
    const [companyFilter, setCompanyFilter] = useState('');
    const [salaryConfig, setSalaryConfig] = useState<SalaryConfig | null>(null);
    const { formatDate, formatCurrency } = useFormatting();


    const fetchDefinitions = async () => {
        setLoading(true);
        try {
            const [defs, comps, salConfig] = await Promise.all([
                api.getReportDefinitions(),
                api.getCompanies(),
                api.getSalaryConfig(),
            ]);
            setDefinitions(defs);
            setCompanies(comps);
            setSalaryConfig(salConfig);
            // Set initial selected category and report
            const firstCategoryWithReports = Object.keys(defs)[0] as ReportCategoryKey | undefined;
            if (firstCategoryWithReports) {
                setSelectedCategory(firstCategoryWithReports);
                if (defs[firstCategoryWithReports].length > 0) {
                    setSelectedReportId(defs[firstCategoryWithReports][0].id);
                }
            }
        } catch (err) {
            setError('No se pudieron cargar las definiciones de los reportes.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDefinitions();
    }, []);
    
    const selectedReportDef = useMemo(() => {
        return Object.values(definitions).flat().find((def: ReportDefinition) => def.id === selectedReportId);
    }, [definitions, selectedReportId]);

    const formattedTableData = useMemo(() => {
        if (!reportData || !selectedReportDef || !salaryConfig) return [];
        
        return reportData.tableData.map(row => {
            const newRow = { ...row };
            selectedReportDef.columns.forEach(col => {
                const key = col.key.toLowerCase();
                const value = newRow[col.key];

                if (value !== null && value !== undefined) {
                    if (key.includes('date') || key.includes('timestamp') || key === 'deadline' || key === 'startdate' || key === 'enddate') {
                        newRow[col.key] = formatDate(value);
                    } else if (key === 'salary') {
                        const primary = formatCurrency(value, salaryConfig.primaryCurrency);
                        const secondaryValue = newRow[`${col.key}Secondary`];
                        if (typeof secondaryValue === 'number') {
                            const secondary = formatCurrency(secondaryValue, salaryConfig.secondaryCurrency);
                            newRow[col.key] = `${primary} / ${secondary}`;
                        } else {
                            newRow[col.key] = primary;
                        }
                    } else if (key === 'returndate' && !value) {
                         if (row['status']?.toLowerCase().includes('asignado')) {
                            newRow[col.key] = 'Permanente';
                         } else {
                            newRow[col.key] = 'No Devolver';
                         }
                    }
                }
            });
            return newRow;
        });
    }, [reportData, selectedReportDef, formatDate, formatCurrency, salaryConfig]);

    useEffect(() => {
        if (selectedReportDef) {
            const initialOverrides: Record<string, ReportChartType> = {};
            selectedReportDef.charts.forEach(chart => {
                initialOverrides[chart.id] = chart.type;
            });
            setChartTypeOverrides(initialOverrides);
        }
    }, [selectedReportDef]);
    
    const handleCategorySelect = (category: ReportCategoryKey) => {
        setSelectedCategory(category);
        setReportData(null);
        setCompanyFilter('');
        const reportsForCategory = definitions[category];
        if (reportsForCategory && reportsForCategory.length > 0) {
            setSelectedReportId(reportsForCategory[0].id);
        } else {
            setSelectedReportId('');
        }
    };

    const handleGenerateReport = async () => {
        setError('');
        if (!selectedReportId) {
            setError('Por favor, seleccione un reporte.');
            return;
        }
        setLoading(true);
        setReportData(null);
        try {
            const data = await api.generateReport(selectedReportId, { company: companyFilter });
            setReportData(data);
        } catch (err) {
            setError('Ocurrió un error al generar el reporte.');
        } finally {
            setLoading(false);
        }
    };
    
    const handleChartTypeChange = (chartId: string, newType: ReportChartType) => {
        setChartTypeOverrides(prev => ({ ...prev, [chartId]: newType }));
    };

    const CATEGORIES: { key: ReportCategoryKey, label: string }[] = [
        { key: 'employees', label: 'Empleados' },
        { key: 'loans', label: 'Préstamos' },
        { key: 'inventory', label: 'Inventario' },
        { key: 'system', label: 'Sistema / Auditoría' },
    ];

    const visibleCategories = CATEGORIES.filter(cat => definitions[cat.key] && definitions[cat.key].length > 0);
    const showCompanyFilter = ['employees', 'loans', 'system'].includes(selectedCategory);

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-primary">Central de Reportes</h1>

            <div className="bg-surface rounded-lg shadow-lg border border-neutral-border">
                <div className="border-b border-neutral-border">
                    <nav className="-mb-px flex space-x-6 px-6 overflow-x-auto" aria-label="Tabs">
                         {visibleCategories.map(cat => (
                            <button
                                key={cat.key}
                                onClick={() => handleCategorySelect(cat.key)}
                                className={`${
                                    selectedCategory === cat.key
                                        ? 'border-primary text-primary'
                                        : 'border-transparent text-on-surface-variant hover:text-on-surface hover:border-on-surface-variant/70'
                                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </nav>
                </div>
                <div className="p-4 flex flex-col md:flex-row items-end gap-4">
                    <div className="flex-grow">
                        <label className="block text-sm font-medium text-on-surface-variant mb-1">Seleccione un Reporte</label>
                        <select value={selectedReportId} onChange={e => { setSelectedReportId(e.target.value); setReportData(null); }} className="w-full bg-background border border-neutral-border p-2 rounded-md h-10">
                            {definitions[selectedCategory]?.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
                        </select>
                    </div>
                    {showCompanyFilter && (
                         <div className="w-full md:w-auto">
                            <label className="block text-sm font-medium text-on-surface-variant mb-1">Filtrar por Empresa</label>
                            <select value={companyFilter} onChange={e => setCompanyFilter(e.target.value)} className="w-full bg-background border border-neutral-border p-2 rounded-md h-10">
                                <option value="">Todas las Empresas</option>
                                {companies.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                            </select>
                        </div>
                    )}
                    <button onClick={handleGenerateReport} disabled={loading || !selectedReportId} className="bg-primary text-white font-semibold py-2 px-6 rounded-lg shadow-md hover:bg-primary-dark-hover disabled:opacity-50 h-10 w-full md:w-auto">
                        {loading ? 'Generando...' : 'Generar'}
                    </button>
                     {reportData && (
                        <button onClick={() => setIsPreviewOpen(true)} className="bg-secondary text-white font-semibold py-2 px-6 rounded-lg shadow-md hover:bg-secondary-dark-hover h-10 w-full md:w-auto">
                            Vista Previa y Exportar
                        </button>
                     )}
                </div>
            </div>
             
             {error && <p className="text-sm text-error text-center bg-error/10 p-2 rounded-md">{error}</p>}

             <div className="bg-surface rounded-lg shadow-lg border border-neutral-border min-h-[400px]">
                {loading && <div className="h-full flex items-center justify-center p-8"><Spinner /></div>}
                {!loading && !reportData && <div className="text-center text-on-surface-variant flex items-center justify-center h-full p-8"><p>Seleccione una categoría y un reporte para comenzar.</p></div>}
                {!loading && reportData && selectedReportDef && (
                    <div className="p-6">
                         <div className="text-center mb-6">
                            <h2 className="text-2xl font-bold text-on-surface">{selectedReportDef.label}</h2>
                        </div>
                        <div className="space-y-8">
                            {formattedTableData.length > 0 && <TableView columns={selectedReportDef.columns} data={formattedTableData} />}
                            {reportData.chartData.length > 0 && (
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {reportData.chartData.map(chart => (
                                        <div key={chart.id} className="bg-background/50 p-4 rounded-lg border border-neutral-border">
                                            <div className="flex justify-between items-center mb-4">
                                                <h4 className="text-lg font-semibold text-on-surface">{chart.title}</h4>
                                                <select
                                                    value={chartTypeOverrides[chart.id] || chart.type}
                                                    onChange={(e) => handleChartTypeChange(chart.id, e.target.value as ReportChartType)}
                                                    className="bg-background p-1 rounded-md text-sm border border-neutral-border"
                                                    aria-label={`Tipo de gráfica para ${chart.title}`}
                                                >
                                                    <option value="bar">Barras</option>
                                                    <option value="pie">Torta</option>
                                                    <option value="line">Línea</option>
                                                </select>
                                            </div>
                                            <ChartView chartType={chartTypeOverrides[chart.id] || chart.type} data={chart.data} />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
             </div>
             {isPreviewOpen && reportData && selectedReportDef && (
                 <PdfPreviewModal 
                    isOpen={isPreviewOpen} 
                    onClose={() => setIsPreviewOpen(false)} 
                    reportDef={selectedReportDef} 
                    reportData={{ ...reportData, tableData: formattedTableData }}
                    chartTypeOverrides={chartTypeOverrides}
                />
             )}
        </div>
    );
};

export default Reports;