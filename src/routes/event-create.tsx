import React, { useState, useEffect } from 'react';
import { createRoute, useNavigate } from '@tanstack/react-router';
import { rootRoute } from './root';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { api } from '@/lib/api';
import { AxiosError } from 'axios';
import { formatApiError, toKebabCase } from '@/lib/utils';
import { useSearchOptions } from '../hooks/useSearchOptions';

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
    event_type_id: '' as number | '',
    promoter_id: '' as number | '',
    venue_id: '' as number | '',
    is_benefit: false,
    presale_price: '',
    door_price: '',
    soundcheck_at: '',
    door_at: '',
    start_at: '',
    end_at: '',
    series_id: '' as number | '',
    min_age: '',
    primary_link: '',
    ticket_link: '',
    cancelled_at: '',
    tag_list: [] as number[],
    entity_list: [] as number[],
  });
  const [promoterQuery, setPromoterQuery] = useState('');
  const [selectedPromoterName, setSelectedPromoterName] = useState('');
  const [typeQuery, setTypeQuery] = useState('');
  const [selectedTypeName, setSelectedTypeName] = useState('');
  const [venueQuery, setVenueQuery] = useState('');
  const [selectedVenueName, setSelectedVenueName] = useState('');
  const [seriesQuery, setSeriesQuery] = useState('');
  const [selectedSeriesName, setSelectedSeriesName] = useState('');
  const [tagQuery, setTagQuery] = useState('');
  const [entityQuery, setEntityQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<{ id: number; name: string }[]>([]);
  const [selectedEntities, setSelectedEntities] = useState<{ id: number; name: string }[]>([]);

  const { data: visibilityOptions } = useSearchOptions('visibilities', '');
  const { data: typeOptions } = useSearchOptions('event-types', typeQuery);
  const { data: promoterOptions } = useSearchOptions('entities', promoterQuery, { 'filters[role]': 'Promoter' });
  const { data: venueOptions } = useSearchOptions('entities', venueQuery, { 'filters[role]': 'Venue' });
  const { data: seriesOptions } = useSearchOptions('series', seriesQuery);
  const { data: tagOptions } = useSearchOptions('tags', tagQuery);
  const { data: entityOptions } = useSearchOptions('entities', entityQuery);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [generalError, setGeneralError] = useState('');

  // Set default visibility to "Public" when options are loaded
  useEffect(() => {
    if (visibilityOptions && visibilityOptions.length > 0) {
      const publicOption = visibilityOptions.find(option => option.name.toLowerCase() === 'public');
      if (publicOption && formData.visibility_id === 1) {
        setFormData(prev => ({ ...prev, visibility_id: publicOption.id }));
      }
    }
  }, [visibilityOptions, formData.visibility_id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const target = e.target as HTMLInputElement | HTMLTextAreaElement;
    const { name, value } = target;
    const isCheckbox = (target as HTMLInputElement).type === 'checkbox';
    const checked = (target as HTMLInputElement).checked;
    setFormData((prev) => {
      const updated = { ...prev, [name]: isCheckbox ? checked : value };
      if (name === 'name') {
        updated.slug = toKebabCase(value);
      }
      return updated;
    });
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
        event_type_id: formData.event_type_id ? Number(formData.event_type_id) : undefined,
        promoter_id: formData.promoter_id ? Number(formData.promoter_id) : undefined,
        venue_id: formData.venue_id ? Number(formData.venue_id) : undefined,
        min_age: formData.min_age ? Number(formData.min_age) : undefined,
        tag_list: formData.tag_list,
        entity_list: formData.entity_list,
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
            <Label htmlFor="visibility_id">Visibility</Label>
            <Select
              value={formData.visibility_id.toString()}
              onValueChange={(value) => setFormData(prev => ({ ...prev, visibility_id: Number(value) }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select visibility" />
              </SelectTrigger>
              <SelectContent>
                {visibilityOptions?.map((option) => (
                  <SelectItem key={option.id} value={option.id.toString()}>
                    {option.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {renderError('visibility_id')}
          </div>
          <div className="space-y-2">
            <Label htmlFor="event_type_id">Event Type</Label>
            <Input
              id="event_type_id"
              list="type-options"
              value={selectedTypeName}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedTypeName(val);
                setTypeQuery(val);
                const opt = typeOptions?.find((o) => o.name === val);
                if (opt) {
                  setFormData((p) => ({ ...p, event_type_id: opt.id }));
                } else {
                  setFormData((p) => ({ ...p, event_type_id: '' }));
                }
              }}
              onBlur={(e) => {
                const opt = typeOptions?.find((o) => o.name === e.target.value);
                if (opt) {
                  setFormData((p) => ({ ...p, event_type_id: opt.id }));
                  setSelectedTypeName(opt.name);
                } else {
                  setFormData((p) => ({ ...p, event_type_id: '' }));
                  setSelectedTypeName('');
                }
              }}
              placeholder="Type to search event types..."
            />
            <datalist id="type-options">
              {typeOptions?.map((o) => (
                <option key={o.id} value={o.name} />
              ))}
            </datalist>
            {renderError('event_type_id')}
          </div>
          <div className="space-y-2">
            <Label htmlFor="promoter_id">Promoter</Label>
            <Input
              id="promoter_id"
              list="promoter-options"
              value={selectedPromoterName}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedPromoterName(val);
                setPromoterQuery(val);
                const opt = promoterOptions?.find((o) => o.name === val);
                if (opt) {
                  setFormData((p) => ({ ...p, promoter_id: opt.id }));
                } else {
                  setFormData((p) => ({ ...p, promoter_id: '' }));
                }
              }}
              onBlur={(e) => {
                const opt = promoterOptions?.find((o) => o.name === e.target.value);
                if (opt) {
                  setFormData((p) => ({ ...p, promoter_id: opt.id }));
                  setSelectedPromoterName(opt.name);
                } else {
                  setFormData((p) => ({ ...p, promoter_id: '' }));
                  setSelectedPromoterName('');
                }
              }}
              placeholder="Type to search promoters..."
            />
            <datalist id="promoter-options">
              {promoterOptions?.map((o) => (
                <option key={o.id} value={o.name} />
              ))}
            </datalist>
            {renderError('promoter_id')}
          </div>
          <div className="space-y-2">
            <Label htmlFor="venue_id">Venue</Label>
            <Input
              id="venue_id"
              list="venue-options"
              value={selectedVenueName}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedVenueName(val);
                setVenueQuery(val);
                const opt = venueOptions?.find((o) => o.name === val);
                if (opt) {
                  setFormData((p) => ({ ...p, venue_id: opt.id }));
                } else {
                  setFormData((p) => ({ ...p, venue_id: '' }));
                }
              }}
              onBlur={(e) => {
                const opt = venueOptions?.find((o) => o.name === e.target.value);
                if (opt) {
                  setFormData((p) => ({ ...p, venue_id: opt.id }));
                  setSelectedVenueName(opt.name);
                } else {
                  setFormData((p) => ({ ...p, venue_id: '' }));
                  setSelectedVenueName('');
                }
              }}
              placeholder="Type to search venues..."
            />
            <datalist id="venue-options">
              {venueOptions?.map((o) => (
                <option key={o.id} value={o.name} />
              ))}
            </datalist>
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
            <Label htmlFor="series_id">Series</Label>
            <Input
              id="series_id"
              list="series-options"
              value={selectedSeriesName}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedSeriesName(val);
                setSeriesQuery(val);
                const opt = seriesOptions?.find((o) => o.name === val);
                if (opt) {
                  setFormData((p) => ({ ...p, series_id: opt.id }));
                } else {
                  setFormData((p) => ({ ...p, series_id: '' }));
                }
              }}
              onBlur={(e) => {
                const opt = seriesOptions?.find((o) => o.name === e.target.value);
                if (opt) {
                  setFormData((p) => ({ ...p, series_id: opt.id }));
                  setSelectedSeriesName(opt.name);
                } else {
                  setFormData((p) => ({ ...p, series_id: '' }));
                  setSelectedSeriesName('');
                }
              }}
              placeholder="Type to search series..."
            />
            <datalist id="series-options">
              {seriesOptions?.map((o) => (
                <option key={o.id} value={o.name} />
              ))}
            </datalist>
            {renderError('series_id')}
          </div>
          <div className="space-y-2">
            <Label htmlFor="min_age">Minimum Age</Label>
            <Select
              value={formData.min_age.toString()}
              onValueChange={(value) => setFormData(prev => ({ ...prev, min_age: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select minimum age" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">All Ages</SelectItem>
                <SelectItem value="18">18+</SelectItem>
                <SelectItem value="21">21+</SelectItem>
              </SelectContent>
            </Select>
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
            <Label htmlFor="tag_input">Tags</Label>
            <Input
              id="tag_input"
              list="tag-options"
              value={tagQuery}
              onChange={(e) => setTagQuery(e.target.value)}
              onBlur={(e) => {
                const opt = tagOptions?.find((o) => o.name === e.target.value);
                if (opt && !formData.tag_list.includes(opt.id)) {
                  setFormData((p) => ({ ...p, tag_list: [...p.tag_list, opt.id] }));
                  setSelectedTags((p) => [...p, opt]);
                }
                setTagQuery('');
              }}
            />
            <datalist id="tag-options">
              {tagOptions?.map((o) => (
                <option key={o.id} value={o.name} />
              ))}
            </datalist>
            <div className="flex flex-wrap gap-2">
              {selectedTags.map((tag) => (
                <span key={tag.id} className="px-2 py-1 bg-gray-200 rounded text-sm">
                  {tag.name}
                  <button
                    type="button"
                    className="ml-1 text-red-500"
                    onClick={() => {
                      setSelectedTags((p) => p.filter((t) => t.id !== tag.id));
                      setFormData((p) => ({
                        ...p,
                        tag_list: p.tag_list.filter((t) => t !== tag.id),
                      }));
                    }}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            {renderError('tag_list')}
          </div>
          <div className="space-y-2">
            <Label htmlFor="entity_input">Entities</Label>
            <Input
              id="entity_input"
              list="entity-options"
              value={entityQuery}
              onChange={(e) => setEntityQuery(e.target.value)}
              onBlur={(e) => {
                const opt = entityOptions?.find((o) => o.name === e.target.value);
                if (opt && !formData.entity_list.includes(opt.id)) {
                  setFormData((p) => ({ ...p, entity_list: [...p.entity_list, opt.id] }));
                  setSelectedEntities((p) => [...p, opt]);
                }
                setEntityQuery('');
              }}
            />
            <datalist id="entity-options">
              {entityOptions?.map((o) => (
                <option key={o.id} value={o.name} />
              ))}
            </datalist>
            <div className="flex flex-wrap gap-2">
              {selectedEntities.map((ent) => (
                <span key={ent.id} className="px-2 py-1 bg-gray-200 rounded text-sm">
                  {ent.name}
                  <button
                    type="button"
                    className="ml-1 text-red-500"
                    onClick={() => {
                      setSelectedEntities((p) => p.filter((t) => t.id !== ent.id));
                      setFormData((p) => ({
                        ...p,
                        entity_list: p.entity_list.filter((t) => t !== ent.id),
                      }));
                    }}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
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

