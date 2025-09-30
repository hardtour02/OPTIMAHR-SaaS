
import React, { useRef, useState } from 'react';
import { Document } from '../../types';

// --- Helper Components & Constants ---

const MAX_DOC_SIZE = 25 * 1024 * 1024; // 25MB
const MAX_IMG_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_DOC_TYPES = [
    'application/pdf', 'application/msword', 
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
    'application/vnd.ms-excel', 
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'application/vnd.ms-powerpoint', 
    'application/vnd.openxmlformats-officedocument.presentationml.presentation' // .pptx
];
const ALLOWED_IMG_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const ALLOWED_TYPES = [...ALLOWED_DOC_TYPES, ...ALLOWED_IMG_TYPES];

const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

const FileIcon: React.FC<{ type: string }> = ({ type }) => {
    let icon;
    if (type.includes('pdf')) icon = <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
    else if (type.includes('word')) icon = <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" /></svg>;
    else if (type.includes('excel')) icon = <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" /></svg>;
    else icon = <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-on-surface-variant" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0011.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>;
    return <div className="flex items-center justify-center w-16 h-10 bg-background rounded">{icon}</div>;
}

// --- Main Components ---

interface DocumentManagerProps {
    documents: Document[];
    onDocumentsChange: (documents: Document[]) => void;
}

export const DocumentManager: React.FC<DocumentManagerProps> = ({ documents, onDocumentsChange }) => {
    const [error, setError] = useState<string>('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const replaceInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

    const handleFileValidation = (file: File): boolean => {
        setError('');
        if (!ALLOWED_TYPES.includes(file.type)) {
            setError('Tipo de archivo no permitido.');
            return false;
        }
        const isImage = ALLOWED_IMG_TYPES.includes(file.type);
        if (isImage && file.size > MAX_IMG_SIZE) {
            setError(`La imagen excede el tamaño máximo de ${formatBytes(MAX_IMG_SIZE)}.`);
            return false;
        }
        if (!isImage && file.size > MAX_DOC_SIZE) {
            setError(`El documento excede el tamaño máximo de ${formatBytes(MAX_DOC_SIZE)}.`);
            return false;
        }
        return true;
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && handleFileValidation(file)) {
            const newDoc: Document = {
                id: `new_${Date.now()}`,
                name: file.name,
                type: file.type,
                size: file.size,
                uploadDate: new Date().toISOString(),
                version: 1,
                url: URL.createObjectURL(file),
            };
            onDocumentsChange([...documents, newDoc]);
        }
        e.target.value = ''; // Reset input
    };
    
    const handleReplace = (docId: string, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && handleFileValidation(file)) {
            const originalDoc = documents.find(d => d.id.startsWith(docId.split('_v')[0]));
            if (!originalDoc) return;
            
            // Clean up old blob URL if it exists
            const oldDoc = documents.find(d => d.id === docId);
            if (oldDoc && oldDoc.url.startsWith('blob:')) {
                URL.revokeObjectURL(oldDoc.url);
            }

            const newVersion = (originalDoc.version || 1) + 1;
            const updatedDoc: Document = {
                ...originalDoc,
                id: `${docId.split('_v')[0]}_v${newVersion}`,
                name: file.name,
                type: file.type,
                size: file.size,
                uploadDate: new Date().toISOString(),
                version: newVersion,
                url: URL.createObjectURL(file),
            };

            onDocumentsChange(documents.map(d => (d.id === docId ? updatedDoc : d)));
        }
        e.target.value = ''; // Reset input
    };

    const handleDelete = (docIdToDelete: string) => {
        const docToDelete = documents.find(d => d.id === docIdToDelete);
        if (docToDelete && docToDelete.url.startsWith('blob:')) {
           URL.revokeObjectURL(docToDelete.url);
        }
        onDocumentsChange(documents.filter(doc => doc.id !== docIdToDelete));
    };
    
    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-on-surface">Gestión de Documentos</h3>
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-primary text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-primary-dark-hover transition-colors text-sm"
                >
                    Subir Documento
                </button>
                <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" accept={ALLOWED_TYPES.join(',')} />
            </div>
            {error && <p className="text-sm text-error mb-2 text-center">{error}</p>}
            
            <div className="overflow-x-auto border border-neutral-border rounded-lg">
                <table className="w-full text-sm text-left text-on-surface-variant">
                    <thead className="text-xs text-on-surface uppercase bg-surface">
                        <tr>
                            <th scope="col" className="px-4 py-3">Vista Previa</th>
                            <th scope="col" className="px-4 py-3">Nombre</th>
                            <th scope="col" className="px-4 py-3">Tamaño</th>
                            <th scope="col" className="px-4 py-3">Fecha de Carga</th>
                            <th scope="col" className="px-4 py-3">Versión</th>
                            <th scope="col" className="px-4 py-3 text-center">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {documents.length > 0 ? documents.map(doc => (
                             <tr key={doc.id} className="bg-surface border-b border-neutral-border last:border-b-0 hover:bg-primary-light-hover">
                                <td className="px-4 py-2">
                                    {doc.type.startsWith('image/') ? 
                                        <img src={doc.url} alt={doc.name} className="w-16 h-10 object-cover rounded" /> 
                                        : <FileIcon type={doc.type} />
                                    }
                                </td>
                                <td className="px-4 py-2 font-medium text-on-surface whitespace-nowrap">
                                    <a href={doc.url} target="_blank" rel="noopener noreferrer" className="hover:underline">{doc.name}</a>
                                </td>
                                <td className="px-4 py-2">{formatBytes(doc.size)}</td>
                                <td className="px-4 py-2">{new Date(doc.uploadDate).toLocaleDateString()}</td>
                                <td className="px-4 py-2 text-center">{doc.version}</td>
                                <td className="px-4 py-2 text-center space-x-2">
                                    <button type="button" onClick={() => replaceInputRefs.current[doc.id]?.click()} className="p-1.5 text-alert hover:bg-on-surface-variant/10 rounded-md" title="Reemplazar">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h5M20 20v-5h-5" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 9a9 9 0 0114.65-5.32L20 5M20 15a9 9 0 01-14.65 5.32L4 19" /></svg>
                                    </button>
                                     <input type="file" ref={el => { replaceInputRefs.current[doc.id] = el; }} onChange={(e) => handleReplace(doc.id, e)} className="hidden" accept={ALLOWED_TYPES.join(',')} />
                                    <button type="button" onClick={() => handleDelete(doc.id)} className="p-1.5 text-error hover:bg-on-surface-variant/10 rounded-md" title="Eliminar">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    </button>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={6} className="text-center py-8 text-on-surface-variant">No hay documentos adjuntos.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default DocumentManager;
