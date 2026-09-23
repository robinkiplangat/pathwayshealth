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
                "top-0 left-0 right-0 z-[100] transition-all duration-300 py-4",
                isHomePage ? "fixed" : "sticky bg-white/80 backdrop-blur-md shadow-sm border-b border-white/20",
                scrolled && isHomePage ? "bg-white/80 backdrop-blur-md shadow-sm border-b border-white/20" : ""
            )}
        >
            <div className="container mx-auto px-4 flex items-center justify-between h-20">
                {/* Logo Section */}
                <div className={cn("transition-opacity duration-300", showLogo ? "opacity-100" : "opacity-0 pointer-events-none")}>
                    <Link href="/" className="flex items-center gap-3">
                        <Image
                            src="/PH_logo.png"
                            alt="Pathways Health"
                            width={180}
                            height={180}
                            className="h-28 w-auto"
                        />
                        <span className={cn("font-bold text-xl hidden sm:block", !isHomePage || scrolled ? "text-foreground" : "text-white")}>
                            {/* Pathways Health */}
                        </span>
                    </Link>
                </div>

                {/* Auth Section */}
                <div className="flex items-center gap-4">
                    {pathname === '/methodology' ? (
                        <Link
                            href="https://app.notion.com/p/fourbic/Manuscript-A-Framework-for-Systemic-Transformation-Achieving-Climate-Resilient-and-Environmentall-2ba2f4154da78089af34dc9c5f131fcd?v=2ab2f4154da780cca368000c2f997de7"
                            target="_blank"
                            rel="noopener noreferrer"
                            className={cn(
                                "px-6 py-2.5 rounded-full shadow-md transition-all duration-300 text-sm font-semibold hover:-translate-y-0.5",
                                scrolled || !isHomePage
                                    ? "bg-[#2D7A4A] hover:bg-[#25663e] text-white shadow-md"
                                    : "bg-[#2D7A4A] hover:bg-[#25663e] text-white shadow-md border border-white/10"
                            )}
                        >
                            Read in Full Here
                        </Link>
                    ) : (
                        <>
                            <SignedOut>
                                <Link
                                    href="/#partners"
                                    className={cn(
                                        "text-sm font-semibold transition-colors hover:opacity-80 mr-2 hidden sm:block",
                                        !isHomePage || scrolled ? "text-foreground hover:text-[#2D7A4A]" : "text-white hover:text-white/80"
                                    )}
                                >
                                    Scale our Impact
                                </Link>
                                <SignInButton mode="modal">
                                    <button className={cn(
                                        "px-6 py-2.5 rounded-full shadow-md transition-all duration-300 text-sm font-semibold hover:-translate-y-0.5",
                                        scrolled || !isHomePage
                                            ? "bg-[#2D7A4A] hover:bg-[#25663e] text-white shadow-md"
                                            : "bg-[#2D7A4A] hover:bg-[#25663e] text-white shadow-md border border-white/10"
                                    )}>
                                        Sign In
                                    </button>
                                </SignInButton>
                            </SignedOut>
                            <SignedIn>
                                <UserButton afterSignOutUrl="/" />
                            </SignedIn>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}
