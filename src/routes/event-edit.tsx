import React, { useState, useEffect } from 'react';
import { createRoute, useNavigate } from '@tanstack/react-router';
import { rootRoute } from './root';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { api } from '@/lib/api';
import { AxiosError } from 'axios';
import { formatApiError, utcToLocalDatetimeInput } from '@/lib/utils';
import { useSearchOptions } from '../hooks/useSearchOptions';
import { Event } from '../types/api';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSlug } from '@/hooks/useSlug';
import { eventEditSchema } from '@/validation/schemas';
import ValidationSummary from '@/components/ValidationSummary';
import { useFormValidation } from '@/hooks/useFormValidation';
import AjaxMultiSelect from '@/components/AjaxMultiSelect';
import AjaxSelect from '@/components/AjaxSelect';
import { SITE_NAME, DEFAULT_IMAGE } from './../lib/seo';

interface ValidationErrors {
    [key: string]: string[];
}

const EventEdit: React.FC<{ eventSlug: string }> = ({ eventSlug }) => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { data: event } = useQuery<Event>({
        queryKey: ['event', eventSlug],
        queryFn: async () => {
            const { data } = await api.get<Event>(`/events/${eventSlug}`);
            return data;
        },
    });

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

    // useSlug manages name<->slug auto sync until the user edits slug manually.
    // We will call initialize once the event data loads so that existing values
    // are seeded WITHOUT marking the slug as manually overridden (allowing
    // subsequent name edits to keep syncing until the user edits slug directly).
    const { name, slug, setName, setSlug, manuallyOverridden, initialize } = useSlug('', '');

    const { data: visibilityOptions } = useSearchOptions('visibilities', '');
    const { data: eventStatusOptions } = useSearchOptions('event-statuses', '');
    const { setValues: setFormValuesInternal, handleChange: baseHandleChange, handleBlur, errors, touched, validateForm, getFieldError, errorSummary, generalError, setGeneralError, applyExternalErrors } = useFormValidation({
        initialValues: formData,
        schema: eventEditSchema,
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
            event_type_id: vals.event_type_id ? Number(vals.event_type_id) : undefined,
        })
    });

    // Shared form field classes (light + dark) for consistent contrast
    const fieldClasses = "bg-white border-slate-300 text-slate-900 placeholder-slate-500 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100 dark:placeholder-slate-400 focus-visible:ring-0 focus:border-slate-500 focus:dark:border-slate-400";

    useEffect(() => {
        if (event) {
            const populated: typeof formData = {
                name: event.name || '',
                slug: event.slug || '',
                short: event.short || '',
                visibility_id: (event as { visibility_id?: number }).visibility_id || 1,
                description: event.description || '',
                event_status_id: 1,
                event_type_id: (event.event_type?.id ?? '') as number | '',
                promoter_id: (event.promoter?.id ?? '') as number | '',
                venue_id: (event.venue?.id ?? '') as number | '',
                is_benefit: event.is_benefit || false,
                presale_price: event.presale_price ? String(event.presale_price) : '',
                door_price: event.door_price ? String(event.door_price) : '',
                soundcheck_at: '',
                door_at: '',
                start_at: utcToLocalDatetimeInput(event.start_at, { fixESTUtcBug: true }),
                end_at: utcToLocalDatetimeInput(event.end_at, { fixESTUtcBug: true }),
                series_id: (event.series?.id ?? '') as number | '',
                min_age: event.min_age ? String(event.min_age) : '',
                primary_link: event.primary_link || '',
                ticket_link: event.ticket_link || '',
                cancelled_at: '',
                tag_list: event.tags?.map(t => t.id) || [],
                entity_list: event.entities?.map(e => e.id) || [],
            };
            setFormData(populated);
            setFormValuesInternal(populated);
            initialize(event.name || '', event.slug || '');
        }
    }, [event, initialize, setFormValuesInternal]);

    useEffect(() => {
        if (visibilityOptions && visibilityOptions.length > 0 && formData.visibility_id === 1) {
            const publicOption = visibilityOptions.find(option => option.name.toLowerCase() === 'public');
            if (publicOption) {
                setFormData(prev => ({ ...prev, visibility_id: publicOption.id }));
            }
        }
    }, [visibilityOptions, formData.visibility_id]);

    useEffect(() => {
        if (eventStatusOptions && eventStatusOptions.length > 0 && formData.event_status_id === 1) {
            const activeOption = eventStatusOptions.find(option => option.name.toLowerCase() === 'active');
            if (activeOption) {
                setFormData(prev => ({ ...prev, event_status_id: activeOption.id }));
            }
        }
    }, [eventStatusOptions, formData.event_status_id]);

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
                series_id: formData.series_id ? Number(formData.series_id) : null,
                event_type_id: formData.event_type_id ? Number(formData.event_type_id) : undefined,
                promoter_id: formData.promoter_id ? Number(formData.promoter_id) : undefined,
                venue_id: formData.venue_id ? Number(formData.venue_id) : undefined,
                min_age: formData.min_age ? Number(formData.min_age) : undefined,
                tag_list: formData.tag_list,
                entity_list: formData.entity_list,
                start_at: formData.start_at ? `${formData.start_at}:00` : undefined,
                end_at: formData.end_at ? `${formData.end_at}:00` : undefined,
            };
            const { data } = await api.put(`/events/${eventSlug}`, payload);
            // Invalidate the event query cache to ensure fresh data is loaded on the detail page
            await queryClient.invalidateQueries({ queryKey: ['event', data.slug] });
            navigate({ to: `/events/${data.slug}` });
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
            <h1 className="text-3xl font-bold">Edit Event</h1>
            {generalError && <div className="text-red-500">{generalError}</div>}
            <ValidationSummary errorSummary={errorSummary} />
            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" name="name" value={name} onChange={handleChange} onBlur={handleBlur} className={fieldClasses} />
                        {renderError('name')}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="slug">Slug</Label>
                        <Input id="slug" name="slug" value={slug} onChange={handleChange} onBlur={handleBlur} className={fieldClasses} />
                        {renderError('slug')}
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="short">Short Description</Label>
                    <textarea
                        id="short"
                        name="short"
                        className="w-full border rounded p-2 bg-white border-slate-300 text-slate-900 placeholder-slate-500 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100 dark:placeholder-slate-400 focus-visible:ring-0 focus:border-slate-500 focus:dark:border-slate-400"
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
                        className="w-full border rounded p-2 bg-white border-slate-300 text-slate-900 placeholder-slate-500 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100 dark:placeholder-slate-400 focus-visible:ring-0 focus:border-slate-500 focus:dark:border-slate-400"
                        value={formData.description}
                        onChange={handleChange}
                        onBlur={handleBlur}
                    />
                    {renderError('description')}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="visibility_id">Visibility</Label>
                        <Select value={String(formData.visibility_id)} onValueChange={(val) => setFormData((p) => ({ ...p, visibility_id: Number(val) }))}>
                            <SelectTrigger id="visibility_id" className="bg-white border-slate-300 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100 focus-visible:ring-0 focus:border-slate-500 focus:dark:border-slate-400">
                                <SelectValue>{visibilityOptions?.find(o => o.id === Number(formData.visibility_id))?.name}</SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                {visibilityOptions?.map((option) => (
                                    <SelectItem key={option.id} value={String(option.id)}>
                                        {option.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {renderError('visibility_id')}
                    </div>
                    <AjaxSelect
                        label="Event Type"
                        endpoint="event-types"
                        value={formData.event_type_id}
                        onChange={(val) => setFormData((p) => ({ ...p, event_type_id: val }))}
                        placeholder="Type to search event types..."
                    />
                    {renderError('event_type_id')}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <AjaxSelect
                        label="Promoter"
                        endpoint="entities"
                        extraParams={{ 'filters[role]': 'Promoter' }}
                        value={formData.promoter_id}
                        onChange={(val) => setFormData((p) => ({ ...p, promoter_id: val }))}
                        placeholder="Type to search promoters..."
                    />
                    {renderError('promoter_id')}
                    <AjaxSelect
                        label="Venue"
                        endpoint="entities"
                        extraParams={{ 'filters[role]': 'Venue' }}
                        value={formData.venue_id}
                        onChange={(val) => setFormData((p) => ({ ...p, venue_id: val }))}
                        placeholder="Type to search venues..."
                    />
                    {renderError('venue_id')}
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
                            className={fieldClasses}
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
                            className={fieldClasses}
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
                            <SelectTrigger className="bg-white border-slate-300 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100 focus-visible:ring-0 focus:border-slate-500 focus:dark:border-slate-400">
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
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="start_at">Start At</Label>
                        <Input
                            id="start_at"
                            name="start_at"
                            type="datetime-local"
                            value={formData.start_at}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={fieldClasses}
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
                            className={fieldClasses}
                        />
                        {renderError('end_at')}
                    </div>
                    <div>
                        <AjaxSelect
                            label="Series"
                            endpoint="series"
                            value={formData.series_id}
                            onChange={(val) => setFormData((p) => ({ ...p, series_id: val }))}
                            placeholder="Type to search series..."
                        />
                        {renderError('series_id')}
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
                            onBlur={handleBlur}
                            className={fieldClasses}
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
                            className={fieldClasses}
                        />
                        {renderError('ticket_link')}
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <AjaxMultiSelect
                        label="Tags"
                        endpoint="tags"
                        value={formData.tag_list}
                        onChange={(ids) => setFormData(p => ({ ...p, tag_list: ids }))}
                        placeholder="Type to search and add tags..."
                    />
                    <AjaxMultiSelect
                        label="Related Entities"
                        endpoint="entities"
                        value={formData.entity_list}
                        onChange={(ids) => setFormData(p => ({ ...p, entity_list: ids }))}
                        placeholder="Type to search and add entities..."
                    />
                </div>
                <Button type="submit" className="w-full">Save Event</Button>
            </form>
        </div>
    );
};

export const EventEditRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/event/$eventSlug/edit',
    component: function EventEditWrapper() {
        const params = EventEditRoute.useParams();
        return <EventEdit eventSlug={params.eventSlug} />;
    },
    head: () => {
        // Build current absolute URL in the client; SSR fallback to site root
        const url = typeof window !== 'undefined' ? window.location.href : 'https://arcane.city/event/$eventSlug/edit';

        return {
            meta: [
                { title: `Event Edit • ${SITE_NAME}` },
                { property: 'og:url', content: `${url}` },
                { property: 'og:type', content: 'website' },
                { property: 'og:title', content: `Event Edit • ${SITE_NAME}` },
                { property: 'og:image', content: DEFAULT_IMAGE },
                { property: 'og:description', content: `Edit an event in the Pittsburgh Events Guide.` },
                { name: 'description', content: `Edit an event in the Pittsburgh Events Guide.` },
            ],
        };
    },
});
