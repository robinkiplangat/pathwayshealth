import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="relative z-10 mt-auto pb-6 px-4">
            <div className="container mx-auto max-w-5xl">
                <div className="bg-[#1a1a1a]/90 backdrop-blur-md border border-white/10 shadow-2xl rounded-2xl p-8 md:p-10">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                        <div>
                            <h3 className="text-xl font-bold text-white mb-4">Pathways Health</h3>
                            <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
                                Empowering healthcare facilities to build climate resilience through actionable assessments and planning.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-bold text-white mb-4">Quick Links</h4>
                            <ul className="space-y-2 text-gray-400 text-sm">
                                <li><Link href="/assessment" className="hover:text-resilience-green transition-colors">Start Assessment</Link></li>
                                <li><Link href="/dashboard" className="hover:text-resilience-green transition-colors">Dashboard</Link></li>
                                <li><Link href="#" className="hover:text-resilience-green transition-colors">WHO Guidance</Link></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-bold text-white mb-4">Legal & Contact</h4>
                            <ul className="space-y-2 text-gray-400 text-sm">
                                <li><Link href="/privacy-policy" className="hover:text-resilience-green transition-colors">Privacy Policy</Link></li>
                                <li><Link href="/terms-of-service" className="hover:text-resilience-green transition-colors">Terms of Use</Link></li>
                                <li><Link href="mailto:info@fourbic.com" className="hover:text-resilience-green transition-colors">Contact Us</Link></li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500">
                        <p>© 2025 Pathways Health. All rights reserved.</p>
                        <div className="flex items-center gap-4">
                            <span className="hover:text-white cursor-pointer transition-colors">English</span>
                            <span className="hover:text-white cursor-pointer transition-colors">Kiswahili</span>
                            <span className="hover:text-white cursor-pointer transition-colors">Français</span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
