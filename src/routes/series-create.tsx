import React, { useState, useEffect } from 'react';
import { createRoute, useNavigate } from '@tanstack/react-router';
import { rootRoute } from './root';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import SearchableInput from '../components/SearchableInput';
import { api } from '@/lib/api';
import { AxiosError } from 'axios';
import { formatApiError, toKebabCase } from '@/lib/utils';
import { useSearchOptions } from '../hooks/useSearchOptions';

interface ValidationErrors {
  [key: string]: string[];
}

const SeriesCreate: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    short: '',
    visibility_id: 1,
    description: '',
    event_type_id: '' as number | '',
    promoter_id: '' as number | '',
    venue_id: '' as number | '',
    is_benefit: false,
    presale_price: '',
    door_price: '',
    start_at: '',
    end_at: '',
    min_age: '',
    primary_link: '',
    ticket_link: '',
    tag_list: [] as number[],
    entity_list: [] as number[],
    occurrence_type_id: '' as number | '',
    occurrence_week_id: '' as number | '',
    occurrence_day_id: '' as number | '',
  });
  const [tagQuery, setTagQuery] = useState('');
  const [entityQuery, setEntityQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<{ id: number; name: string }[]>([]);
  const [selectedEntities, setSelectedEntities] = useState<{ id: number; name: string }[]>([]);

  const { data: visibilityOptions } = useSearchOptions('visibilities', '');
  const { data: occurrenceTypeOptions } = useSearchOptions('occurrence-types', '');
  const { data: occurrenceWeekOptions } = useSearchOptions('occurrence-weeks', '');
  const { data: occurrenceDayOptions } = useSearchOptions('occurrence-days', '');
  const { data: tagOptions } = useSearchOptions('tags', tagQuery);
  const { data: entityOptions } = useSearchOptions('entities', entityQuery);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [generalError, setGeneralError] = useState('');

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
      const updated = { ...prev, [name]: isCheckbox ? checked : value } as typeof formData;
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
        event_type_id: formData.event_type_id ? Number(formData.event_type_id) : undefined,
        promoter_id: formData.promoter_id ? Number(formData.promoter_id) : undefined,
        venue_id: formData.venue_id ? Number(formData.venue_id) : undefined,
        occurrence_type_id: formData.occurrence_type_id ? Number(formData.occurrence_type_id) : undefined,
        occurrence_week_id: formData.occurrence_week_id ? Number(formData.occurrence_week_id) : undefined,
        occurrence_day_id: formData.occurrence_day_id ? Number(formData.occurrence_day_id) : undefined,
        min_age: formData.min_age ? Number(formData.min_age) : undefined,
        tag_list: formData.tag_list,
        entity_list: formData.entity_list,
      };
      const { data } = await api.post('/series', payload);
      navigate({ to: `/series/${data.slug}` });
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
    <div className="max-w-2xl md:max-w-4xl lg:max-w-6xl xl:max-w-7xl mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold">Create Series</h1>
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
            rows={6}
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
            <SearchableInput
              id="event_type_id"
              endpoint="event-types"
              value={formData.event_type_id}
              onValueChange={(val) => setFormData((p) => ({ ...p, event_type_id: val }))}
              placeholder="Type to search event types..."
            />
            {renderError('event_type_id')}
          </div>
          <div className="space-y-2">
            <Label htmlFor="promoter_id">Promoter</Label>
            <SearchableInput
              id="promoter_id"
              endpoint="entities"
              extraParams={{ 'filters[role]': 'Promoter' }}
              value={formData.promoter_id}
              onValueChange={(val) => setFormData((p) => ({ ...p, promoter_id: val }))}
              placeholder="Type to search promoters..."
            />
            {renderError('promoter_id')}
          </div>
          <div className="space-y-2">
            <Label htmlFor="venue_id">Venue</Label>
            <SearchableInput
              id="venue_id"
              endpoint="entities"
              extraParams={{ 'filters[role]': 'Venue' }}
              value={formData.venue_id}
              onValueChange={(val) => setFormData((p) => ({ ...p, venue_id: val }))}
              placeholder="Type to search venues..."
            />
            {renderError('venue_id')}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
          <div className="space-y-2"> </div>
          <div className="space-y-2"> </div>
          <div className="space-y-2">
            <Label htmlFor="occurrence_type_id">Occurrence Type</Label>
            <SearchableInput
              id="occurrence_type_id"
              endpoint="occurrence-types"
              value={formData.occurrence_type_id}
              onValueChange={(val) => setFormData((p) => ({ ...p, occurrence_type_id: val }))}
              placeholder="Type to search occurrence types..."
            />
            {renderError('occurrence_type_id')}

          </div>
          <div className="space-y-2">
            <Label htmlFor="occurrence_type_id">Occurrence Week</Label>
            <SearchableInput
              id="occurrence_week_id"
              endpoint="occurrence-weeks"
              value={formData.occurrence_week_id}
              onValueChange={(val) => setFormData((p) => ({ ...p, occurrence_week_id: val }))}
              placeholder="Type to search occurrence weeks..."
            />
            {renderError('occurrence_week_id')}
          </div>
          <div className="space-y-2">
            <Label htmlFor="occurrence_day_id">Occurrence Day</Label>
            <SearchableInput
              id="occurrence_day_id"
              endpoint="occurrence-days"
              value={formData.occurrence_day_id}
              onValueChange={(val) => setFormData((p) => ({ ...p, occurrence_day_id: val }))}
              placeholder="Type to search occurrence days..."
            />
            {renderError('occurrence_day_id')}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        <Button type="submit" className="w-full">Create Series</Button>
      </form>
    </div>
  );
};

export const SeriesCreateRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/series/create',
  component: SeriesCreate,
});

