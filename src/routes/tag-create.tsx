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
import { formatApiError, toKebabCase } from '@/lib/utils';
import { authService } from '../services/auth.service';
import { useTagTypes } from '../hooks/useTagTypes';

interface ValidationErrors {
  [key: string]: string[];
}

const TagCreate: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    tag_type_id: 1 as number | '',
  });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [generalError, setGeneralError] = useState('');

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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => {
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
        tag_type_id: formData.tag_type_id || undefined,
      };
      const { data } = await api.post('/tags', payload);
      navigate({ to: '/tags/$slug', params: { slug: data.slug } });
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 422) {
        setErrors(error.response.data.errors || {});
      } else {
        setGeneralError(formatApiError(error));
      }
    }
  };

  const renderError = (field: string) => {
    if (errors[field]) {
      return (
        <p className="text-sm text-red-500 mt-1">{errors[field].join(', ')}</p>
      );
    }
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
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" name="description" value={formData.description} onChange={handleChange} />
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

