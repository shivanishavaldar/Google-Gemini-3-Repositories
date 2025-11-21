import React from 'react';
import { CalendarDay } from '../types';

interface CalendarProps {
  days: CalendarDay[];
  onDayClick: (day: CalendarDay) => void;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const Calendar: React.FC<CalendarProps> = ({ days, onDayClick }) => {
  return (
    <div className="w-full max-w-6xl mx-auto bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
      {/* Weekday Headers */}
      <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50">
        {WEEKDAYS.map((day) => (
          <div key={day} className="py-3 text-center text-sm font-semibold text-slate-500 uppercase tracking-wider">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 auto-rows-fr bg-slate-200 gap-[1px]">
        {days.map((day, index) => {
          const hasPapers = day.papers.length > 0;
          
          // Heatmap color logic based on paper count
          let bgClass = 'bg-white hover:bg-slate-50';
          let countClass = 'bg-slate-100 text-slate-600';
          
          if (hasPapers) {
             if (day.papers.length > 10) {
                countClass = 'bg-brand-600 text-white';
             } else if (day.papers.length > 5) {
                countClass = 'bg-brand-400 text-white';
             } else {
                countClass = 'bg-brand-200 text-brand-800';
             }
          }

          if (!day.isCurrentMonth) {
            bgClass = 'bg-slate-50/50 text-slate-400';
          }

          if (day.isToday) {
            bgClass = 'bg-brand-50 ring-inset ring-2 ring-brand-200';
          }

          return (
            <div 
              key={index} 
              onClick={() => onDayClick(day)}
              className={`
                relative min-h-[100px] p-2 cursor-pointer transition-colors duration-150
                flex flex-col justify-between
                ${bgClass}
              `}
            >
              <div className="flex justify-between items-start">
                 <span className={`
                   text-sm font-medium rounded-full w-7 h-7 flex items-center justify-center
                   ${day.isToday ? 'bg-brand-600 text-white' : ''}
                 `}>
                   {day.date.getDate()}
                 </span>
              </div>
              
              {hasPapers && (
                <div className="mt-2">
                  <div className={`text-xs font-bold px-2 py-1 rounded-md w-fit mb-1 ${countClass}`}>
                    {day.papers.length} Papers
                  </div>
                  <div className="flex flex-wrap gap-1">
                     {day.papers.slice(0, 3).map((p, i) => (
                         <div key={i} className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                     ))}
                     {day.papers.length > 3 && <span className="text-[10px] text-slate-400 leading-none">+</span>}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};