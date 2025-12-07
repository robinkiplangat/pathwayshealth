"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
    User,
    Bell,
    Shield,
    Palette,
    Code,
    Save,
    Download,
} from "lucide-react";
import { toast } from "react-hot-toast";

type SettingsSection = 'profile' | 'notifications' | 'privacy' | 'appearance' | 'api';

export default function SettingsPage() {
    const { user } = useUser();
    const [activeSection, setActiveSection] = useState<SettingsSection>('profile');
    const [saving, setSaving] = useState(false);

    // Settings state
    const [settings, setSettings] = useState({
        // Notifications
        emailNotifications: true,
        assessmentReminders: true,
        weeklyDigest: false,
        reportAlerts: true,

        // Appearance
        theme: 'light',
        language: 'en',
    });

    const sections = [
        { id: 'profile' as const, title: 'Profile', icon: User },
        { id: 'notifications' as const, title: 'Notifications', icon: Bell },
        { id: 'privacy' as const, title: 'Privacy & Data', icon: Shield },
        { id: 'appearance' as const, title: 'Appearance', icon: Palette },
        { id: 'api' as const, title: 'API & Integrations', icon: Code },
    ];

    const handleSave = async () => {
        setSaving(true);
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            toast.success('Settings saved successfully');
        } catch (error) {
            toast.error('Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    const handleExportData = () => {
        toast.success('Data export started. You will receive an email when ready.');
    };

    return (
        <DashboardLayout>
            <div className="p-4 md:p-8 max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
                        <p className="text-gray-500 mt-1">Manage your account preferences and settings</p>
                    </div>
                    <Button onClick={handleSave} disabled={saving} className="gap-2 shadow-sm">
                        <Save size={16} />
                        {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>

                {/* Top Navigation Tabs */}
                <div className="bg-gray-100/50 p-1 rounded-xl mb-8 overflow-x-auto">
                    <nav className="flex items-center gap-1 min-w-max">
                        {sections.map((section) => {
                            const Icon = section.icon;
                            const isActive = activeSection === section.id;
                            return (
                                <button
                                    key={section.id}
                                    onClick={() => setActiveSection(section.id)}
                                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${isActive
                                        ? 'bg-white text-gray-900 shadow-sm ring-1 ring-black/5'
                                        : 'text-gray-500 hover:text-gray-900 hover:bg-white/50'
                                        }`}
                                >
                                    <Icon size={16} className={isActive ? "text-[var(--primary-teal)]" : ""} />
                                    <span>{section.title}</span>
                                </button>
                            );
                        })}
                    </nav>
                </div>

                {/* Content Area */}
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* Profile Section */}
                    {activeSection === 'profile' && (
                        <Card className="border-none shadow-sm ring-1 ring-gray-100">
                            <CardHeader>
                                <CardTitle>Profile Information</CardTitle>
                                <CardDescription>Update your personal information and profile details</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-8">
                                <div className="flex items-center gap-6">
                                    <div className="w-24 h-24 rounded-full bg-[var(--primary-teal)]/10 flex items-center justify-center text-[var(--primary-teal)] text-3xl font-bold ring-4 ring-white shadow-sm">
                                        {user?.firstName?.[0]}{user?.lastName?.[0]}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-xl text-gray-900">{user?.fullName}</h3>
                                        <p className="text-gray-500">{user?.primaryEmailAddress?.emailAddress}</p>
                                        <Button variant="link" className="px-0 text-[var(--primary-teal)] h-auto mt-1">Change Avatar</Button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <Label htmlFor="firstName">First Name</Label>
                                        <Input id="firstName" defaultValue={user?.firstName || ''} className="mt-2" />
                                    </div>
                                    <div>
                                        <Label htmlFor="lastName">Last Name</Label>
                                        <Input id="lastName" defaultValue={user?.lastName || ''} className="mt-2" />
                                    </div>
                                    <div>
                                        <Label htmlFor="organization">Organization</Label>
                                        <Input id="organization" placeholder="Your organization" className="mt-2" />
                                    </div>
                                    <div>
                                        <Label htmlFor="role">Role/Position</Label>
                                        <Input id="role" placeholder="e.g., Facility Manager" className="mt-2" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Notifications Section */}
                    {activeSection === 'notifications' && (
                        <Card className="border-none shadow-sm ring-1 ring-gray-100">
                            <CardHeader>
                                <CardTitle>Notification Preferences</CardTitle>
                                <CardDescription>Manage how and when you receive notifications</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {[
                                    { key: 'emailNotifications', label: 'Email Notifications', desc: 'Receive notifications via email' },
                                    { key: 'assessmentReminders', label: 'Assessment Reminders', desc: 'Get reminded to complete assessments' },
                                    { key: 'weeklyDigest', label: 'Weekly Digest', desc: 'Receive a weekly summary of activity' },
                                    { key: 'reportAlerts', label: 'Report Completion Alerts', desc: 'Get notified when reports are ready' }
                                ].map((item) => (
                                    <div key={item.key} className="flex items-center justify-between py-2">
                                        <div>
                                            <p className="font-medium text-gray-900">{item.label}</p>
                                            <p className="text-sm text-gray-500">{item.desc}</p>
                                        </div>
                                        <Switch
                                            checked={(settings as any)[item.key]}
                                            onCheckedChange={(checked) =>
                                                setSettings({ ...settings, [item.key]: checked })
                                            }
                                        />
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    )}

                    {/* Privacy & Data Section */}
                    {activeSection === 'privacy' && (
                        <Card className="border-none shadow-sm ring-1 ring-gray-100">
                            <CardHeader>
                                <CardTitle>Privacy & Data</CardTitle>
                                <CardDescription>Manage your data and privacy settings</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-8">
                                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                    <h3 className="font-semibold mb-2 text-gray-900">Export Your Data</h3>
                                    <p className="text-sm text-gray-500 mb-4">
                                        Download a copy of all your data including assessments, reports, and settings.
                                    </p>
                                    <Button variant="outline" onClick={handleExportData} className="gap-2 bg-white">
                                        <Download size={16} />
                                        Export Data
                                    </Button>
                                </div>

                                <div className="p-4 bg-red-50 rounded-xl border border-red-100">
                                    <h3 className="font-semibold mb-2 text-red-700">Delete Account</h3>
                                    <p className="text-sm text-red-600/80 mb-4">
                                        Permanently delete your account and all associated data. This action cannot be undone.
                                    </p>
                                    <Button variant="destructive">Delete Account</Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Appearance Section */}
                    {activeSection === 'appearance' && (
                        <Card className="border-none shadow-sm ring-1 ring-gray-100">
                            <CardHeader>
                                <CardTitle>Appearance</CardTitle>
                                <CardDescription>Customize how the application looks</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <Label htmlFor="theme">Theme</Label>
                                        <select
                                            id="theme"
                                            value={settings.theme}
                                            onChange={(e) => setSettings({ ...settings, theme: e.target.value })}
                                            className="w-full mt-2 rounded-lg border-gray-200 p-2.5 border bg-gray-50/50"
                                        >
                                            <option value="light">Light</option>
                                            <option value="dark">Dark</option>
                                            <option value="system">System</option>
                                        </select>
                                    </div>

                                    <div>
                                        <Label htmlFor="language">Language</Label>
                                        <select
                                            id="language"
                                            value={settings.language}
                                            onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                                            className="w-full mt-2 rounded-lg border-gray-200 p-2.5 border bg-gray-50/50"
                                        >
                                            <option value="en">English</option>
                                            <option value="sw">Kiswahili</option>
                                            <option value="fr">Français</option>
                                        </select>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* API & Integrations Section */}
                    {activeSection === 'api' && (
                        <Card className="border-none shadow-sm ring-1 ring-gray-100">
                            <CardHeader>
                                <CardTitle>API & Integrations</CardTitle>
                                <CardDescription>Manage API keys and third-party integrations</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-8">
                                <div>
                                    <h3 className="font-semibold mb-2 text-gray-900">API Keys</h3>
                                    <p className="text-sm text-gray-500 mb-4">
                                        Generate API keys for programmatic access to your data.
                                    </p>
                                    <Button variant="outline">Generate New API Key</Button>
                                </div>

                                <div className="border-t pt-6">
                                    <h3 className="font-semibold mb-2 text-gray-900">Webhooks</h3>
                                    <p className="text-sm text-gray-500 mb-4">
                                        Configure webhooks to receive real-time updates.
                                    </p>
                                    <Button variant="outline">Add Webhook</Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
