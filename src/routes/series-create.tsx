import React, { useState, useEffect } from 'react';
import { createRoute, useNavigate, Link } from '@tanstack/react-router';
import { rootRoute } from './root';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import SearchableInput from '../components/SearchableInput';
import { api } from '@/lib/api';
import { AxiosError } from 'axios';
import { formatApiError } from '@/lib/utils';
import { useSlug } from '@/hooks/useSlug';
import TagEntityMultiSelect from '@/components/TagEntityMultiSelect';
import { useSearchOptions } from '../hooks/useSearchOptions';
import { CheckCircle, XCircle } from 'lucide-react';
import { seriesCreateSchema } from '@/validation/schemas';
import { useFormValidation } from '@/hooks/useFormValidation';

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
  const { name, slug, setName, setSlug, manuallyOverridden } = useSlug('', '');

  const { data: visibilityOptions } = useSearchOptions('visibilities', '');
  const { data: occurrenceTypeOptions } = useSearchOptions('occurrence-types', '', {}, { sort: 'id', direction: 'asc' });
  const { data: occurrenceWeekOptions } = useSearchOptions('occurrence-weeks', '', {}, { sort: 'id', direction: 'asc' });
  const { data: occurrenceDayOptions } = useSearchOptions('occurrence-days', '', {}, { sort: 'id', direction: 'asc' });
  const { data: tagOptions } = useSearchOptions('tags', tagQuery);
  const { data: entityOptions } = useSearchOptions('entities', entityQuery);
  const { setValues: setFormValuesInternal, handleChange: baseHandleChange, handleBlur, errors, touched, validateForm, getFieldError, errorSummary, generalError, setGeneralError, applyExternalErrors } = useFormValidation({
    initialValues: formData,
    schema: seriesCreateSchema,
    buildValidationValues: (vals) => ({
      name: name,
      slug: slug,
      short: vals.short,
      description: vals.description,
      presale_price: vals.presale_price,
      door_price: vals.door_price,
      start_at: vals.start_at,
      end_at: vals.end_at,
      primary_link: vals.primary_link,
      ticket_link: vals.ticket_link,
    })
  });
  const [nameCheck, setNameCheck] = useState<'idle' | 'unique' | 'duplicate'>('idle');
  const [duplicateSeries, setDuplicateSeries] = useState<{ name: string; slug: string } | null>(null);

  useEffect(() => {
    if (visibilityOptions && visibilityOptions.length > 0) {
      const publicOption = visibilityOptions.find(option => option.name.toLowerCase() === 'public');
      if (publicOption && formData.visibility_id === 1) {
        setFormData(prev => ({ ...prev, visibility_id: publicOption.id }));
      }
    }
  }, [visibilityOptions, formData.visibility_id]);

  useEffect(() => {
    const name = formData.name.trim();
    const slug = formData.slug.trim();
    if (!name || !slug) {
      setNameCheck('idle');
      setDuplicateSeries(null);
      return;
    }
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const params = new URLSearchParams();
        params.append('filters[name]', name);
        params.append('filters[slug]', slug);
        params.append('limit', '1');
        const { data } = await api.get(`/series?${params.toString()}`, {
          signal: controller.signal,
        });
        if (data?.data?.length > 0) {
          const ser = data.data[0];
          setDuplicateSeries({ name: ser.name, slug: ser.slug });
          setNameCheck('duplicate');
        } else {
          setDuplicateSeries(null);
          setNameCheck('unique');
        }
      } catch {
        // ignore errors
      }
    }, 500);
    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [formData.name, formData.slug]);

  type FormState = typeof formData;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const target = e.target as HTMLInputElement | HTMLTextAreaElement;
    const fieldName = target.name;
    const value = (target as HTMLInputElement).type === 'checkbox' ? (target as HTMLInputElement).checked : target.value;
    setFormData(prev => ({ ...prev, [fieldName]: value }));
    baseHandleChange(e);
    if (fieldName === 'name') {
      setName(String(value));
      if (!manuallyOverridden) queueMicrotask(() => setFormData(p => ({ ...p, slug })));
    }
    if (fieldName === 'slug') setSlug(String(value));
  };

  // handleBlur provided by hook

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError('');
    setFormValuesInternal(v => ({ ...v }));
    const ok = validateForm();
    if (!ok) return;
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
      navigate({ to: '/series/$slug', params: { slug: data.slug } });
    } catch (err) {
      if ((err as AxiosError).response?.status === 422) {
        const resp = (err as AxiosError<{ errors: ValidationErrors }>).response;
        if (resp?.data?.errors) {
          applyExternalErrors(resp.data.errors);
          return;
        }
      }
      setGeneralError(formatApiError(err));
    }
  };

  const renderError = (field: string) => {
    if (!touched[field] && !(errors[field] && errors[field].length)) return null;
    const message = getFieldError(field as keyof FormState);
    if (message) return <div className="text-red-500 text-sm">{message}</div>;
    return null;
  };

  return (
    <div className="max-w-2xl md:max-w-4xl lg:max-w-6xl xl:max-w-7xl mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold">Create Series</h1>
      {generalError && <div className="text-red-500">{generalError}</div>}
      {errorSummary && (
        <div className="border border-red-400 bg-red-50 text-red-700 p-3 text-sm" role="alert" aria-live="polite">
          <p className="font-semibold mb-1">There {errorSummary.fieldCount === 1 ? 'is 1 field error' : `are ${errorSummary.fieldCount} field errors`}:</p>
          <ul className="list-disc ml-5 space-y-1">
            {errorSummary.messages.map(m => <li key={m}>{m}</li>)}
          </ul>
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <div className="flex items-center gap-2">
            <Input id="name" name="name" value={name} onChange={handleChange} onBlur={handleBlur} />
            {nameCheck === 'unique' && <CheckCircle className="text-green-500" />}
            {nameCheck === 'duplicate' && <XCircle className="text-red-500" />}
          </div>
          {nameCheck === 'unique' && (
            <p className="text-green-500 text-sm">No other series found with the same name or slug.</p>
          )}
          {nameCheck === 'duplicate' && duplicateSeries && (
            <p className="text-red-500 text-sm">
              Another series found with the same name:{' '}
              <Link to="/series/$slug" params={{ slug: duplicateSeries.slug }} className="underline">
                {duplicateSeries.name}
              </Link>
              . Please verify this is not a duplicate.
            </p>
          )}
          {renderError('name')}
        </div>
        <div className="space-y-2">
          <Label htmlFor="slug">Slug</Label>
          <Input id="slug" name="slug" value={slug} onChange={handleChange} onBlur={handleBlur} />
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
            onBlur={handleBlur}
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
            onBlur={handleBlur}
          />
          {renderError('description')}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label htmlFor="occurrence_type_id">Occurrence Type</Label>
            <Select
              value={formData.occurrence_type_id.toString()}
              onValueChange={(value) => setFormData(prev => ({ ...prev, occurrence_type_id: Number(value) }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select occurrence type" />
              </SelectTrigger>
              <SelectContent>
                {occurrenceTypeOptions?.map((option) => (
                  <SelectItem key={option.id} value={option.id.toString()}>
                    {option.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {renderError('occurrence_type_id')}
          </div>
          <div className="space-y-2">
            <Label htmlFor="occurrence_week_id">Occurrence Week</Label>
            <Select
              value={formData.occurrence_week_id.toString()}
              onValueChange={(value) => setFormData(prev => ({ ...prev, occurrence_week_id: Number(value) }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select occurrence week" />
              </SelectTrigger>
              <SelectContent>
                {occurrenceWeekOptions?.map((option) => (
                  <SelectItem key={option.id} value={option.id.toString()}>
                    {option.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {renderError('occurrence_week_id')}
          </div>
          <div className="space-y-2">
            <Label htmlFor="occurrence_day_id">Occurrence Day</Label>
            <Select
              value={formData.occurrence_day_id.toString()}
              onValueChange={(value) => setFormData(prev => ({ ...prev, occurrence_day_id: Number(value) }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select occurrence day" />
              </SelectTrigger>
              <SelectContent>
                {occurrenceDayOptions?.map((option) => (
                  <SelectItem key={option.id} value={option.id.toString()}>
                    {option.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {renderError('occurrence_day_id')}
          </div>
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
              onBlur={handleBlur}
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
              onBlur={handleBlur}
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
              onBlur={handleBlur}
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
              onBlur={handleBlur}
            />
            {renderError('end_at')}
          </div>
          <div className="space-y-2"> </div>
          <div className="space-y-2"> </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="primary_link">Primary Link</Label>
            <Input
              id="primary_link"
              name="primary_link"
              value={formData.primary_link}
              onChange={handleChange}
              onBlur={handleBlur}
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
              onBlur={handleBlur}
            />
            {renderError('ticket_link')}
          </div>
          <TagEntityMultiSelect
            label="Tags"
            datalistId="tag-options"
            query={tagQuery}
            setQuery={setTagQuery}
            options={tagOptions}
            valueIds={formData.tag_list}
            setValueIds={(ids) => setFormData(p => ({ ...p, tag_list: typeof ids === 'function' ? ids(p.tag_list) : ids }))}
            selected={selectedTags}
            setSelected={setSelectedTags}
            placeholder="Type to add tag..."
            ariaLabelRemove="Remove tag"
          />
          <TagEntityMultiSelect
            label="Entities"
            datalistId="entity-options"
            query={entityQuery}
            setQuery={setEntityQuery}
            options={entityOptions}
            valueIds={formData.entity_list}
            setValueIds={(ids) => setFormData(p => ({ ...p, entity_list: typeof ids === 'function' ? ids(p.entity_list) : ids }))}
            selected={selectedEntities}
            setSelected={setSelectedEntities}
            placeholder="Type to add entity..."
            ariaLabelRemove="Remove entity"
          />
        </div>
        <Button type="submit" className="w-full">Create Series</Button>
      </form >
    </div >
  );
};

export const SeriesCreateRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/series/create',
  component: SeriesCreate,
});

