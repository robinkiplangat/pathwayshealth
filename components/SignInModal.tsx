'use client';

import { SignIn } from '@clerk/nextjs';
import { X } from 'lucide-react';

interface SignInModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    message?: string;
}

export default function SignInModal({
    isOpen,
    onClose,
    title = 'Sign in to save your report',
    message = 'Create a free account to save your assessment report and access it anytime.',
}: SignInModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="relative w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                    aria-label="Close"
                >
                    <X className="h-5 w-5" />
                </button>

                {/* Header */}
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
                    <p className="mt-2 text-sm text-gray-600">{message}</p>
                </div>

                {/* Benefits */}
                <div className="mb-6 space-y-3 rounded-lg bg-blue-50 p-4">
                    <p className="text-sm font-semibold text-blue-900">With a free account you can:</p>
                    <ul className="space-y-2 text-sm text-blue-800">
                        <li className="flex items-start">
                            <span className="mr-2">✅</span>
                            <span>Save unlimited assessment reports</span>
                        </li>
                        <li className="flex items-start">
                            <span className="mr-2">✅</span>
                            <span>Access reports anytime from any device</span>
                        </li>
                        <li className="flex items-start">
                            <span className="mr-2">✅</span>
                            <span>Download PDF reports</span>
                        </li>
                        <li className="flex items-start">
                            <span className="mr-2">✅</span>
                            <span>Track progress over time</span>
                        </li>
                    </ul>
                </div>

                {/* Clerk Sign In Component */}
                <div className="flex justify-center">
                    <SignIn
                        appearance={{
                            elements: {
                                rootBox: 'w-full',
                                card: 'shadow-none',
                            },
                        }}
                        redirectUrl="/dashboard"
                    />
                </div>
            </div>
        </div>
    );
}
