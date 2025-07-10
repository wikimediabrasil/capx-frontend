"use client";

import { useState, useRef, useEffect } from "react";
import { useApp } from "@/contexts/AppContext";
import { useTheme } from "@/contexts/ThemeContext";
import { getLocaleFromLanguage, getDatePickerTexts } from "@/lib/utils/dateLocale";

interface CustomDatePickerProps {
  value: string; // format: "2025-07-19T14:30"
  onChange: (value: string) => void;
  className?: string;
  disabled?: boolean;
  placeholder?: string;
}

interface DateTimeValue {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
}

export default function CustomDatePicker({
  value,
  onChange,
  className = "",
  disabled = false,
  placeholder = ""
}: CustomDatePickerProps) {
  const { language, pageContent } = useApp();
  const { darkMode } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [currentView, setCurrentView] = useState<'calendar' | 'time'>('calendar');
  const [viewDate, setViewDate] = useState(new Date());
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Parse the current value
  const parseValue = (val: string): DateTimeValue | null => {
    if (!val) return null;
    try {
      const date = new Date(val);
      if (isNaN(date.getTime())) return null;
      return {
        year: date.getFullYear(),
        month: date.getMonth(),
        day: date.getDate(),
        hour: date.getHours(),
        minute: date.getMinutes()
      };
    } catch {
      return null;
    }
  };

  const currentValue = parseValue(value);

  // Localized texts
  const getLocalizedTexts = () => {
    const locale = getLocaleFromLanguage(language);
    
    // Month names
    const months = Array.from({ length: 12 }, (_, i) => {
      const date = new Date(2024, i, 1);
      return date.toLocaleDateString(locale, { month: 'long' });
    });

    // Weekday names (starting on Sunday)
    const weekdays = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(2024, 0, 7 + i); // 7th of January 2024 was a Sunday
      return date.toLocaleDateString(locale, { weekday: 'short' });
    });

    // Interface texts - using centralized translation system
    const texts = getDatePickerTexts(pageContent);

    return { months, weekdays, texts };
  };

  const { months, weekdays, texts } = getLocalizedTexts();

  // Format value for display in the input
  const formatDisplayValue = (val: string) => {
    if (!val) return '';
    try {
      const date = new Date(val);
      const locale = getLocaleFromLanguage(language);
      return date.toLocaleString(locale, {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: locale.startsWith('en-')
      });
    } catch {
      return val;
    }
  };

  // Generate calendar days
  const getCalendarDays = () => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    
    // First day of the month
    const firstDay = new Date(year, month, 1);
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0);
    
    // First Sunday of the week that contains the first day
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - startDate.getDay());
    
    // Last Saturday of the week that contains the last day
    const endDate = new Date(lastDay);
    endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));
    
    const days: Array<{
      date: Date;
      isCurrentMonth: boolean;
      isToday: boolean;
      isSelected: boolean;
    }> = [];
    const current = new Date(startDate);
    
    while (current <= endDate) {
      days.push({
        date: new Date(current),
        isCurrentMonth: current.getMonth() === month,
        isToday: current.toDateString() === new Date().toDateString(),
        isSelected: Boolean(currentValue && 
                   current.getFullYear() === currentValue.year &&
                   current.getMonth() === currentValue.month &&
                   current.getDate() === currentValue.day)
      });
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  };

  // Navigate months
  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(viewDate);
    newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    setViewDate(newDate);
  };

  // Select date
  const selectDate = (date: Date) => {
    const newValue = {
      year: date.getFullYear(),
      month: date.getMonth(),
      day: date.getDate(),
      hour: currentValue?.hour || 12,
      minute: currentValue?.minute || 0
    };
    
    const newDate = new Date(newValue.year, newValue.month, newValue.day, newValue.hour, newValue.minute);
    onChange(newDate.toISOString().slice(0, 16));
    setCurrentView('time');
  };

  // Update time
  const updateTime = (field: 'hour' | 'minute', val: number) => {
    if (!currentValue) return;
    
    const newValue = { ...currentValue, [field]: val };
    const newDate = new Date(newValue.year, newValue.month, newValue.day, newValue.hour, newValue.minute);
    onChange(newDate.toISOString().slice(0, 16));
  };

  // Set today
  const setToday = () => {
    const now = new Date();
    onChange(now.toISOString().slice(0, 16));
    setViewDate(now);
    setCurrentView('time');
  };

  // Clear value
  const clearValue = () => {
    onChange('');
    setIsOpen(false);
  };

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const calendarDays = getCalendarDays();

  return (
    <div ref={containerRef} className="relative">
      {/* Input */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={formatDisplayValue(value)}
          placeholder={placeholder}
          disabled={disabled}
          readOnly
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className={`${className} cursor-pointer`}
        />
        <div 
          className={`absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none ${
            darkMode ? 'text-white' : 'text-gray-600'
          }`}
        >
          📅
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className={`absolute top-full left-0 mt-1 z-50 w-80 rounded-lg border shadow-lg ${
          darkMode 
            ? 'bg-capx-dark-box-bg border-white text-white' 
            : 'bg-white border-gray-300 text-gray-800'
        }`}>
          
          {/* Header with tabs */}
          <div className={`flex border-b ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
            <button
              onClick={() => setCurrentView('calendar')}
              className={`flex-1 px-4 py-2 text-sm font-medium ${
                currentView === 'calendar'
                  ? darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'
                  : darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {texts.date}
            </button>
            <button
              onClick={() => setCurrentView('time')}
              className={`flex-1 px-4 py-2 text-sm font-medium ${
                currentView === 'time'
                  ? darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'
                  : darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {texts.time}
            </button>
          </div>

          <div className="p-4">
            {currentView === 'calendar' ? (
              <>
                {/* Month navigation */}
                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={() => navigateMonth('prev')}
                    className={`p-1 rounded hover:bg-opacity-20 ${
                      darkMode ? 'hover:bg-white' : 'hover:bg-gray-500'
                    }`}
                  >
                    ←
                  </button>
                  <h3 className="font-semibold">
                    {months[viewDate.getMonth()]} {viewDate.getFullYear()}
                  </h3>
                  <button
                    onClick={() => navigateMonth('next')}
                    className={`p-1 rounded hover:bg-opacity-20 ${
                      darkMode ? 'hover:bg-white' : 'hover:bg-gray-500'
                    }`}
                  >
                    →
                  </button>
                </div>

                {/* Weekdays */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {weekdays.map((day, i) => (
                    <div key={i} className="text-center text-xs font-medium p-1">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar days */}
                <div className="grid grid-cols-7 gap-1">
                  {calendarDays.map((day, i) => (
                    <button
                      key={i}
                      onClick={() => selectDate(day.date)}
                      className={`p-2 text-sm rounded text-center hover:bg-opacity-20 ${
                        !day.isCurrentMonth 
                          ? darkMode ? 'text-gray-500' : 'text-gray-400'
                          : day.isSelected
                            ? 'bg-blue-500 text-white'
                            : day.isToday
                              ? darkMode ? 'bg-blue-800 text-blue-200' : 'bg-blue-100 text-blue-800'
                              : darkMode ? 'hover:bg-white' : 'hover:bg-gray-500'
                      }`}
                    >
                      {day.date.getDate()}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              /* Hour selector */
              <div className="space-y-4">
                <div className="flex items-center justify-center space-x-4">
                  {/* Hour */}
                  <div className="flex flex-col items-center">
                    <label className="text-xs mb-1">Hora</label>
                    <select
                      value={currentValue?.hour || 12}
                      onChange={(e) => updateTime('hour', parseInt(e.target.value))}
                      className={`p-2 rounded border ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-800'
                      }`}
                    >
                      {Array.from({ length: 24 }, (_, i) => (
                        <option key={i} value={i}>
                          {i.toString().padStart(2, '0')}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="text-2xl font-bold">:</div>

                  {/* Minute */}
                  <div className="flex flex-col items-center">
                    <label className="text-xs mb-1">Min</label>
                    <select
                      value={currentValue?.minute || 0}
                      onChange={(e) => updateTime('minute', parseInt(e.target.value))}
                      className={`p-2 rounded border ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-800'
                      }`}
                    >
                      {Array.from({ length: 60 }, (_, i) => (
                        <option key={i} value={i}>
                          {i.toString().padStart(2, '0')}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
              <button
                onClick={setToday}
                className={`px-3 py-1 text-sm rounded ${
                  darkMode 
                    ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                }`}
              >
                {texts.today}
              </button>
              
              <div className="space-x-2">
                <button
                  onClick={clearValue}
                  className={`px-3 py-1 text-sm rounded ${
                    darkMode 
                      ? 'bg-red-800 hover:bg-red-700 text-white' 
                      : 'bg-red-100 hover:bg-red-200 text-red-800'
                  }`}
                >
                  {texts.clear}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className={`px-3 py-1 text-sm rounded ${
                    darkMode 
                      ? 'bg-blue-800 hover:bg-blue-700 text-white' 
                      : 'bg-blue-100 hover:bg-blue-200 text-blue-800'
                  }`}
                >
                  {texts.close}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}