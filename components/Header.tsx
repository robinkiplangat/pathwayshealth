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
                    <Link href="/" className="flex items-center gap-2">
                        <Image
                            src="/PH_logo.png"
                            alt="Pathways Health"
                            width={50}
                            height={50}
                            className="h-12 w-auto"
                        />
                        <span className={cn("font-bold text-lg hidden sm:block", !isHomePage || scrolled ? "text-foreground" : "text-white")}>
                            {/* Pathways Health */}
                        </span>
                    </Link>
                </div>

                {/* Auth Section */}
                <div className="flex items-center gap-4">
                    <SignedOut>
                        <SignInButton mode="modal">
                            <button className={cn(
                                "px-4 py-2 rounded-md backdrop-blur-sm transition-colors text-sm font-medium",
                                scrolled || !isHomePage
                                    ? "bg-resilience-green hover:bg-resilience-green/90 text-white"
                                    : "bg-white/10 hover:bg-white/20 text-white"
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
