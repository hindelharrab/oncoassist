import React, { useState } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { useSettings } from '../../context/SettingsContext';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Clock, 
  MapPin, 
  User,
  MoreVertical,
  Calendar as CalendarIcon,
  Search,
  Filter,
  Info
} from 'lucide-react';

const AgendaPage = () => {
  const { theme } = useSettings();
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState(today);

  const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const monthName = currentDate.toLocaleString('fr-FR', { month: 'long' });
  const year = currentDate.getFullYear();

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  // Generative mock appointments based on the selected day
  const getDailyAppointments = (day) => {
    // Deterministic mock data linked to the day number
    const seed = day.getDate();
    if (seed % 3 === 0) return []; // Empty days
    
    return [
      { 
        id: `${seed}-1`, 
        patient: "Houda El Amrani", 
        motif: "Consultation Post-Opératoire - Contrôle cicatrisation",
        time: "11:00 AM", 
        status: "confirmé",
        type: "Urgent"
      },
      { 
        id: `${seed}-2`, 
        patient: seed % 2 === 0 ? "Karima Mansouri" : "Sara Berrada", 
        motif: "Lecture Mammographie et discussion résultats biopsie",
        time: "02:30 PM", 
        status: "en attente",
        type: "Suivi"
      }
    ].filter((_, i) => (seed + i) % 2 === 0 || i === 0);
  };

  const currentAppointments = getDailyAppointments(selectedDate);

  const hours = Array.from({ length: 12 }, (_, i) => i + 8); // 8 AM to 8 PM

  const calendarDays = [];
  const totalDays = daysInMonth(currentDate.getFullYear(), currentDate.getMonth());
  const startOffset = firstDayOfMonth(currentDate.getFullYear(), currentDate.getMonth());

  // Fill previous month padding
  const prevMonthTotalDays = daysInMonth(currentDate.getFullYear(), currentDate.getMonth() - 1);
  for (let i = startOffset - 1; i >= 0; i--) {
    calendarDays.push({ day: prevMonthTotalDays - i, currentMonth: false, date: new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, prevMonthTotalDays - i) });
  }

  // Fill current month
  for (let i = 1; i <= totalDays; i++) {
    calendarDays.push({ day: i, currentMonth: true, date: new Date(currentDate.getFullYear(), currentDate.getMonth(), i) });
  }

  // Fill next month padding
  const remaining = 42 - calendarDays.length;
  for (let i = 1; i <= remaining; i++) {
    calendarDays.push({ day: i, currentMonth: false, date: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, i) });
  }

  const isToday = (d) => d.toDateString() === today.toDateString();
  const isSelected = (d) => d.toDateString() === selectedDate.toDateString();

  return (
    <div className="h-full flex flex-col lg:flex-row gap-2 p-1 overflow-hidden font-inter bg-white dark:bg-gray-950">
      
      {/* --- SECTION CALENDRIER (Main) --- */}
      <div className="flex-1 bg-white dark:bg-gray-900 rounded-2xl border border-gray-50 dark:border-gray-800 shadow-sm flex flex-col h-full transition-all">
        
        {/* Header du Calendrier */}
        <div className="p-6 border-b border-gray-50 dark:border-gray-800 flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">Agenda</h1>
            <p className="text-gray-400 dark:text-gray-500 text-[11px] font-medium mt-0.5">Planification et gestion des consultations</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded-lg font-bold text-[11px] hover:opacity-80 transition-all shadow-sm">
              <Plus size={14} strokeWidth={3} />
              Nouveau RDV
            </button>
          </div>
        </div>

        {/* Barre de navigation mois */}
        <div className="px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <button onClick={prevMonth} className="p-1.5 border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg text-gray-400 hover:text-black dark:hover:text-white transition-all">
                <ChevronLeft size={16} />
              </button>
              <button onClick={nextMonth} className="p-1.5 border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg text-gray-400 hover:text-black dark:hover:text-white transition-all">
                <ChevronRight size={16} />
              </button>
            </div>
            <h2 className="text-base font-bold text-gray-900 dark:text-white tracking-tight capitalize">
              {monthName} {year}
            </h2>
          </div>
          <button 
            onClick={() => {
              setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1));
              setSelectedDate(today);
            }} 
            className="px-4 py-1.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-white font-bold text-[11px] rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
          >
            Aujourd'hui
          </button>
        </div>

        {/* Calendar Grid - Scrollable */}
        <div className="flex-1 overflow-y-auto px-6 pb-6 custom-scrollbar">
          <div className="grid grid-cols-7 border-t border-l border-gray-100 dark:border-gray-800">
            {['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'].map(day => (
              <div key={day} className="py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center border-r border-gray-100 dark:border-gray-800 bg-gray-50/10">
                {day}
              </div>
            ))}
            
            {calendarDays.map((item, index) => (
              <motion.div 
                key={index}
                whileHover={{ backgroundColor: item.currentMonth ? (theme === 'sombre' ? '#111827' : '#fcfcfc') : (theme === 'sombre' ? '#1f2937' : '#ffffff') }}
                onClick={() => setSelectedDate(item.date)}
                className={`min-h-[110px] p-2 border-r border-b border-gray-100 dark:border-gray-800 transition-all cursor-pointer relative ${
                  !item.currentMonth ? 'bg-gray-50/10 dark:bg-gray-900/10 opacity-30' : 'bg-white dark:bg-gray-900'
                } ${isSelected(item.date) ? 'ring-2 ring-inset ring-black dark:ring-white z-10' : ''}`}
              >
                <div className="flex items-center justify-between pointer-events-none">
                  <span className={`text-[11px] font-bold ${
                    isToday(item.date) ? 'text-white bg-black dark:bg-white dark:text-black w-5 h-5 flex items-center justify-center rounded-full' : 
                    isSelected(item.date) ? 'text-gray-900 dark:text-white font-black' : 'text-gray-400 font-medium'
                  }`}>
                    {item.date.getDate()}
                  </span>
                </div>

                {/* RDV Indicators (Cute Pastel Style matching image) */}
                <div className="mt-2 space-y-1">
                  {item.currentMonth && getDailyAppointments(item.date).slice(0, 3).map((apt, i) => {
                    const colors = [
                      'bg-rose-100/60 text-rose-800 border-rose-200/50',
                      'bg-indigo-100/60 text-indigo-800 border-indigo-200/50',
                      'bg-amber-100/60 text-amber-800 border-amber-200/50',
                      'bg-sky-100/60 text-sky-800 border-sky-200/50',
                      'bg-purple-100/60 text-purple-800 border-purple-200/50'
                    ];
                    const colorClass = colors[i % colors.length];
                    
                    return (
                      <div key={i} className={`text-[9px] px-1.5 py-0.5 rounded font-bold border truncate tracking-tighter ${colorClass}`}>
                        {apt.patient.split(' ')[0]}
                      </div>
                    );
                  })}
                  {item.currentMonth && getDailyAppointments(item.date).length > 3 && (
                    <div className="text-[8px] text-gray-400 font-bold pl-1 italic">
                      + {getDailyAppointments(item.date).length - 3} autres
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* --- PANEL DROIT --- */}
      <div className="w-full lg:w-[320px] flex flex-col gap-2 shrink-0 h-full">
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm p-5 flex flex-col h-full overflow-hidden">
          <div className="flex items-center justify-between mb-6 shrink-0 pb-4 border-b border-gray-50 dark:border-gray-800">
            <div>
              <h3 className="text-gray-900 dark:text-white font-bold text-sm tracking-tight uppercase">
                {selectedDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
              </h3>
              <p className="text-gray-400 dark:text-gray-500 text-[10px] font-medium mt-0.5">{currentAppointments.length} Cliniques prévues</p>
            </div>
            {isToday(selectedDate) && (
              <span className="bg-black dark:bg-white text-white dark:text-black text-[7px] px-2 py-0.5 rounded font-bold">AUJOURD'HUI</span>
            )}
          </div>

          <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
            <div className="relative pl-8 border-l border-gray-100 dark:border-gray-800 ml-8 py-2">
              {hours.map((hour) => {
                const hourApts = currentAppointments.filter(apt => {
                  const aptHour = parseInt(apt.time.split(':')[0]);
                  const isPM = apt.time.includes('PM');
                  const normalizedAptHour = (isPM && aptHour !== 12) ? aptHour + 12 : aptHour;
                  return normalizedAptHour === hour;
                });

                return (
                  <div key={hour} className="relative mb-4 last:mb-0">
                    <div className="absolute -left-[54px] top-0 text-[10px] font-bold text-gray-300 dark:text-gray-600 w-10 text-right pr-2">
                      {hour < 10 ? `0${hour}` : hour}:00
                    </div>

                    <div className="absolute -left-[35px] top-1.5 w-1.5 h-1.5 rounded-full bg-gray-200 dark:bg-gray-700 z-10" />

                    <div className="space-y-1.5">
                      {hourApts.map((apt) => (
                        <motion.div 
                          key={apt.id}
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-3 rounded-lg border border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-800/10 hover:bg-gray-50 transition-all shadow-sm"
                        >
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center justify-between">
                              <h4 className="text-[11px] font-bold text-gray-900 dark:text-white uppercase">{apt.patient}</h4>
                              <span className={`text-[6px] font-black uppercase px-1.5 py-0.5 rounded ${
                                apt.status === 'confirmé' ? 'bg-sky-50 text-sky-600' : 'bg-amber-50 text-amber-600'
                              }`}>
                                {apt.status}
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-2 text-[9px] font-medium text-gray-400">
                              <div className="flex items-center gap-1">
                                <Clock size={9} />
                                {apt.time}
                              </div>
                            </div>
                            
                            <div className="mt-1 p-2 bg-white dark:bg-gray-800 rounded border border-gray-50 dark:border-gray-700">
                              <p className="text-[9px] text-gray-500 font-medium italic line-clamp-1">
                                {apt.motif}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                      
                      {hourApts.length === 0 && (
                        <div className="h-4" /> 
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {currentAppointments.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-center grayscale opacity-10">
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Aucun rendez-vous prévu</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgendaPage;
