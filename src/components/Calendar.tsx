import React from 'react';
import { useState } from 'react';
import { Calendar as FullCalendar, dateFnsLocalizer, View } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useEvents } from '../hooks/useEvents';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale/en-US';
import { Event } from '../types/api';


const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 0 }),
  getDay,
  locales,
});

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
}

const Calendar: React.FC = () => {
  const [view, setView] = useState<View>('month');
  const [showImages, setShowImages] = useState(false);
  const [date, setDate] = useState(new Date());
  const { data: events } = useEvents();

  // Transform and validate events
  const formattedEvents = React.useMemo(() => {
    // the actual events are in events.data

    if (!events) return [];

    // output the contents of events to the console
    // console.log(events.data);

    // Convert to array if needed and ensure type safety
    // const eventArray = Array.isArray(events.data) ? events.data : Object.values(events.data || {});

    return events.data.map((event: Event) => ({
      id: event.id || String(Math.random()),
      title: event.name || 'Untitled Event',
      start: new Date(event.start_at),
      end: new Date(event.end_at || event.start_at),
    }));
  }, [events]);

  const handleViewChange = (newView: View): void => {
    setView(newView);
  };

  const handleDateChange = (newDate: Date): void => {
    setDate(newDate);
  };

  const handleToggleImages = (): void => {
    setShowImages(!showImages);
  };

  const handleNavigate = (newDate) => {
    setDate(newDate);
  };

  const eventStyleGetter = (event) => {
    const style = {
      backgroundColor: '#3174ad',
      borderRadius: '5px',
      opacity: 0.8,
      color: 'white',
      border: '0px',
      display: 'block',
    };
    return {
      style: style,
    };
  };

  return (
    <div className="calendar-container">
      <div className="calendar-controls">
        <Button onClick={() => handleViewChange('month')}>Month</Button>
        <Button onClick={() => handleViewChange('week')}>Week</Button>
        <Button onClick={() => handleViewChange('day')}>Day</Button>
        <Switch checked={showImages} onCheckedChange={handleToggleImages} />
        <Button onClick={() => handleNavigate(new Date(date.setMonth(date.getMonth() - 1)))}>Previous</Button>
        <Button onClick={() => handleNavigate(new Date(date.setMonth(date.getMonth() + 1)))}>Next</Button>
      </div>
      <FullCalendar
        localizer={localizer}
        events={formattedEvents}
        startAccessor="start"
        endAccessor="end"
        view={view}
        onView={handleViewChange}
        date={date}
        onNavigate={handleDateChange}
      />
    </div>
  );
};

export default Calendar;
