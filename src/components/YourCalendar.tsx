import React, { useState } from 'react';
import { Calendar as FullCalendar, dateFnsLocalizer, View } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale/en-US';
import { useNavigate } from '@tanstack/react-router';

import { useCalendarEvents } from '../hooks/useCalendarEvents';
import { Event } from '../types/api';
import { EventFilters } from '../types/filters';
import EventFilter from './EventFilters';
import { useFilterToggle } from '../hooks/useFilterToggle';
import { FilterContainer } from './FilterContainer';
import { useDebounce } from '../hooks/useDebounce';
import { authService } from '../services/auth.service';

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

const YourCalendar: React.FC = () => {
  const [view, setView] = useState<View>('month');
  const [date, setDate] = useState(new Date());
  const { filtersVisible, toggleFilters } = useFilterToggle();
  const isAuthenticated = authService.isAuthenticated();

  // Set time range for week/day views to show only relevant hours
  // Most events happen between 6 PM and 3 AM
  const minTime = React.useMemo(() => new Date(0, 0, 0, 18, 0, 0), []); // 6 PM
  const maxTime = React.useMemo(() => new Date(0, 0, 0, 27, 0, 0), []); // 3 AM next day

  const [filters, setFilters] = useState<EventFilters>({
    name: '',
    venue: '',
    promoter: '',
    entity: '',
    event_type: '',
    tag: '',
    door_price_min: '',
    door_price_max: '',
    min_age: '',
    is_benefit: undefined
  });

  const debouncedFilters = useDebounce(filters, 300);
  const navigate = useNavigate();

  const { data: events, isLoading, isError } = useCalendarEvents({
    currentDate: date,
    filters: debouncedFilters,
    attendingOnly: true,
  });

  const formattedEvents = React.useMemo(() => {
    if (!events?.data) {
      return [];
    }

    return events.data.map((event: Event) => ({
      id: String(event.id),
      title: event.name,
      start: new Date(event.start_at),
      end: new Date(event.end_at || event.start_at),
      resource: event
    }));
  }, [events]);

  const handleViewChange = (newView: View): void => {
    setView(newView);
  };

  const handleDateChange = (newDate: Date): void => {
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

  const eventStyleGetter = () => {
    const style = {
      backgroundColor: '#3174ad',
      borderRadius: '5px',
      opacity: 0.8,
      color: 'white',
      border: '0px',
      display: 'block',
    };
    return {
      style,
    };
  };

  const hasActiveFilters = Boolean(
    filters.name ||
    filters.venue ||
    filters.promoter ||
    filters.entity ||
    filters.event_type ||
    filters.tag ||
    filters.door_price_min ||
    filters.door_price_max ||
    filters.min_age ||
    filters.is_benefit !== undefined
  );

  const calendarEvents = isAuthenticated ? formattedEvents : [];
  const showEmptyState = isAuthenticated && !isLoading && !isError && calendarEvents.length === 0;

  return (
    <div className="calendar-container p-4">
      <FilterContainer
        filtersVisible={filtersVisible}
        onToggleFilters={toggleFilters}
        hasActiveFilters={hasActiveFilters}
        onClearAllFilters={() => setFilters({
          name: '',
          venue: '',
          promoter: '',
          entity: '',
          event_type: '',
          tag: '',
          door_price_min: '',
          door_price_max: '',
          min_age: '',
          is_benefit: undefined
        })}
      >
        <EventFilter
          filters={filters}
          onFilterChange={setFilters}
        />
      </FilterContainer>

      {!isAuthenticated && (
        <div className="text-center py-8 text-gray-600 dark:text-gray-300">
          Please log in to view the events you are attending.
        </div>
      )}

      {isLoading && isAuthenticated && (
        <div className="text-center py-8">Loading your events...</div>
      )}

      {isError && isAuthenticated && (
        <div className="text-center py-8 text-red-600">
          Error loading your events. The calendar interface is still available for testing filters.
        </div>
      )}

      {showEmptyState && (
        <div className="text-center py-8 text-gray-600 dark:text-gray-300">
          You are not attending any events in this date range.
        </div>
      )}

      <FullCalendar
        localizer={localizer}
        events={calendarEvents}
        startAccessor="start"
        endAccessor="end"
        view={view}
        date={date}
        onView={handleViewChange}
        onNavigate={handleDateChange}
        onSelectEvent={handleSelectEvent}
        eventPropGetter={eventStyleGetter}
        min={minTime}
        max={maxTime}
        popup
        popupOffset={{ x: 10, y: 10 }}
        style={{ height: 'calc(100vh - 120px)' }}
      />
    </div>
  );
};

export default YourCalendar;
