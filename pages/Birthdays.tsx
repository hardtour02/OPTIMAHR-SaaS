
import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../services/api';
import { Employee } from '../types';
import { useFormatting } from '../hooks/useFormatting';

// Helper to parse YYYY-MM-DD strings into local Date objects to avoid timezone issues
const parseLocalDate = (dateString: string): Date => {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
};

// Helper to calculate age
const calculateAge = (birthDateString: string): number => {
    const birthDate = parseLocalDate(birthDateString);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
};

// --- Sub Components ---

const BirthdaySummaryTable: React.FC<{ employees: Employee[]; selectedDate: Date }> = ({ employees, selectedDate }) => {
    const { formatDate } = useFormatting();

    if (employees.length === 0) {
        return (
            <div className="bg-surface rounded-lg shadow-lg border border-neutral-border p-6 text-center text-on-surface-variant">
                No hay cumpleaños para el {selectedDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}.
            </div>
        );
    }

    return (
        <div className="bg-surface rounded-lg shadow-lg border border-neutral-border overflow-hidden">
             <h2 className="text-xl font-bold text-on-surface p-4 border-b border-neutral-border">
                Cumpleaños del {selectedDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}
             </h2>
             <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-on-surface-variant">
                    <thead className="text-xs text-white uppercase bg-primary">
                        <tr>
                            <th scope="col" className="px-6 py-3">Foto Perfil</th>
                            <th scope="col" className="px-6 py-3">Nombre</th>
                            <th scope="col" className="px-6 py-3">Edad</th>
                            <th scope="col" className="px-6 py-3">Fecha de Nacimiento</th>
                            <th scope="col" className="px-6 py-3">Jerarquía</th>
                            <th scope="col" className="px-6 py-3">Empresa</th>
                        </tr>
                    </thead>
                    <tbody>
                        {employees.map(employee => (
                            <tr key={employee.id} className="bg-surface border-b border-neutral-border hover:bg-primary-light-hover">
                                <td className="px-6 py-4">
                                    <img className="w-10 h-10 rounded-full object-cover" src={employee.photoUrl} alt={`${employee.firstName}`} />
                                </td>
                                <td className="px-6 py-4 font-medium text-on-surface">{`${employee.firstName} ${employee.lastName}`}</td>
                                <td className="px-6 py-4">{calculateAge(employee.birthDate)} años</td>
                                <td className="px-6 py-4">{formatDate(employee.birthDate)}</td>
                                <td className="px-6 py-4">{employee.hierarchy}</td>
                                <td className="px-6 py-4">{employee.company}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const Calendar: React.FC<{ 
    employees: Employee[]; 
    onDateClick: (date: Date) => void; 
    selectedDate: Date | null;
}> = ({ employees, onDateClick, selectedDate }) => {
    const [date, setDate] = useState(new Date());
    
    const birthdaysByDay = useMemo(() => {
        const map: { [key: number]: Employee[] } = {};
        employees.forEach(emp => {
            const birthDate = parseLocalDate(emp.birthDate);
            if (birthDate.getMonth() === date.getMonth()) {
                const day = birthDate.getDate();
                if (!map[day]) {
                    map[day] = [];
                }
                map[day].push(emp);
            }
        });
        return map;
    }, [employees, date]);

    const renderHeader = () => {
        return (
            <div className="flex items-center justify-between py-2 px-4">
                <button onClick={prevMonth} className="p-2 rounded-full hover:bg-on-surface-variant/10">&lt;</button>
                <span className="text-xl font-bold">
                    {date.toLocaleString('es-ES', { month: 'long', year: 'numeric' }).replace(/^\w/, c => c.toUpperCase())}
                </span>
                <button onClick={nextMonth} className="p-2 rounded-full hover:bg-on-surface-variant/10">&gt;</button>
            </div>
        );
    };

    const renderDays = () => {
        const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
        return (
            <div className="grid grid-cols-7 text-center font-medium text-on-surface-variant">
                {days.map(day => <div key={day} className="py-2">{day}</div>)}
            </div>
        );
    };

    const renderCells = () => {
        const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
        const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        const startDate = new Date(monthStart);
        startDate.setDate(startDate.getDate() - monthStart.getDay());
        const endDate = new Date(monthEnd);
        if (monthEnd.getDay() !== 6) {
          endDate.setDate(endDate.getDate() + (6 - monthEnd.getDay()));
        }

        const rows = [];
        let days = [];
        let day = new Date(startDate);

        while (day <= endDate) {
            for (let i = 0; i < 7; i++) {
                const cloneDay = new Date(day);
                const dayNumber = cloneDay.getDate();
                const birthdays = birthdaysByDay[dayNumber] || [];
                const isCurrentMonth = cloneDay.getMonth() === date.getMonth();

                const isToday = new Date().toDateString() === cloneDay.toDateString();
                const isSelected = selectedDate?.toDateString() === cloneDay.toDateString();

                days.push(
                    <div
                        className={`border-t border-l border-neutral-border p-2 h-32 flex flex-col cursor-pointer transition-colors ${
                            !isCurrentMonth ? 'text-on-surface-variant/40 bg-background' : 'hover:bg-primary-light-hover'
                        } ${isSelected ? 'bg-primary/20 border-primary' : ''}`}
                        key={day.toString()}
                        onClick={() => onDateClick(cloneDay)}
                    >
                        <span className={`font-semibold ${isToday ? 'bg-primary text-white rounded-full h-7 w-7 flex items-center justify-center' : ''}`}>
                            {dayNumber}
                        </span>
                        {isCurrentMonth && birthdays.length > 0 &&
                            <div className="mt-1 -space-y-2 overflow-y-auto">
                                {birthdays.map(emp => (
                                    <div key={emp.id} className="flex items-center gap-2 text-xs p-1 rounded">
                                        <img src={emp.photoUrl} className="w-5 h-5 rounded-full" />
                                        <span>{emp.firstName}</span>
                                    </div>
                                ))}
                            </div>
                        }
                    </div>
                );
                day.setDate(day.getDate() + 1);
            }
            rows.push(<div className="grid grid-cols-7" key={day.toString()}>{days}</div>);
            days = [];
        }
        return <div>{rows}</div>;
    };

    const nextMonth = () => {
        setDate(new Date(date.getFullYear(), date.getMonth() + 1, 1));
    };

    const prevMonth = () => {
        setDate(new Date(date.getFullYear(), date.getMonth() - 1, 1));
    };

    return (
        <div className="bg-surface rounded-lg shadow-lg border border-neutral-border">
            {renderHeader()}
            {renderDays()}
            {renderCells()}
        </div>
    );
};


// --- Main Component ---

const Birthdays: React.FC = () => {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());

    useEffect(() => {
        api.getEmployees().then(setEmployees);
    }, []);

    const handleDateClick = (date: Date) => {
        setSelectedDate(date);
    };

    const birthdaysOnSelectedDate = useMemo(() => {
        if (!selectedDate) return [];
        return employees.filter(emp => {
            const birthDate = parseLocalDate(emp.birthDate);
            return birthDate.getDate() === selectedDate.getDate() && birthDate.getMonth() === selectedDate.getMonth();
        });
    }, [selectedDate, employees]);


    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-primary">Calendario de Cumpleaños</h1>
            <Calendar employees={employees} onDateClick={handleDateClick} selectedDate={selectedDate} />
            {selectedDate && <BirthdaySummaryTable employees={birthdaysOnSelectedDate} selectedDate={selectedDate}/>}
        </div>
    );
};

export default Birthdays;