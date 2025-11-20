import Link from 'next/link';
import { Menu } from 'lucide-react';

export default function Header() {
    return (
        <header className="bg-bg-panel shadow-sm sticky top-0 z-50">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-resilience-green rounded-full flex items-center justify-center text-white font-bold">
                        P
                    </div>
                    <span className="text-xl font-bold text-resilience-green">Pathways Health</span>
                </Link>

                <nav className="hidden md:flex items-center gap-6">
                    <Link href="/assessment" className="text-storm-gray hover:text-resilience-green transition-colors">
                        Assessment
                    </Link>
                    <Link href="/dashboard" className="text-storm-gray hover:text-resilience-green transition-colors">
                        Dashboard
                    </Link>
                    <Link href="#" className="text-storm-gray hover:text-resilience-green transition-colors">
                        Resources
                    </Link>
                </nav>

                <div className="flex items-center gap-4">
                    <button className="md:hidden p-2 text-storm-gray">
                        <Menu size={24} />
                    </button>
                    <Link
                        href="/assessment"
                        className="hidden md:block bg-resilience-green text-white px-4 py-2 rounded-lg font-medium hover:bg-opacity-90 transition-all"
                    >
                        Start Assessment
                    </Link>
                </div>
            </div>
        </header>
    );
}
