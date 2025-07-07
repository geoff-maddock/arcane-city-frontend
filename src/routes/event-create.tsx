import React, { useState } from 'react';
import { createRoute, useNavigate } from '@tanstack/react-router';
import { rootRoute } from './root';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { AxiosError } from 'axios';
import { formatApiError } from '@/lib/utils';

interface ValidationErrors {
  [key: string]: string[];
}

const EventCreate: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    short: '',
    visibility_id: 1,
    description: '',
    event_status_id: 1,
    event_type_id: 1,
    promoter_id: 1,
    venue_id: 1,
    is_benefit: false,
    presale_price: '',
    door_price: '',
    soundcheck_at: '',
    door_at: '',
    start_at: '',
    end_at: '',
    series_id: '',
    min_age: '',
    primary_link: '',
    ticket_link: '',
    cancelled_at: '',
    tag_list: '',
    entity_list: '',
  });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [generalError, setGeneralError] = useState('');

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setGeneralError('');
    try {
      const payload = {
        ...formData,
        presale_price: formData.presale_price ? parseFloat(formData.presale_price) : undefined,
        door_price: formData.door_price ? parseFloat(formData.door_price) : undefined,
        series_id: formData.series_id ? Number(formData.series_id) : undefined,
        min_age: formData.min_age ? Number(formData.min_age) : undefined,
        tag_list: formData.tag_list ? formData.tag_list.split(',').map((v) => Number(v.trim())) : [],
        entity_list: formData.entity_list ? formData.entity_list.split(',').map((v) => Number(v.trim())) : [],
      };
      const { data } = await api.post('/events', payload);
      navigate({ to: `/events/${data.slug}` });
    } catch (err) {
      if ((err as AxiosError).response?.status === 422) {
        const resp = (err as AxiosError<{ errors: ValidationErrors }>).response;
        if (resp?.data?.errors) {
          setErrors(resp.data.errors);
          return;
        }
      }
      setGeneralError(formatApiError(err));
    }
  };

  const renderError = (field: string) => {
    if (errors[field]) {
      return <div className="text-red-500 text-sm">{errors[field].join(' ')}</div>;
    }
    return null;
  };

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold">Create Event</h1>
      {generalError && <div className="text-red-500">{generalError}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" value={formData.name} onChange={handleChange} />
          {renderError('name')}
        </div>
        <div className="space-y-2">
          <Label htmlFor="slug">Slug</Label>
          <Input id="slug" name="slug" value={formData.slug} onChange={handleChange} />
          {renderError('slug')}
        </div>
        <div className="space-y-2">
          <Label htmlFor="short">Short</Label>
          <textarea
            id="short"
            name="short"
            className="w-full border rounded p-2"
            value={formData.short}
            onChange={handleChange}
          />
          {renderError('short')}
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <textarea
            id="description"
            name="description"
            className="w-full border rounded p-2"
            value={formData.description}
            onChange={handleChange}
          />
          {renderError('description')}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="visibility_id">Visibility Id</Label>
            <Input
              id="visibility_id"
              name="visibility_id"
              type="number"
              value={formData.visibility_id}
              onChange={handleChange}
            />
            {renderError('visibility_id')}
          </div>
          <div className="space-y-2">
            <Label htmlFor="event_status_id">Event Status Id</Label>
            <Input
              id="event_status_id"
              name="event_status_id"
              type="number"
              value={formData.event_status_id}
              onChange={handleChange}
            />
            {renderError('event_status_id')}
          </div>
          <div className="space-y-2">
            <Label htmlFor="event_type_id">Event Type Id</Label>
            <Input
              id="event_type_id"
              name="event_type_id"
              type="number"
              value={formData.event_type_id}
              onChange={handleChange}
            />
            {renderError('event_type_id')}
          </div>
          <div className="space-y-2">
            <Label htmlFor="promoter_id">Promoter Id</Label>
            <Input
              id="promoter_id"
              name="promoter_id"
              type="number"
              value={formData.promoter_id}
              onChange={handleChange}
            />
            {renderError('promoter_id')}
          </div>
          <div className="space-y-2">
            <Label htmlFor="venue_id">Venue Id</Label>
            <Input
              id="venue_id"
              name="venue_id"
              type="number"
              value={formData.venue_id}
              onChange={handleChange}
            />
            {renderError('venue_id')}
          </div>
          <div className="space-y-2 flex items-center gap-2 mt-6">
            <input
              id="is_benefit"
              name="is_benefit"
              type="checkbox"
              checked={formData.is_benefit}
              onChange={handleChange}
            />
            <Label htmlFor="is_benefit">Benefit Event</Label>
            {renderError('is_benefit')}
          </div>
          <div className="space-y-2">
            <Label htmlFor="presale_price">Presale Price</Label>
            <Input
              id="presale_price"
              name="presale_price"
              type="number"
              step="0.01"
              value={formData.presale_price}
              onChange={handleChange}
            />
            {renderError('presale_price')}
          </div>
          <div className="space-y-2">
            <Label htmlFor="door_price">Door Price</Label>
            <Input
              id="door_price"
              name="door_price"
              type="number"
              step="0.01"
              value={formData.door_price}
              onChange={handleChange}
            />
            {renderError('door_price')}
          </div>
          <div className="space-y-2">
            <Label htmlFor="soundcheck_at">Soundcheck At</Label>
            <Input
              id="soundcheck_at"
              name="soundcheck_at"
              type="datetime-local"
              value={formData.soundcheck_at}
              onChange={handleChange}
            />
            {renderError('soundcheck_at')}
          </div>
          <div className="space-y-2">
            <Label htmlFor="door_at">Door At</Label>
            <Input
              id="door_at"
              name="door_at"
              type="datetime-local"
              value={formData.door_at}
              onChange={handleChange}
            />
            {renderError('door_at')}
          </div>
          <div className="space-y-2">
            <Label htmlFor="start_at">Start At</Label>
            <Input
              id="start_at"
              name="start_at"
              type="datetime-local"
              value={formData.start_at}
              onChange={handleChange}
            />
            {renderError('start_at')}
          </div>
          <div className="space-y-2">
            <Label htmlFor="end_at">End At</Label>
            <Input
              id="end_at"
              name="end_at"
              type="datetime-local"
              value={formData.end_at}
              onChange={handleChange}
            />
            {renderError('end_at')}
          </div>
          <div className="space-y-2">
            <Label htmlFor="series_id">Series Id</Label>
            <Input
              id="series_id"
              name="series_id"
              type="number"
              value={formData.series_id}
              onChange={handleChange}
            />
            {renderError('series_id')}
          </div>
          <div className="space-y-2">
            <Label htmlFor="min_age">Minimum Age</Label>
            <Input
              id="min_age"
              name="min_age"
              type="number"
              value={formData.min_age}
              onChange={handleChange}
            />
            {renderError('min_age')}
          </div>
          <div className="space-y-2">
            <Label htmlFor="primary_link">Primary Link</Label>
            <Input
              id="primary_link"
              name="primary_link"
              value={formData.primary_link}
              onChange={handleChange}
            />
            {renderError('primary_link')}
          </div>
          <div className="space-y-2">
            <Label htmlFor="ticket_link">Ticket Link</Label>
            <Input
              id="ticket_link"
              name="ticket_link"
              value={formData.ticket_link}
              onChange={handleChange}
            />
            {renderError('ticket_link')}
          </div>
          <div className="space-y-2">
            <Label htmlFor="cancelled_at">Cancelled At</Label>
            <Input
              id="cancelled_at"
              name="cancelled_at"
              type="datetime-local"
              value={formData.cancelled_at}
              onChange={handleChange}
            />
            {renderError('cancelled_at')}
          </div>
          <div className="space-y-2">
            <Label htmlFor="tag_list">Tag Ids (comma separated)</Label>
            <Input
              id="tag_list"
              name="tag_list"
              value={formData.tag_list}
              onChange={handleChange}
            />
            {renderError('tag_list')}
          </div>
          <div className="space-y-2">
            <Label htmlFor="entity_list">Entity Ids (comma separated)</Label>
            <Input
              id="entity_list"
              name="entity_list"
              value={formData.entity_list}
              onChange={handleChange}
            />
            {renderError('entity_list')}
          </div>
        </div>
        <Button type="submit" className="w-full">Create Event</Button>
      </form>
    </div>
  );
};

export const EventCreateRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/event/create',
  component: EventCreate,
});

