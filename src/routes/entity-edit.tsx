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
import { Entity } from '../types/api';
import { useQuery } from '@tanstack/react-query';

interface ValidationErrors {
    [key: string]: string[];
}

const EntityEdit: React.FC<{ entitySlug: string }> = ({ entitySlug }) => {
    const navigate = useNavigate();
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
        entity_status_id: 1,
        started_at: '',
        facebook_username: '',
        twitter_username: '',
        primary_location_id: '' as number | '',
        tag_list: [] as number[],
        role_list: [] as number[],
    });

    const [tagQuery, setTagQuery] = useState('');
    const [roleQuery, setRoleQuery] = useState('');
    const [selectedTags, setSelectedTags] = useState<{ id: number; name: string }[]>([]);
    const [selectedRoles, setSelectedRoles] = useState<{ id: number; name: string }[]>([]);

    const { data: visibilityOptions } = useSearchOptions('visibilities', '');
    const { data: entityStatusOptions } = useSearchOptions('entity-statuses', '');
    const { data: tagOptions } = useSearchOptions('tags', tagQuery);
    const { data: roleOptions } = useSearchOptions('roles', roleQuery);
    const [errors, setErrors] = useState<ValidationErrors>({});
    const [generalError, setGeneralError] = useState('');

    useEffect(() => {
        if (entity) {
            setFormData({
                name: entity.name || '',
                slug: entity.slug || '',
                short: entity.short || '',
                visibility_id: (entity as { visibility_id?: number }).visibility_id || 1,
                description: entity.description || '',
                entity_type_id: entity.entity_type.id,
                entity_status_id: entity.entity_status.id,
                started_at: entity.started_at || '',
                facebook_username: entity.facebook_username || '',
                twitter_username: entity.twitter_username || '',
                primary_location_id: entity.primary_location?.id || '',
                tag_list: entity.tags.map(t => t.id),
                role_list: entity.roles.map(r => r.id),
            });
            setSelectedTags(entity.tags.map(t => ({ id: t.id, name: t.name })));
            setSelectedRoles(entity.roles.map(r => ({ id: r.id, name: r.name })));
        }
    }, [entity]);

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
        const { name, value } = target;
        setFormData((prev) => {
            const updated = { ...prev, [name]: value } as typeof formData;
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
                entity_type_id: formData.entity_type_id ? Number(formData.entity_type_id) : undefined,
                entity_status_id: formData.entity_status_id ? Number(formData.entity_status_id) : undefined,
                primary_location_id: formData.primary_location_id ? Number(formData.primary_location_id) : undefined,
                tag_list: formData.tag_list,
                role_list: formData.role_list,
            };
            const { data } = await api.put(`/entities/${entitySlug}`, payload);
            navigate({ to: `/entities/${data.slug}` });
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
        <div className="max-w-3xl mx-auto space-y-6 py-8">
            <h1 className="text-3xl font-bold">Edit Entity</h1>
            {generalError && <div className="text-red-500">{generalError}</div>}
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        <Label htmlFor="short">Short Description</Label>
                        <Input id="short" name="short" value={formData.short} onChange={handleChange} />
                        {renderError('short')}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="visibility_id">Visibility</Label>
                        <Select value={String(formData.visibility_id)} onValueChange={(val) => setFormData((p) => ({ ...p, visibility_id: Number(val) }))}>
                            <SelectTrigger id="visibility_id">
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
                        className="w-full border rounded p-2"
                    />
                    {renderError('description')}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="entity_type_id">Type</Label>
                        <SearchableInput
                            id="entity_type_id"
                            endpoint="entity-types"
                            value={formData.entity_type_id}
                            onValueChange={(val) => setFormData((p) => ({ ...p, entity_type_id: val }))}
                        />
                        {renderError('entity_type_id')}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="entity_status_id">Status</Label>
                        <SearchableInput
                            id="entity_status_id"
                            endpoint="entity-statuses"
                            value={formData.entity_status_id}
                            onValueChange={(val) => setFormData((p) => ({ ...p, entity_status_id: val }))}
                        />
                        {renderError('entity_status_id')}
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="primary_location_id">Primary Location</Label>
                    <SearchableInput
                        id="primary_location_id"
                        endpoint="locations"
                        value={formData.primary_location_id}
                        onValueChange={(val) => setFormData((p) => ({ ...p, primary_location_id: val }))}
                    />
                    {renderError('primary_location_id')}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="started_at">Started At</Label>
                        <Input id="started_at" name="started_at" type="datetime-local" value={formData.started_at} onChange={handleChange} />
                        {renderError('started_at')}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="facebook_username">Facebook Username</Label>
                        <Input id="facebook_username" name="facebook_username" value={formData.facebook_username} onChange={handleChange} placeholder="facebook_username" />
                        {renderError('facebook_username')}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="twitter_username">Twitter Username</Label>
                        <Input id="twitter_username" name="twitter_username" value={formData.twitter_username} onChange={handleChange} placeholder="twitter_username" />
                        {renderError('twitter_username')}
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        <Label htmlFor="role_input">Roles</Label>
                        <Input
                            id="role_input"
                            list="role-options"
                            value={roleQuery}
                            onChange={(e) => setRoleQuery(e.target.value)}
                            onBlur={(e) => {
                                const opt = roleOptions?.find((o) => o.name === e.target.value);
                                if (opt && !formData.role_list.includes(opt.id)) {
                                    setFormData((p) => ({ ...p, role_list: [...p.role_list, opt.id] }));
                                    setSelectedRoles((p) => [...p, opt]);
                                }
                                setRoleQuery('');
                            }}
                        />
                        <datalist id="role-options">
                            {roleOptions?.map((o) => (
                                <option key={o.id} value={o.name} />
                            ))}
                        </datalist>
                        <div className="flex flex-wrap gap-2">
                            {selectedRoles.map((role) => (
                                <span key={role.id} className="px-2 py-1 bg-gray-200 rounded text-sm">
                                    {role.name}
                                    <button
                                        type="button"
                                        className="ml-1 text-red-500"
                                        onClick={() => {
                                            setSelectedRoles((p) => p.filter((r) => r.id !== role.id));
                                            setFormData((p) => ({
                                                ...p,
                                                role_list: p.role_list.filter((r) => r !== role.id),
                                            }));
                                        }}
                                    >
                                        ×
                                    </button>
                                </span>
                            ))}
                        </div>
                        {renderError('role_list')}
                    </div>
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
});

