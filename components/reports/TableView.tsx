
import React, { useState, useMemo } from 'react';
import { ReportColumn } from '../../types';


interface TableViewProps {
  columns: ReportColumn[];
  data: Record<string, any>[];
  theme?: 'light' | 'dark';
}

const TableView: React.FC<TableViewProps> = ({ columns, data, theme = 'dark' }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [sortConfig, setSortConfig] = useState<{ key: string | null; direction: 'ascending' | 'descending' }>({ key: null, direction: 'ascending' });
    const ITEMS_PER_PAGE = 15;
    
    const isLightTheme = theme === 'light';

    const requestSort = (key: string) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
        setCurrentPage(1);
    };

    const sortedData = useMemo(() => {
        let sortableItems = [...data];
        if (sortConfig.key !== null) {
            sortableItems.sort((a, b) => {
                const aVal = a[sortConfig.key!];
                const bVal = b[sortConfig.key!];
                if (aVal < bVal) return sortConfig.direction === 'ascending' ? -1 : 1;
                if (aVal > bVal) return sortConfig.direction === 'ascending' ? 1 : -1;
                return 0;
            });
        }
        return sortableItems;
    }, [data, sortConfig]);

    const totalPages = Math.ceil(sortedData.length / ITEMS_PER_PAGE);
    const paginatedData = sortedData.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    const SortableHeader: React.FC<{ children: React.ReactNode; sortKey: string; }> = ({ children, sortKey }) => {
        const isSorted = sortConfig.key === sortKey;
        return (
            <th scope="col" className="px-6 py-3 cursor-pointer" onClick={() => requestSort(sortKey)}>
                <div className="flex items-center">{children}{isSorted ? (sortConfig.direction === 'ascending' ? ' ▲' : ' ▼') : ' ↕'}</div>
            </th>
        );
    };
    
    return (
        <div className="space-y-4">
            <div className={`overflow-x-auto ${!isLightTheme && 'border border-neutral-border rounded-lg'}`}>
                <table className={`w-full text-sm text-left ${isLightTheme ? 'text-black' : 'text-on-surface-variant'}`}>
                    <thead className={`text-xs ${isLightTheme ? 'text-black bg-gray-200' : 'text-white uppercase bg-primary'}`}>
                        <tr>
                            {columns.map(col => <SortableHeader key={col.key} sortKey={col.key}>{col.label}</SortableHeader>)}
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedData.map((row, index) => (
                            <tr key={row.id || index} className={`${isLightTheme ? 'border-b border-gray-300' : 'bg-surface border-b border-neutral-border'}`}>
                                {columns.map(col => (
                                    <td key={col.key} className={`px-6 py-4 font-medium whitespace-nowrap ${!isLightTheme && 'text-on-surface'}`}>
                                        {row[col.key]}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
             {totalPages > 1 && (
                <div className={`flex justify-between items-center p-4 ${isLightTheme && 'print:hidden'}`}>
                    <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="py-2 px-4 rounded-lg bg-surface border border-neutral-border hover:bg-primary-light-hover disabled:opacity-50">Anterior</button>
                    <span>Página {currentPage} de {totalPages}</span>
                    <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="py-2 px-4 rounded-lg bg-surface border border-neutral-border hover:bg-primary-light-hover disabled:opacity-50">Siguiente</button>
                </div>
            )}
        </div>
    );
};

export default TableView;