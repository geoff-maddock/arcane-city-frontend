import React, { useState, useEffect } from 'react';
import { createRoute, useNavigate, Link } from '@tanstack/react-router';
import { rootRoute } from './root';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { api } from '@/lib/api';
import { handleFormError } from '@/lib/errorHandler';
import { useQuery } from '@tanstack/react-query';
import { authService } from '../services/auth.service';
import { useTagTypes } from '../hooks/useTagTypes';
import { Tag } from '../types/api';
import { useSlug } from '@/hooks/useSlug';
import { useFormValidation } from '@/hooks/useFormValidation';
import { tagEditSchema } from '@/validation/schemas';
import ValidationSummary from '@/components/ValidationSummary';
import { SITE_NAME, DEFAULT_IMAGE } from './../lib/seo';
import { useBackNavigation } from '../context/NavigationContext';

const TagEdit: React.FC<{ slug: string }> = ({ slug }) => {
  const navigate = useNavigate();
  const { backHref } = useBackNavigation(`/tags/${slug}`);

  const { data: tag, isLoading: tagLoading } = useQuery<Tag>({
    queryKey: ['tag', slug],
    queryFn: async () => {
      const { data } = await api.get<Tag>(`/tags/${slug}`);
      return data;
    },
  });

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: authService.getCurrentUser,
    enabled: authService.isAuthenticated(),
  });

  const { data: tagTypeOptions } = useTagTypes();

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    tag_type_id: '' as number | '',
  });
  const { name, slug: hookSlug, setName, setSlug, initialize } = useSlug('', '');
  const { setValues: setInternalValues, handleChange: baseHandleChange, handleBlur, errors, touched, validateForm, getFieldError, errorSummary, generalError, setGeneralError, applyExternalErrors } = useFormValidation({
    initialValues: formData,
    schema: tagEditSchema,
    buildValidationValues: () => ({ name, slug: hookSlug })
  });
  const [nameCheck, setNameCheck] = useState<'idle' | 'unique' | 'duplicate'>('idle');
  // Shared field classes (light/dark)
  const fieldClasses = 'bg-white border-slate-300 text-slate-900 placeholder-slate-500 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100 dark:placeholder-slate-400 focus-visible:ring-0 focus:border-slate-500 focus:dark:border-slate-400';
  const [duplicateTag, setDuplicateTag] = useState<{ name: string; slug: string } | null>(null);

  useEffect(() => {
    if (tag) {
      setFormData({
        name: tag.name,
        slug: tag.slug,
        description: tag.description || '',
        tag_type_id: (tag.tag_type_id || tag.tag_type?.id || '') as number | '',
      });
      initialize(tag.name, tag.slug); // allow name edits to keep syncing until slug manually changed
    }
  }, [tag, initialize]);

  // uniqueness check (exclude current tag slug)
  useEffect(() => {
    const trimmedName = name.trim();
    const trimmedSlug = hookSlug.trim();
    if (!trimmedName || !trimmedSlug) {
      setNameCheck('idle');
      setDuplicateTag(null);
      return;
    }
    // Skip if unchanged from original tag values (treat as unique)
    if (tag && trimmedName === tag.name && trimmedSlug === tag.slug) {
      setNameCheck('idle');
      setDuplicateTag(null);
      return;
    }
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const params = new URLSearchParams();
        params.append('filters[name]', trimmedName);
        params.append('filters[slug]', trimmedSlug);
        params.append('limit', '1');
        const { data } = await api.get(`/tags?${params.toString()}`, { signal: controller.signal });
        if (data?.data?.length > 0) {
          const t = data.data[0];
          // If the found tag is the same as the one we're editing, treat as unique
          if (tag && t.slug === tag.slug) {
            setDuplicateTag(null);
            setNameCheck('idle');
          } else {
            setDuplicateTag({ name: t.name, slug: t.slug });
            setNameCheck('duplicate');
          }
        } else {
          setDuplicateTag(null);
          setNameCheck('unique');
        }
      } catch {/* ignore */ }
    }, 400);
    return () => { controller.abort(); clearTimeout(timer); };
  }, [name, hookSlug, tag]);

  if (!authService.isAuthenticated() || !user) {
    return <div className="p-6">You must be logged in to edit a tag.</div>;
  }

  if (tag && user.id !== tag.created_by) {
    return <div className="p-6">You are not authorized to edit this tag.</div>;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name: fieldName, value } = e.target;
    setFormData(prev => ({ ...prev, [fieldName]: value }));
    baseHandleChange(e);
    if (fieldName === 'name') setName(value);
    if (fieldName === 'slug') setSlug(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError('');
    setInternalValues(v => ({ ...v }));
    if (!validateForm()) return;
    try {
      const payload = {
        ...formData,
        tag_type_id: formData.tag_type_id || undefined,
      };
      await api.put(`/tags/${slug}`, payload);
      navigate({ to: '/tags/$slug', params: { slug: formData.slug } });
    } catch (error) {
      handleFormError(error, applyExternalErrors, setGeneralError);
    }
  };

  const renderError = (field: string) => {
    if (!touched[field] && !(errors[field] && errors[field].length)) return null;
    const message = getFieldError(field as keyof typeof formData);
    if (message) return <p className="text-sm text-red-500 mt-1">{message}</p>;
    return null;
  };

  if (tagLoading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link to={backHref}>
            Back
          </Link>
        </Button>
      </div>
      <h1 className="text-3xl font-bold">Edit Tag</h1>
      {generalError && (
        <div className="text-red-500">{generalError}</div>
      )}
      <ValidationSummary errorSummary={errorSummary} />
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" value={name} onChange={handleChange} onBlur={handleBlur} className={fieldClasses} />
          {nameCheck === 'unique' && <p className="text-green-600 text-xs">Unique</p>}
          {nameCheck === 'duplicate' && duplicateTag && (
            <p className="text-red-600 text-xs">Duplicate: <Link to="/tags/$slug" params={{ slug: duplicateTag.slug }} className="underline">{duplicateTag.name}</Link></p>
          )}
          {renderError('name')}
        </div>
        <div className="space-y-2">
          <Label htmlFor="slug">Slug</Label>
          <Input id="slug" name="slug" value={hookSlug} onChange={handleChange} onBlur={handleBlur} className={fieldClasses} />
          {nameCheck === 'unique' && <p className="text-green-600 text-xs">Unique</p>}
          {nameCheck === 'duplicate' && duplicateTag && <p className="text-red-600 text-xs">Slug in use</p>}
          {renderError('slug')}
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" name="description" value={formData.description} onChange={handleChange} onBlur={handleBlur} className="bg-white border-slate-300 text-slate-900 placeholder-slate-500 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100 dark:placeholder-slate-400 focus-visible:ring-0 focus:border-slate-500 focus:dark:border-slate-400" />
          {renderError('description')}
        </div>
        <div className="space-y-2">
          <Label>Tag Type</Label>
          <Select
            value={formData.tag_type_id ? String(formData.tag_type_id) : ''}
            onValueChange={v =>
              setFormData(p => ({ ...p, tag_type_id: Number(v) }))
            }
          >
            <SelectTrigger className="bg-white border-slate-300 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100 focus-visible:ring-0 focus:border-slate-500 focus:dark:border-slate-400" aria-label="Tag type">
              <SelectValue placeholder="Select a tag type" />
            </SelectTrigger>
            <SelectContent>
              {tagTypeOptions?.map(opt => (
                <SelectItem key={opt.id} value={String(opt.id)}>
                  {opt.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {renderError('tag_type_id')}
        </div>
        <Button type="submit" className="w-full">Update Tag</Button>
      </form>
    </div>
  );
};

export const TagEditRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/tags/$slug/edit',
  component: function TagEditWrapper() {
    const params = TagEditRoute.useParams();
    return <TagEdit slug={params.slug} />;
  },
  head: () => {
    // Build current absolute URL in the client; SSR fallback to site root
    const url = typeof window !== 'undefined' ? window.location.href : 'https://arcane.city/tag/$slug/edit';

    return {
      meta: [
        { title: `Tag Edit • ${SITE_NAME}` },
        { property: 'og:url', content: `${url}` },
        { property: 'og:type', content: 'website' },
        { property: 'og:title', content: `Tag Edit • ${SITE_NAME}` },
        { property: 'og:image', content: DEFAULT_IMAGE },
        { property: 'og:description', content: `Edit a tag in the Pittsburgh Events Guide.` },
        { name: 'description', content: `Edit a tag in the Pittsburgh Events Guide.` },
      ],
    };
  },
});

