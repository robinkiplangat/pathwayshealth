"use client";

import Link from 'next/link';
import Image from 'next/image';
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
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <aside
                className={cn(
                    "bg-white border-r border-gray-100 fixed inset-y-0 left-0 z-50 w-64 transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.1)]",
                    isSidebarOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <div className="h-20 flex items-center justify-between px-6 border-b border-gray-100">
                    <Link href="/" className="flex items-center gap-2">
                        <Image
                            src="/PH_logo.png"
                            alt="Pathways Health"
                            width={160}
                            height={60}
                            className="h-12 w-auto object-contain"
                            priority
                        />
                    </Link>
                    <button
                        className="ml-auto lg:hidden text-gray-500 hover:text-gray-900"
                        onClick={() => setIsSidebarOpen(false)}
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <nav className="p-4 space-y-1.5 mt-2">
                    {navItems.map((item) => {
                        const isActive = pathname.startsWith(item.href);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group relative overflow-hidden",
                                    isActive
                                        ? "bg-[var(--primary-teal)]/10 text-[var(--primary-teal-dark)]"
                                        : "text-slate-600 hover:bg-gray-50 hover:text-slate-900"
                                )}
                            >
                                {isActive && (
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-[var(--primary-teal)] rounded-r-full" />
                                )}
                                <item.icon className={cn("h-5 w-5 transition-colors", isActive ? "text-[var(--primary-teal)]" : "text-slate-400 group-hover:text-slate-600")} />
                                {item.title}
                            </Link>
                        );
                    })}
                </nav>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Mobile Header */}
                <header className="lg:hidden bg-white/80 backdrop-blur-md border-b border-gray-200 h-16 flex items-center px-4 sticky top-0 z-40">
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="text-gray-500 hover:text-gray-900 p-2 -ml-2 rounded-lg hover:bg-gray-100"
                    >
                        <Menu className="h-6 w-6" />
                    </button>
                    <div className="ml-4 flex items-center">
                        <Image
                            src="/PH_logo.png"
                            alt="Pathways Health"
                            width={120}
                            height={40}
                            className="h-8 w-auto object-contain"
                        />
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-gray-50/50">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
