import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IMAGES } from '../types';

const AgendarHorario: React.FC = () => {
    const navigate = useNavigate();
    const [selectedDate, setSelectedDate] = useState(16); // Default 16th (Wed)
    const [selectedTime, setSelectedTime] = useState('14:30');

    const days = [
        { day: 'SEG', date: 14, disabled: false },
        { day: 'TER', date: 15, disabled: false },
        { day: 'QUA', date: 16, disabled: false },
        { day: 'QUI', date: 17, disabled: false },
        { day: 'SEX', date: 18, disabled: false },
        { day: 'SÁB', date: 19, disabled: false },
    ];

    const morningSlots = [
        { time: '08:00', disabled: true },
        { time: '08:30', disabled: true },
        { time: '09:00', disabled: false },
        { time: '09:30', disabled: false },
        { time: '10:00', disabled: true },
        { time: '10:30', disabled: false },
        { time: '11:00', disabled: false },
        { time: '11:30', disabled: true },
    ];

    const afternoonSlots = [
        { time: '13:00', disabled: false },
        { time: '13:30', disabled: false },
        { time: '14:00', disabled: true },
        { time: '14:30', disabled: false },
        { time: '15:00', disabled: false },
        { time: '15:30', disabled: false },
        { time: '16:00', disabled: true },
        { time: '16:30', disabled: false },
        { time: '17:00', disabled: false },
    ];

    return (
        <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-gray-50 pb-24">
            <main className="flex-1 flex flex-col items-center w-full">
                <div className="w-full max-w-[600px] px-6 py-6 flex flex-col gap-6">
                    {/* Doctor Card */}
                    <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-4">
                        <div className="size-16 rounded-xl bg-gray-100 bg-cover bg-center shrink-0" style={{ backgroundImage: `url('${IMAGES.DOCTOR_ANA}')` }}></div>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-gray-900 text-lg truncate">Dra. Ana Silva</h3>
                            <p className="text-sm text-gray-500 truncate">Clínica VetVida - Botafogo</p>
                            <div className="flex items-center gap-1 mt-1">
                                <span className="text-xs font-semibold text-primary">Clínico Geral</span>
                                <span className="text-gray-300">•</span>
                                <span className="flex items-center gap-0.5 text-yellow-600 text-xs font-bold">
                                    4.9 <span className="material-symbols-outlined text-[12px] fill-current">star</span>
                                </span>
                            </div>
                        </div>
                    </section>

                    {/* Date Picker */}
                    <section>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-bold text-gray-900">Outubro 2024</h2>
                            <div className="flex gap-2">
                                <button className="p-1 hover:bg-gray-100 rounded-full"><span className="material-symbols-outlined">chevron_left</span></button>
                                <button className="p-1 hover:bg-gray-100 rounded-full"><span className="material-symbols-outlined">chevron_right</span></button>
                            </div>
                        </div>
                        <div className="flex justify-between gap-2 overflow-x-auto no-scrollbar pb-2">
                            {days.map((d) => (
                                <button 
                                    key={d.date}
                                    onClick={() => setSelectedDate(d.date)}
                                    className={`flex flex-col items-center justify-center min-w-[3.5rem] h-[4.5rem] rounded-2xl border transition-all ${
                                        selectedDate === d.date 
                                            ? 'bg-secondary text-white shadow-md transform scale-105 border-secondary' 
                                            : 'bg-white border-gray-100 text-gray-700 hover:border-secondary'
                                    }`}
                                >
                                    <span className={`text-xs font-medium ${selectedDate === d.date ? 'opacity-90' : ''}`}>{d.day}</span>
                                    <span className="text-lg font-bold">{d.date}</span>
                                </button>
                            ))}
                        </div>
                    </section>

                    {/* Morning Slots */}
                    <section>
                        <div className="flex items-center gap-2 mb-4">
                            <span className="material-symbols-outlined text-gray-400 text-lg">wb_sunny</span>
                            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Manhã</h3>
                        </div>
                        <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                            {morningSlots.map((slot) => (
                                <button
                                    key={slot.time}
                                    disabled={slot.disabled}
                                    onClick={() => setSelectedTime(slot.time)}
                                    className={`py-2 px-1 rounded-lg text-sm font-medium transition-colors ${
                                        slot.disabled 
                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed line-through decoration-gray-400/50' 
                                            : selectedTime === slot.time
                                                ? 'bg-primary text-white shadow-sm ring-2 ring-primary ring-offset-1 font-bold'
                                                : 'bg-white border border-gray-200 text-gray-700 hover:border-primary hover:text-primary'
                                    }`}
                                >
                                    {slot.time}
                                </button>
                            ))}
                        </div>
                    </section>

                    {/* Afternoon Slots */}
                    <section>
                        <div className="flex items-center gap-2 mb-4">
                            <span className="material-symbols-outlined text-gray-400 text-lg">wb_twilight</span>
                            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Tarde</h3>
                        </div>
                        <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                             {afternoonSlots.map((slot) => (
                                <button
                                    key={slot.time}
                                    disabled={slot.disabled}
                                    onClick={() => setSelectedTime(slot.time)}
                                    className={`py-2 px-1 rounded-lg text-sm font-medium transition-colors ${
                                        slot.disabled 
                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed line-through decoration-gray-400/50' 
                                            : selectedTime === slot.time
                                                ? 'bg-primary text-white shadow-sm ring-2 ring-primary ring-offset-1 font-bold'
                                                : 'bg-white border border-gray-200 text-gray-700 hover:border-primary hover:text-primary'
                                    }`}
                                >
                                    {slot.time}
                                </button>
                            ))}
                        </div>
                    </section>
                </div>
            </main>

            {/* Fixed Footer */}
            <div className="fixed bottom-0 w-full bg-white border-t border-gray-100 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-40">
                <div className="max-w-[600px] mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex flex-col items-center sm:items-start">
                        <span className="text-sm text-gray-500">Total a pagar</span>
                        <span className="text-2xl font-bold text-gray-900">R$ 150,00</span>
                    </div>
                    <button 
                        onClick={() => navigate('/orders?success=true')}
                        className="w-full sm:w-auto sm:min-w-[240px] bg-secondary hover:bg-secondary/90 text-white font-bold rounded-xl py-3.5 px-6 text-base transition-colors shadow-lg flex items-center justify-center gap-2"
                    >
                        Confirmar Agendamento
                        <span className="material-symbols-outlined">arrow_forward</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AgendarHorario;