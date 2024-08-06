import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

import { cn } from '@/lib/utils';

import { Button } from './ui/button';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';

type DatePickerProps = {
    value?: Date;
    onChange?: (date: Date | undefined) => void;
};

export default function DatePicker({
    value,
    onChange,
}: DatePickerProps) {
    const [date, setDate] = useState<Date | undefined>(value);

    //To update the date when value is changed
    useEffect(() => {
        setDate(value)
    }, [value]);

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant={'outline'}
                    className={cn(
                        'w-[280px] justify-start text-left font-normal',
                        !date && 'text-muted-foreground',
                    )}
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, 'dd/MM/yyyy') : <span>dd/mm/yyyy</span>}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
                <Calendar
                    defaultMonth={date}
                    mode="single"
                    selected={date}
                    onSelect={(date) => {
                        setDate(date);
                        onChange?.(date);
                    }}
                    initialFocus
                />
            </PopoverContent>
        </Popover>
    );
}