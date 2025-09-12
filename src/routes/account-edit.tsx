import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, createRoute } from '@tanstack/react-router';
import { authService } from '../services/auth.service';
import { api } from '@/lib/api';
import { AxiosError } from 'axios';
import { formatApiError } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { rootRoute } from './root';
import { SITE_NAME, DEFAULT_IMAGE } from './../lib/seo';

interface ValidationErrors {
    [key: string]: string[];
}

const AccountEdit: React.FC = () => {
    const navigate = useNavigate();

    useEffect(() => {
        if (!authService.isAuthenticated()) {
            navigate({ to: '/login' });
        }
    }, [navigate]);

    const { data: user, isLoading, error } = useQuery({
        queryKey: ['currentUser'],
        queryFn: authService.getCurrentUser,
        enabled: authService.isAuthenticated(),
    });

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        profile: {
            alias: '',
            location: '',
            bio: '',
            facebook_username: '',
            twitter_username: '',
            instagram_username: '',
            first_name: '',
            last_name: '',
            default_theme: '',
            setting_weekly_update: false,
            setting_daily_update: false,
            setting_instant_update: false,
            setting_forum_update: false,
            setting_public_profile: false,
        }
    });

    const [errors, setErrors] = useState<ValidationErrors>({});
    const [generalError, setGeneralError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Shared form field classes (light + dark) for consistent contrast
    const fieldClasses = "bg-white border-slate-300 text-slate-900 placeholder-slate-500 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100 dark:placeholder-slate-400 focus-visible:ring-0 focus:border-slate-500 focus:dark:border-slate-400";

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                profile: {
                    alias: user.profile?.alias || '',
                    location: user.profile?.location || '',
                    bio: user.profile?.bio || '',
                    facebook_username: user.profile?.facebook_username || '',
                    twitter_username: user.profile?.twitter_username || '',
                    instagram_username: user.profile?.instagram_username || '',
                    first_name: user.profile?.first_name || '',
                    last_name: user.profile?.last_name || '',
                    default_theme: user.profile?.default_theme || '',
                    setting_weekly_update: Boolean(user.profile?.setting_weekly_update),
                    setting_daily_update: Boolean(user.profile?.setting_daily_update),
                    setting_instant_update: Boolean(user.profile?.setting_instant_update),
                    setting_forum_update: Boolean(user.profile?.setting_forum_update),
                    setting_public_profile: Boolean(user.profile?.setting_public_profile),
                }
            });
        }
    }, [user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (name.startsWith('profile.')) {
            const profileField = name.replace('profile.', '');
            setFormData(prev => ({
                ...prev,
                profile: {
                    ...prev.profile,
                    [profileField]: value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleSwitchChange = (field: string, checked: boolean) => {
        setFormData(prev => ({
            ...prev,
            profile: {
                ...prev.profile,
                [field]: checked
            }
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});
        setGeneralError('');
        setIsSubmitting(true);

        try {
            const payload = {
                name: formData.name,
                email: formData.email,
                profile: {
                    ...formData.profile,
                    // Convert boolean settings to numbers for API
                    setting_weekly_update: formData.profile.setting_weekly_update ? 1 : 0,
                    setting_daily_update: formData.profile.setting_daily_update ? 1 : 0,
                    setting_instant_update: formData.profile.setting_instant_update ? 1 : 0,
                    setting_forum_update: formData.profile.setting_forum_update ? 1 : 0,
                    setting_public_profile: formData.profile.setting_public_profile ? 1 : 0,
                }
            };

            await api.put(`/users/${user?.id}`, payload);
            navigate({ to: '/account' });
        } catch (err) {
            if ((err as AxiosError).response?.status === 422) {
                const resp = (err as AxiosError<{ errors: ValidationErrors }>).response;
                if (resp?.data?.errors) {
                    setErrors(resp.data.errors);
                    return;
                }
            }
            setGeneralError(formatApiError(err));
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderError = (field: string) => {
        if (errors[field]) {
            return <div className="text-red-500 text-sm">{errors[field].join(' ')}</div>;
        }
        return null;
    };

    if (isLoading) return <div className="p-4">Loading...</div>;
    if (error) return <div className="p-4 text-red-500">Failed to load user data.</div>;
    if (!user) return null;

    return (
        <div className="max-w-2xl md:max-w-4xl mx-auto p-4 space-y-4">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="sm" className="flex items-center gap-2" asChild>
                    <Link to="/account">
                        <ArrowLeft className="h-4 w-4" />
                        Back to Account
                    </Link>
                </Button>
            </div>

            <h1 className="text-3xl font-bold">Edit Account</h1>

            {generalError && <div className="text-red-500">{generalError}</div>}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold">Basic Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className={fieldClasses}
                            />
                            {renderError('name')}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className={fieldClasses}
                            />
                            {renderError('email')}
                        </div>
                    </div>
                </div>

                {/* Profile Information */}
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold">Profile Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="profile.first_name">First Name</Label>
                            <Input
                                id="profile.first_name"
                                name="profile.first_name"
                                value={formData.profile.first_name}
                                onChange={handleChange}
                                className={fieldClasses}
                            />
                            {renderError('profile.first_name')}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="profile.last_name">Last Name</Label>
                            <Input
                                id="profile.last_name"
                                name="profile.last_name"
                                value={formData.profile.last_name}
                                onChange={handleChange}
                                className={fieldClasses}
                            />
                            {renderError('profile.last_name')}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="profile.alias">Alias</Label>
                            <Input
                                id="profile.alias"
                                name="profile.alias"
                                value={formData.profile.alias}
                                onChange={handleChange}
                                className={fieldClasses}
                            />
                            {renderError('profile.alias')}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="profile.location">Location</Label>
                            <Input
                                id="profile.location"
                                name="profile.location"
                                value={formData.profile.location}
                                onChange={handleChange}
                                className={fieldClasses}
                            />
                            {renderError('profile.location')}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="profile.bio">Bio</Label>
                        <Textarea
                            id="profile.bio"
                            name="profile.bio"
                            value={formData.profile.bio}
                            onChange={handleChange}
                            rows={4}
                            className={fieldClasses}
                        />
                        {renderError('profile.bio')}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="profile.facebook_username">Facebook Username</Label>
                            <Input
                                id="profile.facebook_username"
                                name="profile.facebook_username"
                                value={formData.profile.facebook_username}
                                onChange={handleChange}
                                placeholder="username"
                                className={fieldClasses}
                            />
                            {renderError('profile.facebook_username')}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="profile.twitter_username">Twitter Username</Label>
                            <Input
                                id="profile.twitter_username"
                                name="profile.twitter_username"
                                value={formData.profile.twitter_username}
                                onChange={handleChange}
                                placeholder="username"
                                className={fieldClasses}
                            />
                            {renderError('profile.twitter_username')}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="profile.instagram_username">Instagram Username</Label>
                            <Input
                                id="profile.instagram_username"
                                name="profile.instagram_username"
                                value={formData.profile.instagram_username}
                                onChange={handleChange}
                                placeholder="username"
                                className={fieldClasses}
                            />
                            {renderError('profile.instagram_username')}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="profile.default_theme">Default Theme</Label>
                        <Input
                            id="profile.default_theme"
                            name="profile.default_theme"
                            value={formData.profile.default_theme}
                            onChange={handleChange}
                            placeholder="e.g., dark, light"
                            className={fieldClasses}
                        />
                        {renderError('profile.default_theme')}
                    </div>
                </div>

                {/* Notification Settings */}
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold">Notification Settings</h2>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="setting_weekly_update">Receive Weekly Updates</Label>
                            <Switch
                                id="setting_weekly_update"
                                checked={formData.profile.setting_weekly_update}
                                onCheckedChange={(checked) => handleSwitchChange('setting_weekly_update', checked)}
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <Label htmlFor="setting_daily_update">Receive Daily Updates</Label>
                            <Switch
                                id="setting_daily_update"
                                checked={formData.profile.setting_daily_update}
                                onCheckedChange={(checked) => handleSwitchChange('setting_daily_update', checked)}
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <Label htmlFor="setting_instant_update">Receive Instant Updates</Label>
                            <Switch
                                id="setting_instant_update"
                                checked={formData.profile.setting_instant_update}
                                onCheckedChange={(checked) => handleSwitchChange('setting_instant_update', checked)}
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <Label htmlFor="setting_forum_update">Receive Forum Updates</Label>
                            <Switch
                                id="setting_forum_update"
                                checked={formData.profile.setting_forum_update}
                                onCheckedChange={(checked) => handleSwitchChange('setting_forum_update', checked)}
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <Label htmlFor="setting_public_profile">Public Profile</Label>
                            <Switch
                                id="setting_public_profile"
                                checked={formData.profile.setting_public_profile}
                                onCheckedChange={(checked) => handleSwitchChange('setting_public_profile', checked)}
                            />
                        </div>
                    </div>
                </div>

                <div className="flex gap-4">
                    <Button type="submit" disabled={isSubmitting} className="flex-1">
                        {isSubmitting ? 'Saving...' : 'Save Changes'}
                    </Button>
                    <Button type="button" variant="outline" asChild>
                        <Link to="/account">Cancel</Link>
                    </Button>
                </div>
            </form>
        </div>
    );
};

export const AccountEditRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/account/edit',
    component: AccountEdit,
    head: () => {
        // Build current absolute URL in the client; SSR fallback to site root
        const url = typeof window !== 'undefined' ? window.location.href : 'https://arcane.city/account/edit';

        return {
            meta: [
                { title: `Account Edit • ${SITE_NAME}` },
                { property: 'og:url', content: `${url}` },
                { property: 'og:type', content: 'website' },
                { property: 'og:title', content: `Account Edit • ${SITE_NAME}` },
                { property: 'og:image', content: DEFAULT_IMAGE },
                { property: 'og:description', content: `Edit your account settings in the Pittsburgh Events Guide.` },
                { name: 'description', content: `Edit your account settings in the Pittsburgh Events Guide.` },
            ],
        };
    },
});

export default AccountEdit;
