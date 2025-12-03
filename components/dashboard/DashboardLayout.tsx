"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
    LayoutDashboard,
    Map,
    Building2,
    FileText,
    Settings,
    Menu,
    X
} from 'lucide-react';
import { useState } from 'react';

interface DashboardLayoutProps {
    children: React.ReactNode;
}

const navItems = [
    {
        title: 'National Overview',
        href: '/dashboards/national',
        icon: LayoutDashboard,
    },
    {
        title: 'Regional View',
        href: '/dashboards/regional',
        icon: Map,
    },
    {
        title: 'Facilities',
        href: '/dashboards/facility',
        icon: Building2,
    },
    {
        title: 'Your Reports',
        href: '/reports',
        icon: FileText,
    },
    {
        title: 'Settings',
        href: '/settings',
        icon: Settings,
    },
];

export function DashboardLayout({ children }: DashboardLayoutProps) {
    const pathname = usePathname();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    return (
        <div className="min-h-screen bg-[var(--bg-secondary)] flex">
            {/* Sidebar */}
            <aside
                className={cn(
                    "bg-white border-r border-gray-200 fixed inset-y-0 left-0 z-50 w-64 transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
                    isSidebarOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <div className="h-16 flex items-center px-6 border-b border-gray-200">
                    <Link href="/" className="flex items-center gap-2 font-bold text-xl text-[var(--foreground)]">
                        <span className="text-[var(--primary-teal)]">Pathways</span>Health
                    </Link>
                    <button
                        className="ml-auto lg:hidden"
                        onClick={() => setIsSidebarOpen(false)}
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <nav className="p-4 space-y-1">
                    {navItems.map((item) => {
                        const isActive = pathname.startsWith(item.href);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                                    isActive
                                        ? "bg-[var(--bg-secondary)] text-[var(--primary-teal-dark)]"
                                        : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                                )}
                            >
                                <item.icon className={cn("h-5 w-5", isActive ? "text-[var(--primary-teal)]" : "text-gray-500")} />
                                {item.title}
                            </Link>
                        );
                    })}
                </nav>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Mobile Header */}
                <header className="lg:hidden bg-white border-b border-gray-200 h-16 flex items-center px-4">
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="text-gray-500 hover:text-gray-900"
                    >
                        <Menu className="h-6 w-6" />
                    </button>
                    <span className="ml-4 font-semibold text-lg text-[var(--primary-teal-dark)]">Dashboard</span>
                </header>

                <main className="flex-1 overflow-y-auto p-4 md:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
