

import React from 'react';
import { Permission } from '../types';

export interface NavLinkInfo {
    name: string;
    path: string;
    icon: React.ReactNode;
    permission?: Permission;
}


export const NAV_LINKS: NavLinkInfo[] = [
  { name: 'Dashboard', path: '/', icon: <HomeIcon /> },
  { name: 'Empleados', path: '/employees', icon: <UsersIcon />, permission: 'employees:read' },
  { name: 'Inventario', path: '/inventory', icon: <InventoryIcon />, permission: 'inventory:read' },
  { name: 'Préstamos', path: '/loans', icon: <KeyIcon />, permission: 'loans:read' },
  { name: 'Ausencias', path: '/absences', icon: <CalendarIcon />, permission: 'employees:read' },
  { name: 'Cumpleaños', path: '/birthdays', icon: <CakeIcon />, permission: 'employees:read' },
  { name: 'Reportes', path: '/reports', icon: <ChartBarIcon />, permission: 'reports:read' },
  { name: 'Historial', path: '/history', icon: <ClockIcon />, permission: 'history:read' },
  { name: 'Archivo Digital', path: '/documents', icon: <DocumentIcon />, permission: 'documents:read:all' },
  { name: 'Configuración', path: '/settings', icon: <CogIcon /> }, // Handled separately in Sidebar
];

function HomeIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
    );
}

function CalendarIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
    );
}

function DocumentIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
    );
}

function UsersIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
    );
}

function InventoryIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
        </svg>
    );
}

function KeyIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
        </svg>
    );
}

function CakeIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 15.25a2.25 2.25 0 01-2.25-2.25V9.75a2.25 2.25 0 012.25-2.25h.008c.958 0 1.84.42 2.455 1.108a.25.25 0 00.39-.286A7.476 7.476 0 0019.5 6C17.567 6 16 7.567 16 9.5v.25a.25.25 0 00.25.25h.5a.25.25 0 00.25-.25v-.25C17 8.119 18.119 7 19.5 7c.823 0 1.54.43 1.957 1.053a.25.25 0 00.39.286A2.25 2.25 0 0121.75 6h.008a2.25 2.25 0 012.25 2.25v3.25a2.25 2.25 0 01-2.25 2.25h-.008zM3 15.25a2.25 2.25 0 01-2.25-2.25V9.75a2.25 2.25 0 012.25-2.25h.008c.958 0 1.84.42 2.455 1.108a.25.25 0 00.39-.286A7.476 7.476 0 004.5 6C2.567 6 1 7.567 1 9.5v.25a.25.25 0 00.25.25h.5a.25.25 0 00.25-.25v-.25C2 8.119 3.119 7 4.5 7c.823 0 1.54.43 1.957 1.053a.25.25 0 00.39.286A2.25 2.25 0 017.75 6h.008a2.25 2.25 0 012.25 2.25v3.25a2.25 2.25 0 01-2.25 2.25h-.008zM12 18.25a2.25 2.25 0 01-2.25-2.25V13.5a2.25 2.25 0 012.25-2.25h.008c.958 0 1.84.42 2.455 1.108a.25.25 0 00.39-.286A7.476 7.476 0 0012 10.5c-1.933 0-3.5 1.567-3.5 3.5v.25a.25.25 0 00.25.25h.5a.25.25 0 00.25-.25v-.25c0-1.381 1.119-2.5 2.5-2.5.823 0 1.54.43 1.957 1.053a.25.25 0 00.39.286A2.25 2.25 0 0114.25 10.5h.008a2.25 2.25 0 012.25 2.25v2.5a2.25 2.25 0 01-2.25 2.25h-.008z" />
        </svg>
    );
}

function ChartBarIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
    );
}

function ClockIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    );
}

function CogIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066 2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
    );
}