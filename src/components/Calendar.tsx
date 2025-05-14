import React from 'react';
import { useState, useEffect } from 'react';
import { dateFnsLocalizer, View } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useCalendarEvents } from '../hooks/useCalendarEvents';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale/en-US';
import { Event } from '../types/api';
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'


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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { data: events, isLoading, isError } = useCalendarEvents({
    currentDate: date
  });

  const formattedEvents = React.useMemo(() => {
    if (!events?.data) {
      return [];
    }

    return events.data.map((event: Event) => ({
      id: event.id,
      title: event.name,
      start: new Date(event.start_at),
      end: new Date(event.end_at || event.start_at),
      resource: event
    }));
  }, [events]);

  if (isLoading) return <div>Loading events...</div>;
  if (isError) return <div>Error loading events</div>;

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
        plugins={[dayGridPlugin]}
        initialView="dayGridMonth"
        weekends={false}
        localizer={localizer}
        events={formattedEvents}
        startAccessor="start"
        endAccessor="end"
        view={view}
        date={date}
        onView={handleViewChange}
        onNavigate={handleDateChange}
        eventPropGetter={eventStyleGetter}
        style={{ height: 800 }}
      />
    </div>
  );
};

export default Calendar;
