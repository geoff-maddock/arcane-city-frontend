import React, { useState, useEffect } from 'react';
import { createRoute, useNavigate } from '@tanstack/react-router';
import { rootRoute } from './root';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
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
    series_id: '' as number | '',
    min_age: '0',
    primary_link: '',
    ticket_link: '',
    cancelled_at: '',
    tag_list: [] as number[],
    entity_list: [] as number[],
  });
  const [visibilityQuery, setVisibilityQuery] = useState('Public');
  const [typeQuery, setTypeQuery] = useState('');
  const [promoterQuery, setPromoterQuery] = useState('');
  const [venueQuery, setVenueQuery] = useState('');
  const [seriesQuery, setSeriesQuery] = useState('');
  const [tagQuery, setTagQuery] = useState('');
  const [entityQuery, setEntityQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<{ id: number; name: string }[]>([]);
  const [selectedEntities, setSelectedEntities] = useState<{ id: number; name: string }[]>([]);

  const { data: visibilityOptions } = useSearchOptions('visibilities', visibilityQuery);
  const { data: typeOptions } = useSearchOptions('event-types', typeQuery);
  const { data: promoterOptions } = useSearchOptions('entities', promoterQuery, { 'filters[role]': 'Promoter' });
  const { data: venueOptions } = useSearchOptions('entities', venueQuery, { 'filters[role]': 'Venue' });
  const { data: seriesOptions } = useSearchOptions('series', seriesQuery);
  const { data: tagOptions } = useSearchOptions('tags', tagQuery);
  const { data: entityOptions } = useSearchOptions('entities', entityQuery);
  useEffect(() => {
    if (visibilityOptions) {
      const opt = visibilityOptions.find((o) => o.id === formData.visibility_id);
      if (opt && visibilityQuery !== opt.name) {
        setVisibilityQuery(opt.name);
      }
    }
  }, [visibilityOptions, formData.visibility_id]);

  useEffect(() => {
    if (typeOptions) {
      const opt = typeOptions.find((o) => o.id === formData.event_type_id);
      if (opt && typeQuery !== opt.name) {
        setTypeQuery(opt.name);
      }
    }
  }, [typeOptions, formData.event_type_id]);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [generalError, setGeneralError] = useState('');

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
            <Input
              id="visibility_id"
              list="visibility-options"
              required
              value={visibilityQuery}
              onChange={(e) => {
                const val = e.target.value;
                setVisibilityQuery(val);
                const opt = visibilityOptions?.find((o) => o.name === val);
                if (opt) setFormData((p) => ({ ...p, visibility_id: opt.id }));
              }}
              onBlur={(e) => {
                const opt = visibilityOptions?.find((o) => o.name === e.target.value);
                if (opt) {
                  setFormData((p) => ({ ...p, visibility_id: opt.id }));
                  setVisibilityQuery(opt.name);
                }
              }}
            />
            <datalist id="visibility-options">
              {visibilityOptions?.map((v) => (
                <option key={v.id} value={v.name} />
              ))}
            </datalist>
            {renderError('visibility_id')}
          </div>
          <div className="space-y-2">
            <Label htmlFor="event_type_id">Event Type</Label>
            <Input
              id="event_type_id"
              list="type-options"
              required
              value={typeQuery}
              onChange={(e) => {
                const val = e.target.value;
                setTypeQuery(val);
                const opt = typeOptions?.find((o) => o.name === val);
                if (opt) setFormData((p) => ({ ...p, event_type_id: opt.id }));
              }}
              onBlur={(e) => {
                const opt = typeOptions?.find((o) => o.name === e.target.value);
                if (opt) {
                  setFormData((p) => ({ ...p, event_type_id: opt.id }));
                  setTypeQuery(opt.name);
                }
              }}
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
              value={promoterQuery}
              onChange={(e) => {
                const val = e.target.value;
                setPromoterQuery(val);
                const opt = promoterOptions?.find((o) => o.name === val);
                if (opt) setFormData((p) => ({ ...p, promoter_id: opt.id }));
              }}
              onBlur={(e) => {
                const opt = promoterOptions?.find((o) => o.name === e.target.value);
                if (opt) {
                  setFormData((p) => ({ ...p, promoter_id: opt.id }));
                  setPromoterQuery(opt.name);
                }
              }}
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
              value={venueQuery}
              onChange={(e) => {
                const val = e.target.value;
                setVenueQuery(val);
                const opt = venueOptions?.find((o) => o.name === val);
                if (opt) setFormData((p) => ({ ...p, venue_id: opt.id }));
              }}
              onBlur={(e) => {
                const opt = venueOptions?.find((o) => o.name === e.target.value);
                if (opt) {
                  setFormData((p) => ({ ...p, venue_id: opt.id }));
                  setVenueQuery(opt.name);
                }
              }}
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
              value={seriesQuery}
              onChange={(e) => {
                const val = e.target.value;
                setSeriesQuery(val);
                const opt = seriesOptions?.find((o) => o.name === val);
                if (opt) setFormData((p) => ({ ...p, series_id: opt.id }));
              }}
              onBlur={(e) => {
                const opt = seriesOptions?.find((o) => o.name === e.target.value);
                if (opt) {
                  setFormData((p) => ({ ...p, series_id: opt.id }));
                  setSeriesQuery(opt.name);
                }
              }}
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
            <Input
              id="min_age"
              name="min_age"
              type="number"
              required
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

