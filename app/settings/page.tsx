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
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
                    <p className="text-gray-500 mt-1">Manage your account preferences and settings</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Sidebar Navigation */}
                    <div className="lg:col-span-1">
                        <nav className="space-y-1">
                            {sections.map((section) => {
                                const Icon = section.icon;
                                return (
                                    <button
                                        key={section.id}
                                        onClick={() => setActiveSection(section.id)}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${activeSection === section.id
                                                ? 'bg-[var(--primary-teal)] text-white'
                                                : 'text-gray-700 hover:bg-gray-100'
                                            }`}
                                    >
                                        <Icon size={20} />
                                        <span className="font-medium">{section.title}</span>
                                    </button>
                                );
                            })}
                        </nav>
                    </div>

                    {/* Content Area */}
                    <div className="lg:col-span-3 space-y-6">
                        {/* Profile Section */}
                        {activeSection === 'profile' && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Profile Information</CardTitle>
                                    <CardDescription>Update your personal information and profile details</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="flex items-center gap-6">
                                        <div className="w-20 h-20 rounded-full bg-[var(--primary-teal)] flex items-center justify-center text-white text-2xl font-bold">
                                            {user?.firstName?.[0]}{user?.lastName?.[0]}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-lg">{user?.fullName}</h3>
                                            <p className="text-gray-500">{user?.primaryEmailAddress?.emailAddress}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="firstName">First Name</Label>
                                            <Input id="firstName" defaultValue={user?.firstName || ''} className="mt-1" />
                                        </div>
                                        <div>
                                            <Label htmlFor="lastName">Last Name</Label>
                                            <Input id="lastName" defaultValue={user?.lastName || ''} className="mt-1" />
                                        </div>
                                    </div>

                                    <div>
                                        <Label htmlFor="organization">Organization</Label>
                                        <Input id="organization" placeholder="Your organization" className="mt-1" />
                                    </div>

                                    <div>
                                        <Label htmlFor="role">Role/Position</Label>
                                        <Input id="role" placeholder="e.g., Facility Manager" className="mt-1" />
                                    </div>

                                    <Button onClick={handleSave} disabled={saving} className="gap-2">
                                        <Save size={16} />
                                        {saving ? 'Saving...' : 'Save Changes'}
                                    </Button>
                                </CardContent>
                            </Card>
                        )}

                        {/* Notifications Section */}
                        {activeSection === 'notifications' && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Notification Preferences</CardTitle>
                                    <CardDescription>Manage how and when you receive notifications</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium">Email Notifications</p>
                                            <p className="text-sm text-gray-500">Receive notifications via email</p>
                                        </div>
                                        <Switch
                                            checked={settings.emailNotifications}
                                            onCheckedChange={(checked) =>
                                                setSettings({ ...settings, emailNotifications: checked })
                                            }
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium">Assessment Reminders</p>
                                            <p className="text-sm text-gray-500">Get reminded to complete assessments</p>
                                        </div>
                                        <Switch
                                            checked={settings.assessmentReminders}
                                            onCheckedChange={(checked) =>
                                                setSettings({ ...settings, assessmentReminders: checked })
                                            }
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium">Weekly Digest</p>
                                            <p className="text-sm text-gray-500">Receive a weekly summary of activity</p>
                                        </div>
                                        <Switch
                                            checked={settings.weeklyDigest}
                                            onCheckedChange={(checked) =>
                                                setSettings({ ...settings, weeklyDigest: checked })
                                            }
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium">Report Completion Alerts</p>
                                            <p className="text-sm text-gray-500">Get notified when reports are ready</p>
                                        </div>
                                        <Switch
                                            checked={settings.reportAlerts}
                                            onCheckedChange={(checked) =>
                                                setSettings({ ...settings, reportAlerts: checked })
                                            }
                                        />
                                    </div>

                                    <Button onClick={handleSave} disabled={saving} className="gap-2">
                                        <Save size={16} />
                                        {saving ? 'Saving...' : 'Save Preferences'}
                                    </Button>
                                </CardContent>
                            </Card>
                        )}

                        {/* Privacy & Data Section */}
                        {activeSection === 'privacy' && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Privacy & Data</CardTitle>
                                    <CardDescription>Manage your data and privacy settings</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div>
                                        <h3 className="font-semibold mb-2">Export Your Data</h3>
                                        <p className="text-sm text-gray-500 mb-4">
                                            Download a copy of all your data including assessments, reports, and settings
                                        </p>
                                        <Button variant="outline" onClick={handleExportData} className="gap-2">
                                            <Download size={16} />
                                            Export Data
                                        </Button>
                                    </div>

                                    <div className="border-t pt-6">
                                        <h3 className="font-semibold mb-2 text-red-600">Delete Account</h3>
                                        <p className="text-sm text-gray-500 mb-4">
                                            Permanently delete your account and all associated data. This action cannot be undone.
                                        </p>
                                        <Button variant="destructive">Delete Account</Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Appearance Section */}
                        {activeSection === 'appearance' && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Appearance</CardTitle>
                                    <CardDescription>Customize how the application looks</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div>
                                        <Label htmlFor="theme">Theme</Label>
                                        <select
                                            id="theme"
                                            value={settings.theme}
                                            onChange={(e) => setSettings({ ...settings, theme: e.target.value })}
                                            className="w-full mt-1 rounded-md border-gray-300 p-2 border"
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
                                            className="w-full mt-1 rounded-md border-gray-300 p-2 border"
                                        >
                                            <option value="en">English</option>
                                            <option value="sw">Kiswahili</option>
                                            <option value="fr">Français</option>
                                        </select>
                                    </div>

                                    <Button onClick={handleSave} disabled={saving} className="gap-2">
                                        <Save size={16} />
                                        {saving ? 'Saving...' : 'Save Preferences'}
                                    </Button>
                                </CardContent>
                            </Card>
                        )}

                        {/* API & Integrations Section */}
                        {activeSection === 'api' && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>API & Integrations</CardTitle>
                                    <CardDescription>Manage API keys and third-party integrations</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div>
                                        <h3 className="font-semibold mb-2">API Keys</h3>
                                        <p className="text-sm text-gray-500 mb-4">
                                            Generate API keys for programmatic access to your data
                                        </p>
                                        <Button variant="outline">Generate New API Key</Button>
                                    </div>

                                    <div className="border-t pt-6">
                                        <h3 className="font-semibold mb-2">Webhooks</h3>
                                        <p className="text-sm text-gray-500 mb-4">
                                            Configure webhooks to receive real-time updates
                                        </p>
                                        <Button variant="outline">Add Webhook</Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
