import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="bg-earth-brown text-white py-12 mt-auto">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                    <div>
                        <h3 className="text-xl font-bold mb-4">Pathways Health</h3>
                        <p className="text-white/80 max-w-xs">
                            Empowering healthcare facilities to build climate resilience through actionable assessments and planning.
                        </p>
                    </div>

                    <div>
                        <h4 className="font-bold mb-4">Quick Links</h4>
                        <ul className="space-y-2 text-white/80">
                            <li><Link href="/assessment" className="hover:text-white">Start Assessment</Link></li>
                            <li><Link href="/dashboard" className="hover:text-white">Dashboard</Link></li>
                            <li><Link href="#" className="hover:text-white">WHO Guidance</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold mb-4">Legal & Contact</h4>
                        <ul className="space-y-2 text-white/80">
                            <li><Link href="#" className="hover:text-white">Privacy Policy</Link></li>
                            <li><Link href="#" className="hover:text-white">Terms of Use</Link></li>
                            <li><Link href="#" className="hover:text-white">Contact Us</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-white/20 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-white/60">
                    <p>© 2025 Pathways Health. Open Source.</p>
                    <div className="flex items-center gap-4">
                        <span>English</span>
                        <span>Kiswahili</span>
                        <span>Français</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
