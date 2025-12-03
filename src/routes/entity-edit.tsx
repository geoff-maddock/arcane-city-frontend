import React, { useState, useEffect } from 'react';
import { createRoute, useNavigate } from '@tanstack/react-router';
import { rootRoute } from './root';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AjaxSelect from '../components/AjaxSelect';
import AjaxMultiSelect from '../components/AjaxMultiSelect';
import StringMultiInput from '../components/StringMultiInput';
import { api } from '@/lib/api';
import { handleFormError } from '@/lib/errorHandler';
import { utcToLocalDatetimeInput } from '@/lib/utils';
import { useSearchOptions } from '../hooks/useSearchOptions';
import { Entity } from '../types/api';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSlug } from '@/hooks/useSlug';
import { SITE_NAME, DEFAULT_IMAGE } from './../lib/seo';

const EntityEdit: React.FC<{ entitySlug: string }> = ({ entitySlug }) => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { data: entity } = useQuery<Entity>({
        queryKey: ['entity', entitySlug],
        queryFn: async () => {
            const { data } = await api.get<Entity>(`/entities/${entitySlug}`);
            return data;
        },
    });

    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        short: '',
        visibility_id: 1,
        description: '',
        entity_type_id: '' as number | '',
        entity_status_id: 1 as number | '',
        started_at: '',
        facebook_username: '',
        instagram_username: '',
        primary_location_id: '' as number | '',
        tag_list: [] as number[],
        role_list: [] as number[],
        aliases: [] as string[],
    });

    const { name, slug, setName, setSlug, initialize, manuallyOverridden } = useSlug('', '');

    const { data: visibilityOptions } = useSearchOptions('visibilities', '');
    const { data: entityStatusOptions } = useSearchOptions('entity-statuses', '');
    const [errors, setErrors] = useState<Record<string, string[]>>({});
    const [generalError, setGeneralError] = useState('');

    // Shared form field classes (light + dark) for consistent contrast
    const fieldClasses = "bg-white border-slate-300 text-slate-900 placeholder-slate-500 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100 dark:placeholder-slate-400 focus-visible:ring-0 focus:border-slate-500 focus:dark:border-slate-400";

    useEffect(() => {
        if (entity) {
            setFormData({
                name: entity.name || '',
                slug: entity.slug || '',
                short: entity.short || '',
                visibility_id: (entity as { visibility_id?: number }).visibility_id || 1,
                description: entity.description || '',
                entity_type_id: entity.entity_type?.id || '',
                entity_status_id: entity.entity_status?.id || 1,
                started_at: utcToLocalDatetimeInput(entity.started_at, { fixESTUtcBug: true }),
                facebook_username: entity.facebook_username || '',
                instagram_username: entity.instagram_username || '',
                primary_location_id: entity.primary_location?.id || '',
                tag_list: entity.tags?.map(t => t.id) || [],
                role_list: entity.roles?.map(r => r.id) || [],
                aliases: entity.aliases || [],
            });
            initialize(entity.name || '', entity.slug || '');
        }
    }, [entity, initialize]);

    useEffect(() => {
        if (visibilityOptions && visibilityOptions.length > 0 && formData.visibility_id === 1) {
            const publicOption = visibilityOptions.find(option => option.name.toLowerCase() === 'public');
            if (publicOption) {
                setFormData(prev => ({ ...prev, visibility_id: publicOption.id }));
            }
        }
    }, [visibilityOptions, formData.visibility_id]);

    useEffect(() => {
        if (entityStatusOptions && entityStatusOptions.length > 0 && formData.entity_status_id === 1) {
            const activeOption = entityStatusOptions.find(option => option.name.toLowerCase() === 'active');
            if (activeOption) {
                setFormData(prev => ({ ...prev, entity_status_id: activeOption.id }));
            }
        }
    }, [entityStatusOptions, formData.entity_status_id]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const target = e.target as HTMLInputElement | HTMLTextAreaElement;
        const { name: fieldName, value } = target;
        setFormData(prev => ({ ...prev, [fieldName]: value }));
        if (fieldName === 'name') {
            setName(value);
            if (!manuallyOverridden) queueMicrotask(() => setFormData(p => ({ ...p, slug })));
        }
        if (fieldName === 'slug') setSlug(value);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});
        setGeneralError('');
        try {
            const payload = {
                ...formData,
                entity_type_id: formData.entity_type_id ? Number(formData.entity_type_id) : undefined,
                entity_status_id: formData.entity_status_id ? Number(formData.entity_status_id) : undefined,
                primary_location_id: formData.primary_location_id ? Number(formData.primary_location_id) : undefined,
                started_at: formData.started_at ? `${formData.started_at}:00` : undefined,
                tag_list: formData.tag_list,
                role_list: formData.role_list,
                aliases: formData.aliases,
            };
            const { data } = await api.put(`/entities/${entitySlug}`, payload);
            // Invalidate the entity query cache to ensure fresh data is loaded on the detail page
            await queryClient.invalidateQueries({ queryKey: ['entity', data.slug] });
            navigate({ to: `/entities/${data.slug}` });
        } catch (err) {
            handleFormError(err, setErrors, setGeneralError);
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
            <h1 className="text-3xl font-bold">Edit Entity</h1>
            {generalError && <div className="text-red-500">{generalError}</div>}
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" name="name" value={name} onChange={handleChange} className={fieldClasses} />
                        {renderError('name')}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="slug">Slug</Label>
                        <Input id="slug" name="slug" value={slug} onChange={handleChange} className={fieldClasses} />
                        {renderError('slug')}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="short">Short Description</Label>
                        <Input id="short" name="short" value={formData.short} onChange={handleChange} className={fieldClasses} />
                        {renderError('short')}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="visibility_id">Visibility</Label>
                        <Select value={String(formData.visibility_id)} onValueChange={(val) => setFormData((p) => ({ ...p, visibility_id: Number(val) }))}>
                            <SelectTrigger id="visibility_id" className="bg-white border-slate-300 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100 focus-visible:ring-0 focus:border-slate-500 focus:dark:border-slate-400" aria-label="Entity visibility">
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
                </div>
                <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        className="w-full border rounded p-2 bg-white border-slate-300 text-slate-900 placeholder-slate-500 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100 dark:placeholder-slate-400 focus-visible:ring-0 focus:border-slate-500 focus:dark:border-slate-400"
                    />
                    {renderError('description')}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <AjaxSelect
                        label="Type"
                        endpoint="entity-types"
                        value={formData.entity_type_id}
                        onChange={(val) => setFormData((p) => ({ ...p, entity_type_id: val }))}
                        placeholder="Select entity type..."
                    />
                    {renderError('entity_type_id')}
                    <AjaxSelect
                        label="Status"
                        endpoint="entity-statuses"
                        value={formData.entity_status_id}
                        onChange={(val) => setFormData((p) => ({ ...p, entity_status_id: val }))}
                        placeholder="Select status..."
                    />
                    {renderError('entity_status_id')}
                </div>
                <div className="space-y-2">
                    <AjaxSelect
                        label="Primary Location"
                        endpoint="locations"
                        value={formData.primary_location_id}
                        onChange={(val) => setFormData((p) => ({ ...p, primary_location_id: val }))}
                        placeholder="Select location..."
                    />
                    {renderError('primary_location_id')}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="started_at">Started At</Label>
                        <Input id="started_at" name="started_at" type="datetime-local" value={formData.started_at} onChange={handleChange} className={fieldClasses} />
                        {renderError('started_at')}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="facebook_username">Facebook Username</Label>
                        <Input id="facebook_username" name="facebook_username" value={formData.facebook_username} onChange={handleChange} placeholder="facebook_username" className={fieldClasses} />
                        {renderError('facebook_username')}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="instagram_username">Instagram Username</Label>
                        <Input id="instagram_username" name="instagram_username" value={formData.instagram_username} onChange={handleChange} placeholder="instagram_username" className={fieldClasses} />
                        {renderError('instagram_username')}
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <AjaxMultiSelect
                        label="Tags"
                        endpoint="tags"
                        value={formData.tag_list}
                        onChange={(ids) => setFormData(p => ({ ...p, tag_list: ids }))}
                        placeholder="Type to add tag..."
                    />
                    <AjaxMultiSelect
                        label="Roles"
                        endpoint="roles"
                        value={formData.role_list}
                        onChange={(ids) => setFormData(p => ({ ...p, role_list: ids }))}
                        placeholder="Type to add role..."
                    />
                </div>
                <div className="space-y-2">
                    <StringMultiInput
                        label="Aliases"
                        value={formData.aliases}
                        onChange={(aliases) => setFormData(p => ({ ...p, aliases }))}
                        placeholder="Type an alias and press Enter..."
                    />
                    {renderError('aliases')}
                </div>
                <Button type="submit" className="w-full">Save Entity</Button>
            </form>
        </div>
    );
};

export const EntityEditRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/entity/$entitySlug/edit',
    component: function EntityEditWrapper() {
        const params = EntityEditRoute.useParams();
        return <EntityEdit entitySlug={params.entitySlug} />;
    },
    head: () => {
        // Build current absolute URL in the client; SSR fallback to site root
        const url = typeof window !== 'undefined' ? window.location.href : 'https://arcane.city/entity/$entitySlug/edit';

        return {
            meta: [
                { title: `Entity Edit • ${SITE_NAME}` },
                { property: 'og:url', content: `${url}` },
                { property: 'og:type', content: 'website' },
                { property: 'og:title', content: `Entity Edit • ${SITE_NAME}` },
                { property: 'og:image', content: DEFAULT_IMAGE },
                { property: 'og:description', content: `Edit an entity in the Pittsburgh Events Guide.` },
                { name: 'description', content: `Edit an entity in the Pittsburgh Events Guide.` },
            ],
        };
    },
});

