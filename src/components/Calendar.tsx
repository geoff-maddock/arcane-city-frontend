import React, { useState, useEffect } from 'react';
import { Calendar as FullCalendar, dateFnsLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useEvents } from '../hooks/useEvents';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import enUS from 'date-fns/locale/en-US';

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

const Calendar = () => {
  const [view, setView] = useState('month');
  const [showImages, setShowImages] = useState(false);
  const [date, setDate] = useState(new Date());
  const { data: events, isLoading, error } = useEvents();

  const handleViewChange = (newView) => {
    setView(newView);
  };

  const handleToggleImages = () => {
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
        events={events || []}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 500 }}
        view={view}
        onView={handleViewChange}
        date={date}
        onNavigate={handleNavigate}
        eventPropGetter={eventStyleGetter}
      />
    </div>
  );
};

export default Calendar;
