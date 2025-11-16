
'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useState } from 'react';

interface MonthPickerProps {
  date?: Date;
  onChange: (date: Date) => void;
}

export function MonthPicker({ date, onChange }: MonthPickerProps) {
  const [currentYear, setCurrentYear] = useState(date ? date.getFullYear() : new Date().getFullYear());
  const [isOpen, setIsOpen] = useState(false);

  const handleMonthSelect = (monthIndex: number) => {
    const newDate = new Date(currentYear, monthIndex, 1);
    onChange(newDate);
    setIsOpen(false);
  };
  
  const months = Array.from({ length: 12 }, (e, i) => {
    return new Date(currentYear, i, 1);
  });

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={'outline'}
          className={cn(
            'w-full justify-start text-left font-normal',
            !date && 'text-muted-foreground'
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, 'yyyy-MM') : <span>정산 월 선택</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="p-2">
            <div className="flex items-center justify-between mb-2">
                <Button variant="ghost" size="icon" onClick={() => setCurrentYear(currentYear - 1)}><ChevronLeft className="h-4 w-4" /></Button>
                <span className="font-semibold text-sm">{currentYear}년</span>
                <Button variant="ghost" size="icon" onClick={() => setCurrentYear(currentYear + 1)}><ChevronRight className="h-4 w-4" /></Button>
            </div>
            <div className="grid grid-cols-3 gap-2">
                {months.map((month, index) => (
                    <Button
                        key={index}
                        variant={date && date.getMonth() === index && date.getFullYear() === currentYear ? 'default' : 'ghost'}
                        onClick={() => handleMonthSelect(index)}
                        className="h-8"
                    >
                        {format(month, 'MMM', { locale: ko })}
                    </Button>
                ))}
            </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

    