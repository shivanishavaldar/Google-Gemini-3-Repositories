import React, { useState, useEffect, useMemo } from 'react';
import { Calendar } from './components/Calendar';
import { PaperList } from './components/PaperList';
import { ChevronLeft, ChevronRight, CalendarIcon, LoaderIcon, SearchIcon, XIcon } from './components/Icons';
import { fetchPapersByMonth } from './services/biorxivService';
import { BioRxivPaper, CalendarDay } from './types';

function App() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [allPapers, setAllPapers] = useState<BioRxivPaper[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Selected Date (Date object) to ensure we can re-derive selectedDay data when filtering changes
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  
  // Search State
  const [searchQuery, setSearchQuery] = useState('');

  // Filter papers based on search query
  const filteredPapers = useMemo(() => {
    if (!searchQuery.trim()) return allPapers;

    const query = searchQuery.toLowerCase();
    return allPapers.filter(paper => 
      paper.title.toLowerCase().includes(query) ||
      paper.abstract.toLowerCase().includes(query) ||
      paper.authors.toLowerCase().includes(query) ||
      paper.category.toLowerCase().includes(query)
    );
  }, [allPapers, searchQuery]);

  // Generate calendar days based on current month and filtered papers
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    
    const startDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sunday
    
    const days: CalendarDay[] = [];
    
    // Previous month fill
    for (let i = startDayOfWeek; i > 0; i--) {
        const d = new Date(year, month, 1 - i);
        days.push({
            date: d,
            isCurrentMonth: false,
            isToday: false, // Simplified for filler
            papers: []
        });
    }
    
    // Current month
    for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
        const d = new Date(year, month, i);
        const today = new Date();
        const isToday = d.getDate() === today.getDate() && 
                        d.getMonth() === today.getMonth() && 
                        d.getFullYear() === today.getFullYear();
        
        // Filter papers for this day from the filtered set
        const dayString = d.toISOString().split('T')[0];
        const daysPapers = filteredPapers.filter(p => p.date === dayString);

        days.push({
            date: d,
            isCurrentMonth: true,
            isToday,
            papers: daysPapers
        });
    }
    
    // Next month fill to complete the grid (max 42 cells usually)
    const remaining = 42 - days.length; // 6 rows * 7 cols
    for (let i = 1; i <= remaining; i++) {
        const d = new Date(year, month + 1, i);
        days.push({
            date: d,
            isCurrentMonth: false,
            isToday: false,
            papers: []
        });
    }
    
    return days;
  }, [currentDate, filteredPapers]);

  // Load papers when month changes
  useEffect(() => {
    const loadPapers = async () => {
      setLoading(true);
      const fetchedPapers = await fetchPapersByMonth(currentDate.getFullYear(), currentDate.getMonth());
      setAllPapers(fetchedPapers);
      setLoading(false);
    };
    
    loadPapers();
  }, [currentDate]);

  const handlePrevMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    setSelectedDate(null);
  };

  const handleNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    setSelectedDate(null);
  };

  const handleDayClick = (day: CalendarDay) => {
    setSelectedDate(day.date);
  };

  // Derived selected day data for the modal
  const activeSelectedDay = useMemo(() => {
    if (!selectedDate) return null;
    // We can try to find it in the current calendar days first for performance
    const foundInCalendar = calendarDays.find(
      d => d.date.toDateString() === selectedDate.toDateString()
    );
    
    if (foundInCalendar) return foundInCalendar;

    // Fallback (unlikely unless selectedDate is stale from month switch, but we clear it on switch)
    return {
       date: selectedDate,
       isCurrentMonth: true,
       isToday: false,
       papers: []
    } as CalendarDay;
  }, [selectedDate, calendarDays]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans relative overflow-x-hidden">
      
      {/* Top Navigation Bar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="p-2 bg-brand-600 rounded-lg text-white hidden sm:block">
              <CalendarIcon className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold text-slate-800">
              BioRxiv <span className="text-brand-600">Explorer</span>
            </h1>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-lg relative group">
             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon className="h-5 w-5 text-slate-400 group-focus-within:text-brand-500 transition-colors" />
             </div>
             <input 
               type="text"
               className="block w-full pl-10 pr-10 py-2 border border-slate-300 rounded-full leading-5 bg-slate-50 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 sm:text-sm transition-all shadow-sm"
               placeholder="Search titles, authors, keywords..."
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
             />
             {searchQuery && (
               <button 
                 onClick={() => setSearchQuery('')}
                 className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer text-slate-400 hover:text-slate-600"
               >
                 <XIcon className="h-4 w-4" />
               </button>
             )}
          </div>

          {/* Date Controls */}
          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg shrink-0">
            <button onClick={handlePrevMonth} className="p-2 hover:bg-white rounded-md shadow-sm transition-all text-slate-600">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-sm font-semibold w-32 text-center hidden md:block">
              {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </span>
            <span className="text-sm font-semibold w-16 text-center block md:hidden">
              {currentDate.toLocaleDateString('en-US', { month: 'short' })}
            </span>
            <button onClick={handleNextMonth} className="p-2 hover:bg-white rounded-md shadow-sm transition-all text-slate-600">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
           <div>
               <h2 className="text-2xl font-bold text-slate-800">Monthly Overview</h2>
               {searchQuery && (
                   <p className="text-sm text-slate-500 mt-1">
                       Showing results for "<span className="font-semibold text-brand-600">{searchQuery}</span>" 
                       ({filteredPapers.length} papers found)
                   </p>
               )}
           </div>
           
           {loading && (
               <div className="flex items-center gap-2 text-brand-600 text-sm font-medium bg-brand-50 px-3 py-1 rounded-full border border-brand-100">
                   <LoaderIcon className="w-4 h-4 animate-spin" />
                   Fetching BioRxiv Data...
               </div>
           )}
        </div>

        <Calendar days={calendarDays} onDayClick={handleDayClick} />
        
        <div className="mt-8 text-center text-slate-400 text-sm">
            <p>Data provided by the BioRxiv API. Not officially affiliated with Cold Spring Harbor Laboratory.</p>
        </div>
      </main>

      {/* Side Panel / Modal for Papers */}
      {activeSelectedDay && (
          <>
            {/* Backdrop for mobile */}
            <div 
                className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 transition-opacity"
                onClick={() => setSelectedDate(null)}
            />
            <PaperList 
                date={activeSelectedDay.date} 
                papers={activeSelectedDay.papers} 
                onClose={() => setSelectedDate(null)} 
            />
          </>
      )}
    </div>
  );
}

export default App;