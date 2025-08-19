import React, { useState, useEffect } from 'react';
import { createRoute, useNavigate, Link } from '@tanstack/react-router';
import { rootRoute } from './root';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { api } from '@/lib/api';
import { AxiosError } from 'axios';
import { formatApiError } from '@/lib/utils';
import { useSlug } from '@/hooks/useSlug';
import { useFormValidation } from '@/hooks/useFormValidation';
import { tagCreateSchema } from '@/validation/schemas';
import ValidationSummary from '@/components/ValidationSummary';
import { authService } from '../services/auth.service';
import { useTagTypes } from '../hooks/useTagTypes';


const TagCreate: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    tag_type_id: 1 as number | '',
  });
  const { name, slug, setName, setSlug, manuallyOverridden } = useSlug('', '');
  const { setValues: setInternalValues, handleChange: baseHandleChange, handleBlur, errors, touched, validateForm, getFieldError, errorSummary, generalError, setGeneralError, applyExternalErrors } = useFormValidation({
    initialValues: formData,
    schema: tagCreateSchema,
    buildValidationValues: () => ({
      name: name,
      slug: slug,
    })
  });
  const [nameCheck, setNameCheck] = useState<'idle' | 'unique' | 'duplicate'>('idle');
  const [duplicateTag, setDuplicateTag] = useState<{ name: string; slug: string } | null>(null);

  useEffect(() => {
    const trimmedName = name.trim();
    const trimmedSlug = slug.trim();
    if (!trimmedName || !trimmedSlug) {
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
          setDuplicateTag({ name: t.name, slug: t.slug });
          setNameCheck('duplicate');
        } else {
          setDuplicateTag(null);
          setNameCheck('unique');
        }
      } catch {
        /* ignore */
      }
    }, 400);
    return () => { controller.abort(); clearTimeout(timer); };
  }, [name, slug]);

  const { data: tagTypeOptions } = useTagTypes();

  // Set default tag type to "Category" when options are loaded
  useEffect(() => {
    if (tagTypeOptions && tagTypeOptions.length > 0) {
      const categoryOption = tagTypeOptions.find(option => option.name.toLowerCase() === 'category');
      if (categoryOption && formData.tag_type_id === 1) {
        setFormData(prev => ({ ...prev, tag_type_id: categoryOption.id }));
      }
    }
  }, [tagTypeOptions, formData.tag_type_id]);

  if (!authService.isAuthenticated()) {
    return (
      <div className="p-6">You must be logged in to create a tag.</div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const target = e.target;
    const fieldName = target.name;
    const value = target.value;
    setFormData(prev => ({ ...prev, [fieldName]: value }));
    baseHandleChange(e);
    if (fieldName === 'name') {
      setName(value);
      if (!manuallyOverridden) queueMicrotask(() => setFormData(p => ({ ...p, slug })));
    }
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
      const { data } = await api.post('/tags', payload);
      navigate({ to: '/tags/$slug', params: { slug: data.slug } });
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 422) {
        applyExternalErrors(error.response.data.errors || {});
        return;
      }
      setGeneralError(formatApiError(error));
    }
  };

  const renderError = (field: string) => {
    if (!touched[field] && !(errors[field] && errors[field].length)) return null;
    const message = getFieldError(field as keyof typeof formData);
    if (message) return <p className="text-sm text-red-500 mt-1">{message}</p>;
    return null;
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link to="/tags">Back</Link>
        </Button>
      </div>
      <h1 className="text-3xl font-bold">Create Tag</h1>
      {generalError && (
        <div className="text-red-500">{generalError}</div>
      )}
      <ValidationSummary errorSummary={errorSummary} />
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" value={name} onChange={handleChange} onBlur={handleBlur} />
          {nameCheck === 'unique' && <p className="text-green-600 text-xs">Unique</p>}
          {nameCheck === 'duplicate' && duplicateTag && (
            <p className="text-red-600 text-xs">Duplicate tag exists: <Link to="/tags/$slug" params={{ slug: duplicateTag.slug }} className="underline">{duplicateTag.name}</Link></p>
          )}
          {renderError('name')}
        </div>
        <div className="space-y-2">
          <Label htmlFor="slug">Slug</Label>
          <Input id="slug" name="slug" value={slug} onChange={handleChange} onBlur={handleBlur} />
          {nameCheck === 'unique' && <p className="text-green-600 text-xs">Unique</p>}
          {nameCheck === 'duplicate' && duplicateTag && <p className="text-red-600 text-xs">Slug in use</p>}
          {renderError('slug')}
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" name="description" value={formData.description} onChange={handleChange} onBlur={handleBlur} />
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
            <SelectTrigger>
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
        <Button type="submit" className="w-full">Create Tag</Button>
      </form>
    </div>
  );
};

export const TagCreateRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/tag/create',
  component: TagCreate,
});

