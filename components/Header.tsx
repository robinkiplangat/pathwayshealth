"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
    SignInButton,
    SignUpButton,
    SignedIn,
    SignedOut,
    UserButton,
} from "@clerk/nextjs";
import { cn } from "@/lib/utils";

export function Header() {
    const [scrolled, setScrolled] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const isHomePage = pathname === "/";
    const showLogo = !isHomePage || scrolled;

    return (
        <header
            className={cn(
                "top-0 left-0 right-0 z-50 transition-all duration-300 p-4",
                isHomePage ? "fixed" : "sticky bg-white/80 backdrop-blur-md shadow-sm border-b border-white/20",
                scrolled && isHomePage ? "bg-white/80 backdrop-blur-md shadow-sm border-b border-white/20" : ""
            )}
        >
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                {/* Logo Section */}
                <div className={cn("transition-opacity duration-300", showLogo ? "opacity-100" : "opacity-0 pointer-events-none")}>
                    <Link href="/" className="flex items-center gap-3">
                        <Image
                            src="/PH_logo.png"
                            alt="Pathways Health"
                            width={120}
                            height={120}
                            className="h-24 w-auto"
                        />
                        <span className={cn("font-bold text-xl hidden sm:block", !isHomePage || scrolled ? "text-foreground" : "text-white")}>
                            {/* Pathways Health */}
                        </span>
                    </Link>
                </div>

                {/* Auth Section */}
                <div className="flex items-center gap-4">
                    <SignedOut>
                        <SignInButton mode="modal">
                            <button className={cn(
                                "px-6 py-2.5 rounded-full shadow-md transition-all duration-300 text-sm font-semibold hover:-translate-y-0.5",
                                scrolled || !isHomePage
                                    ? "bg-resilience-green hover:bg-resilience-green/90 text-white shadow-resilience-green/20"
                                    : "bg-resilience-green hover:bg-resilience-green/90 text-white shadow-black/20 border border-white/10"
                            )}>
                                Sign In
                            </button>
                        </SignInButton>
                    </SignedOut>
                    <SignedIn>
                        <UserButton afterSignOutUrl="/" />
                    </SignedIn>
                </div>
            </div>
        </header>
    );
}
