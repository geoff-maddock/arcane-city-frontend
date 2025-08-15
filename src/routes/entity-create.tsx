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

interface ValidationErrors {
    [key: string]: string[];
}

const EntityCreate: React.FC = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        short: '',
        visibility_id: 1,
        description: '',
        entity_type_id: '' as number | '',
        entity_status_id: 1,
        started_at: '',
        facebook_username: '',
        instagram_username: '',
        primary_location_id: '' as number | '',
        tag_list: [] as number[],
        role_list: [] as number[],
    });
    const [tagQuery, setTagQuery] = useState('');
    const [roleQuery, setRoleQuery] = useState('');
    const [selectedTags, setSelectedTags] = useState<{ id: number; name: string }[]>([]);
    const [selectedRoles, setSelectedRoles] = useState<{ id: number; name: string }[]>([]);
    const { name, slug, setName, setSlug, manuallyOverridden } = useSlug('', '');

    const { data: visibilityOptions } = useSearchOptions('visibilities', '');
    const { data: entityStatusOptions } = useSearchOptions('entity-statuses', '');
    const { data: tagOptions } = useSearchOptions('tags', tagQuery);
    const { data: roleOptions } = useSearchOptions('roles', roleQuery);
    const [errors, setErrors] = useState<ValidationErrors>({});
    const [generalError, setGeneralError] = useState('');
    const [nameCheck, setNameCheck] = useState<'idle' | 'unique' | 'duplicate'>('idle');
    const [duplicateEntity, setDuplicateEntity] = useState<{ name: string; slug: string } | null>(null);

    // Set default visibility to "Public" when options are loaded
    useEffect(() => {
        if (visibilityOptions && visibilityOptions.length > 0) {
            const publicOption = visibilityOptions.find(option => option.name.toLowerCase() === 'public');
            if (publicOption && formData.visibility_id === 1) {
                setFormData(prev => ({ ...prev, visibility_id: publicOption.id }));
            }
        }
    }, [visibilityOptions, formData.visibility_id]);

    // Set default entity status to "Active" when options are loaded
    useEffect(() => {
        if (entityStatusOptions && entityStatusOptions.length > 0) {
            const activeOption = entityStatusOptions.find(option => option.name.toLowerCase() === 'active');
            if (activeOption && formData.entity_status_id === 1) {
                setFormData(prev => ({ ...prev, entity_status_id: activeOption.id }));
            }
        }
    }, [entityStatusOptions, formData.entity_status_id]);

    useEffect(() => {
        const name = formData.name.trim();
        const slug = formData.slug.trim();
        if (!name || !slug) {
            setNameCheck('idle');
            setDuplicateEntity(null);
            return;
        }
        const controller = new AbortController();
        const timer = setTimeout(async () => {
            try {
                const params = new URLSearchParams();
                params.append('filters[name]', name);
                params.append('filters[slug]', slug);
                params.append('limit', '1');
                const { data } = await api.get(`/entities?${params.toString()}`, {
                    signal: controller.signal,
                });
                if (data?.data?.length > 0) {
                    const ent = data.data[0];
                    setDuplicateEntity({ name: ent.name, slug: ent.slug });
                    setNameCheck('duplicate');
                } else {
                    setDuplicateEntity(null);
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
                tag_list: formData.tag_list,
                role_list: formData.role_list,
            };
            const { data } = await api.post('/entities', payload);
            navigate({ to: '/entities/$entitySlug', params: { entitySlug: data.slug } });
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
            <h1 className="text-2xl font-bold">Create Entity</h1>
            {generalError && <div className="text-red-500">{generalError}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <div className="flex items-center gap-2">
                        <Input id="name" name="name" value={name} onChange={handleChange} />
                        {nameCheck === 'unique' && <CheckCircle className="text-green-500" />}
                        {nameCheck === 'duplicate' && <XCircle className="text-red-500" />}
                    </div>
                    {nameCheck === 'unique' && (
                        <p className="text-green-500 text-sm">No other entity found with the same name or slug.</p>
                    )}
                    {nameCheck === 'duplicate' && duplicateEntity && (
                        <p className="text-red-500 text-sm">
                            Another entity found with the same name:{' '}
                            <Link to="/entities/$entitySlug" params={{ entitySlug: duplicateEntity.slug }} className="underline">
                                {duplicateEntity.name}
                            </Link>
                            . Please verify this is not a duplicate.
                        </p>
                    )}
                    {renderError('name')}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="slug">Slug</Label>
                    <Input id="slug" name="slug" value={slug} onChange={handleChange} />
                    {renderError('slug')}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="short">Short Description</Label>
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
                        <Label htmlFor="entity_type_id">Entity Type</Label>
                        <SearchableInput
                            id="entity_type_id"
                            endpoint="entity-types"
                            value={formData.entity_type_id}
                            onValueChange={(val) =>
                                setFormData((p) => ({ ...p, entity_type_id: val }))
                            }
                            placeholder="Type to search entity types..."
                        />
                        {renderError('entity_type_id')}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="entity_status_id">Entity Status</Label>
                        <Select
                            value={formData.entity_status_id.toString()}
                            onValueChange={(value) => setFormData(prev => ({ ...prev, entity_status_id: Number(value) }))}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                                {entityStatusOptions?.map((option) => (
                                    <SelectItem key={option.id} value={option.id.toString()}>
                                        {option.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {renderError('entity_status_id')}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="primary_location_id">Primary Location</Label>
                        <SearchableInput
                            id="primary_location_id"
                            endpoint="locations"
                            value={formData.primary_location_id}
                            onValueChange={(val) =>
                                setFormData((p) => ({ ...p, primary_location_id: val }))
                            }
                            placeholder="Type to search locations..."
                        />
                        {renderError('primary_location_id')}
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="started_at">Started At</Label>
                        <Input
                            id="started_at"
                            name="started_at"
                            type="datetime-local"
                            value={formData.started_at}
                            onChange={handleChange}
                        />
                        {renderError('started_at')}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="facebook_username">Facebook Username</Label>
                        <Input
                            id="facebook_username"
                            name="facebook_username"
                            value={formData.facebook_username}
                            onChange={handleChange}
                            placeholder="facebook_username"
                        />
                        {renderError('facebook_username')}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="instagram_username">Instagram Username</Label>
                        <Input
                            id="instagram_username"
                            name="instagram_username"
                            value={formData.instagram_username}
                            onChange={handleChange}
                            placeholder="instagram_username"
                        />
                        {renderError('instagram_username')}
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        label="Roles"
                        datalistId="role-options"
                        query={roleQuery}
                        setQuery={setRoleQuery}
                        options={roleOptions}
                        valueIds={formData.role_list}
                        setValueIds={(ids) => setFormData(p => ({ ...p, role_list: typeof ids === 'function' ? ids(p.role_list) : ids }))}
                        selected={selectedRoles}
                        setSelected={setSelectedRoles}
                        placeholder="Type to add role..."
                        ariaLabelRemove="Remove role"
                    />
                </div>
                <Button type="submit" className="w-full">Create Entity</Button>
            </form>
        </div>
    );
};

export const EntityCreateRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/entity/create',
    component: EntityCreate,
});
