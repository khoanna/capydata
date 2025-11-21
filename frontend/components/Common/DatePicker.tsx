"use client";

import { useState, useRef, useEffect } from "react";
import { Calendar, ChevronLeft, ChevronRight, X } from "lucide-react";

interface DatePickerProps {
  label?: string;
  value?: string; // ISO date string (YYYY-MM-DD)
  onChange: (value: string) => void;
  hint?: string;
  placeholder?: string;
}

const DatePicker = ({
  label,
  value,
  onChange,
  hint,
  placeholder = "Select date",
}: DatePickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Parse the value to display
  const selectedDate = value ? new Date(value) : null;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Format date for display
  const formatDate = (date: Date | null) => {
    if (!date) return "";
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Get calendar days for current month
  const getDaysInMonth = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (number | null)[] = [];

    // Add empty slots for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add actual days
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    return days;
  };

  const handleDateSelect = (day: number) => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const selected = new Date(year, month, day);
    const isoString = selected.toISOString().split("T")[0];
    onChange(isoString);
    setIsOpen(false);
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const handleClear = () => {
    onChange("");
  };

  const handleToday = () => {
    const today = new Date();
    const isoString = today.toISOString().split("T")[0];
    onChange(isoString);
    setIsOpen(false);
  };

  const isToday = (day: number) => {
    const today = new Date();
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    return (
      today.getDate() === day &&
      today.getMonth() === month &&
      today.getFullYear() === year
    );
  };

  const isSelected = (day: number) => {
    if (!selectedDate) return false;
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    return (
      selectedDate.getDate() === day &&
      selectedDate.getMonth() === month &&
      selectedDate.getFullYear() === year
    );
  };

  const monthYear = currentMonth.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const weekDays = ["S", "M", "T", "W", "T", "F", "S"];
  const days = getDaysInMonth();

  return (
    <div className="w-full">
      {label && (
        <label className="block font-mono text-xs text-gray-400 mb-2 tracking-wide">
          {label}
        </label>
      )}

      <div className="relative" ref={dropdownRef}>
        {/* Input Display */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full glass-input px-4 py-3 rounded-lg font-mono text-sm text-left flex items-center justify-between transition-all duration-300 ${
            isOpen ? "border-yuzu/50 shadow-[0_0_20px_rgba(255,159,28,0.2)]" : ""
          }`}
        >
          <div className="flex items-center gap-3">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className={selectedDate ? "text-white" : "text-gray-500"}>
              {selectedDate ? formatDate(selectedDate) : placeholder}
            </span>
          </div>
          {selectedDate && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleClear();
              }}
              className="text-gray-400 hover:text-white transition-colors p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </button>

        {/* Calendar Dropdown */}
        {isOpen && (
          <div className="absolute z-50 w-full mt-2 glass-card rounded-lg border border-white/10 shadow-xl backdrop-blur-xl p-4
            animate-in fade-in slide-in-from-top-2 duration-300 ease-[cubic-bezier(0.23,1,0.32,1)]">

            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={handlePrevMonth}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-4 h-4 text-gray-400" />
              </button>
              <span className="font-mono text-sm font-bold text-white tracking-wide">
                {monthYear}
              </span>
              <button
                onClick={handleNextMonth}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            {/* Weekday Headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {weekDays.map((day, i) => (
                <div
                  key={i}
                  className="text-center font-mono text-xs text-gray-500 font-bold py-2"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-1">
              {days.map((day, index) => {
                if (day === null) {
                  return <div key={`empty-${index}`} className="aspect-square" />;
                }

                const isTodayDay = isToday(day);
                const isSelectedDay = isSelected(day);

                return (
                  <button
                    key={day}
                    onClick={() => handleDateSelect(day)}
                    className={`aspect-square flex items-center justify-center rounded-lg font-mono text-sm transition-all
                      ${isSelectedDay
                        ? "bg-yuzu text-black font-bold shadow-[0_0_10px_rgba(255,159,28,0.5)]"
                        : isTodayDay
                        ? "bg-hydro/20 text-hydro border border-hydro/50"
                        : "text-gray-300 hover:bg-white/10 hover:text-white"
                      }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
              <button
                onClick={handleClear}
                className="font-mono text-xs text-gray-400 hover:text-error transition-colors"
              >
                Clear
              </button>
              <button
                onClick={handleToday}
                className="font-mono text-xs text-hydro hover:text-white transition-colors"
              >
                Today
              </button>
            </div>
          </div>
        )}
      </div>

      {hint && (
        <p className="mt-2 text-xs font-mono text-gray-500">{hint}</p>
      )}
    </div>
  );
};

export default DatePicker;
