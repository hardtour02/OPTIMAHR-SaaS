import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { OrgNode as OrgNodeType, Employee, ReportSettings } from '../types';
import Spinner from '../components/ui/Spinner';

declare const html2canvas: any;
declare const jspdf: any;

// --- Helper Components ---

const EmployeeCard: React.FC<{ employee: Employee }> = ({ employee }) => (
    <div className="bg-surface print:bg-white rounded-lg p-3 flex items-center gap-3 border border-neutral-border print:border-gray-300 w-80">
        <img src={employee.photoUrl} alt={`${employee.firstName}`} className="w-16 h-16 rounded-full object-cover flex-shrink-0" />
        <div className="overflow-hidden">
            <p className="font-bold text-on-surface print:text-black truncate">{employee.firstName} {employee.lastName}</p>
            <p className="text-sm text-on-surface-variant print:text-gray-600 truncate">{employee.title}</p>
            <p className="text-xs text-on-surface-variant/80 print:text-gray-500">{employee.zonaDeTrabajo.replace(/^\w/, c => c.toUpperCase())}</p>
        </div>
    </div>
);

const OrgChartNode: React.FC<{ node: OrgNodeType; allEmployees: Map<string, Employee>; level: number }> = ({ node, allEmployees, level }) => {
    const [isOpen, setIsOpen] = useState(level < 2); // Auto-expand first 2 levels
    const nodeEmployees = node.employeeIds.map(id => allEmployees.get(id)).filter((e): e is Employee => !!e);

    return (
        <div className="relative pl-8">
            {/* Connecting line */}
            <div className="absolute top-0 -left-px h-full w-0.5 bg-neutral-border print:bg-gray-400"></div>
            <div className="absolute top-7 -left-px w-8 h-0.5 bg-neutral-border print:bg-gray-400"></div>

            <div className="relative pt-4">
                <div className="flex items-center gap-2">
                     {node.children && node.children.length > 0 && (
                        <button onClick={() => setIsOpen(!isOpen)} className="p-1 rounded-full hover:bg-primary-light-hover print:hidden">
                            {isOpen ? <ChevronDownIcon /> : <ChevronRightIcon />}
                        </button>
                    )}
                    <h3 className="text-lg font-semibold text-primary print:text-blue-700">{node.name}</h3>
                    <span className="text-sm text-on-surface-variant print:text-gray-500">({node.unitType})</span>
                </div>
                
                {(isOpen) && (
                    <div className="pt-4 space-y-4">
                        <div className="flex flex-wrap gap-4">
                            {nodeEmployees.map(emp => <EmployeeCard key={emp.id} employee={emp} />)}
                        </div>

                        {node.children && node.children.length > 0 && (
                            <div className="org-children border-l border-neutral-border print:border-gray-400">
                                {node.children.map(child => (
                                    <OrgChartNode key={child.id} node={child} allEmployees={allEmployees} level={level + 1} />
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

const PrintableOrgChart: React.FC<{ orgChart: OrgNodeType; allEmployees: Map<string, Employee> }> = ({ orgChart, allEmployees }) => {
    const PrintableNode: React.FC<{ node: OrgNodeType; allEmployees: Map<string, Employee> }> = ({ node, allEmployees }) => {
        const nodeEmployees = node.employeeIds.map(id => allEmployees.get(id)).filter((e): e is Employee => !!e);
        return (
            <div className="relative pl-8">
                <div className="absolute top-0 -left-px h-full w-0.5 bg-gray-400"></div>
                <div className="absolute top-7 -left-px w-8 h-0.5 bg-gray-400"></div>
                <div className="relative pt-4">
                    <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-blue-700">{node.name}</h3>
                        <span className="text-sm text-gray-500">({node.unitType})</span>
                    </div>
                    <div className="pt-4 space-y-4">
                        <div className="flex flex-wrap gap-4">
                            {nodeEmployees.map(emp => <EmployeeCard key={emp.id} employee={emp} />)}
                        </div>
                        {node.children && node.children.length > 0 && (
                            <div className="org-children border-l border-gray-400">
                                {node.children.map(child => <PrintableNode key={child.id} node={child} allEmployees={allEmployees} />)}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="bg-white text-black p-8" style={{ fontFamily: 'Arial, sans-serif', fontSize: '10pt' }}>
            <PrintableNode node={orgChart} allEmployees={allEmployees} />
        </div>
    );
};


// --- Main Organization Component ---

const Organization: React.FC = () => {
    const [orgChart, setOrgChart] = useState<OrgNodeType | null>(null);
    const [allEmployeesMap, setAllEmployeesMap] = useState<Map<string, Employee>>(new Map());
    const [reportSettings, setReportSettings] = useState<ReportSettings | null>(null);
    const [loading, setLoading] = useState(true);
    
    // UI State
    const [isExporting, setIsExporting] = useState(false);
    const [zoom, setZoom] = useState(1);
    
    const printableRef = useRef<HTMLDivElement>(null);
    const chartContainerRef = useRef<HTMLDivElement>(null);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const [chartData, employeesData, settingsData] = await Promise.all([
                api.getOrgChart(),
                api.getEmployees(),
                api.getReportSettings()
            ]);
            setOrgChart(chartData);
            setAllEmployeesMap(new Map(employeesData.map(emp => [emp.id, emp])));
            setReportSettings(settingsData);
        } catch (error) { 
            console.error("Failed to fetch organization data", error);
        } finally {
            setLoading(false);
        }
    }, []);
    
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleExportPdf = async () => {
        if (!printableRef.current || !reportSettings) return;

        setIsExporting(true);

        // Allow time for the printable component to render fully
        await new Promise(resolve => setTimeout(resolve, 100));

        try {
            const { jsPDF } = jspdf;
            const element = printableRef.current;
            const canvas = await html2canvas(element, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
            const imgData = canvas.toDataURL('image/jpeg', 0.98);

            const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            
            const imgProps = pdf.getImageProperties(imgData);
            const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;

            let heightLeft = imgHeight;
            let position = 0;
            let page = 1;

            const addHeaderFooter = () => {
                 // Header
                if (reportSettings.pdf.logoUrl) {
                    try {
                        // This might fail if the logo URL is not a data URL and CORS is restrictive
                        pdf.addImage(reportSettings.pdf.logoUrl, 'PNG', 40, 20, 80, 20);
                    } catch (e) { console.error("Could not add logo to PDF.", e)}
                }
                pdf.setFontSize(14).text(reportSettings.pdf.headerText, pdfWidth - 40, 35, { align: 'right' });
                pdf.setFontSize(10).text(`Generado: ${new Date().toLocaleDateString()}`, pdfWidth - 40, 50, { align: 'right' });
                pdf.setDrawColor(200).line(40, 60, pdfWidth - 40, 60);

                // Footer
                pdf.setFontSize(8).text(`Página ${page}`, pdfWidth / 2, pdfHeight - 30, { align: 'center' });
            };

            addHeaderFooter();
            pdf.addImage(imgData, 'JPEG', 40, 80, pdfWidth - 80, imgHeight - 80);
            heightLeft -= (pdfHeight - 120); // content area height

            while (heightLeft > 0) {
                page++;
                position = heightLeft - imgHeight;
                pdf.addPage();
                addHeaderFooter();
                pdf.addImage(imgData, 'JPEG', 40, position + 80, pdfWidth - 80, imgHeight - 80);
                heightLeft -= (pdfHeight - 120);
            }

            pdf.save(`organigrama_${new Date().toISOString().split('T')[0]}.pdf`);
        } catch (error) {
            console.error("Error exporting PDF:", error);
        } finally {
            setIsExporting(false);
        }
    };

    if (loading) return <div className="h-full flex items-center justify-center"><Spinner /></div>;
    if (!orgChart) return <div className="text-center">No se pudo cargar el organigrama.</div>;

    return (
        <div className="space-y-6 h-full flex flex-col">
            <div className="flex-shrink-0 flex justify-between items-center">
                <h1 className="text-3xl font-bold text-primary">Organigrama Empresarial</h1>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <button onClick={() => setZoom(z => Math.max(0.2, z - 0.1))} className="p-2 rounded-md hover:bg-primary-light-hover" title="Alejar">-</button>
                        <span className="text-sm font-semibold w-12 text-center">{Math.round(zoom * 100)}%</span>
                        <button onClick={() => setZoom(z => Math.min(2, z + 0.1))} className="p-2 rounded-md hover:bg-primary-light-hover" title="Acercar">+</button>
                    </div>
                     <button onClick={handleExportPdf} disabled={isExporting} className="bg-primary text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-primary-dark-hover transition-colors disabled:opacity-50">
                        {isExporting ? 'Exportando PDF...' : 'Exportar a PDF'}
                    </button>
                </div>
            </div>
            
            <div ref={chartContainerRef} className="flex-grow bg-surface rounded-lg shadow-lg border border-neutral-border p-6 overflow-auto">
                <div style={{ transform: `scale(${zoom})`, transformOrigin: 'top left', width: `${100 / zoom}%`, height: `${100 / zoom}%` }}>
                    <OrgChartNode node={orgChart} allEmployees={allEmployeesMap} level={0} />
                </div>
            </div>

             {/* Hidden component for PDF generation */}
            {isExporting && (
                <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
                    <div ref={printableRef}>
                       <PrintableOrgChart orgChart={orgChart} allEmployees={allEmployeesMap} />
                    </div>
                </div>
            )}
        </div>
    );
};

// Icons
const ChevronDownIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>;
const ChevronRightIcon = () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>;

export default Organization;