import React from 'react';
import { useState, useEffect } from 'react';
import { Calendar as FullCalendar, dateFnsLocalizer, View } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useCalendarEvents } from '../hooks/useCalendarEvents';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale/en-US';
import { Event } from '../types/api';
import { useNavigate } from '@tanstack/react-router';


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
  const navigate = useNavigate();

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

  const handleSelectEvent = (calendarEvent: CalendarEvent & { resource: Event }) => {
    if (calendarEvent.resource?.slug) {
      navigate({
        to: '/events/$slug',
        params: { slug: calendarEvent.resource.slug },
      });
    }
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

      <FullCalendar
        localizer={localizer}
        events={formattedEvents}
        startAccessor="start"
        endAccessor="end"
        view={view}
        date={date}
        onView={handleViewChange}
        onNavigate={handleDateChange}
        onSelectEvent={handleSelectEvent}
        eventPropGetter={eventStyleGetter}
        style={{ height: 800 }}
      />
    </div>
  );
};

export default Calendar;
