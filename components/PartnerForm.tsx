"use client";

import React, { useState } from 'react';
import { X, Check, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PartnerFormProps {
    className?: string;
    children?: React.ReactNode;
}

export function PartnerForm({ className, children }: PartnerFormProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [contactMethod, setContactMethod] = useState<'email' | 'phone' | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        contact: '',
        downloadPitch: false
    });
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Here you would typically send the data to your backend
        console.log('Form submitted:', { ...formData, contactMethod });

        // Simulate submission
        setIsSubmitted(true);

        // If pitch deck was requested, trigger download
        if (formData.downloadPitch) {
            const link = document.createElement('a');
            link.href = '/PathwaysHealth_Resilience.pdf';
            link.download = 'PathwaysHealth_Resilience.pdf';
            link.target = '_blank';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }

        // Close modal after delay
        setTimeout(() => {
            setIsOpen(false);
            setIsSubmitted(false);
            setFormData({ name: '', contact: '', downloadPitch: false });
            setContactMethod(null);
        }, 3000);
    };

    return (
        <>
            <Button
                onClick={() => setIsOpen(true)}
                size="lg"
                className={cn(
                    "text-xl h-16 px-12 bg-[#2D7A4A] hover:bg-[#25663e] text-white border-2 border-white shadow-[0_0_20px_rgba(45,122,74,0.5)] transition-all hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(45,122,74,0.7)] rounded-xl font-bold w-full sm:w-auto",
                    className
                )}
            >
                {children || "Partner With Us"}
            </Button>

            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div
                        className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden relative animate-in zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close Button */}
                        <button
                            onClick={() => setIsOpen(false)}
                            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100"
                        >
                            <X size={24} />
                        </button>

                        <div className="p-8 md:p-10">
                            {isSubmitted ? (
                                <div className="text-center py-12">
                                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <Check size={32} />
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h3>
                                    <p className="text-gray-600">
                                        We've received your inquiry and will be in touch shortly.
                                        {formData.downloadPitch && " Your download should start automatically."}
                                    </p>
                                </div>
                            ) : (
                                <>
                                    {/* Header */}
                                    <div className="mb-8">
                                        <h2 className="text-3xl font-bold text-gray-900 mb-3">Scale Resilience.</h2>
                                        <p className="text-gray-600 leading-relaxed">
                                            We bridge the gap between global climate funding and frontline facility readiness.
                                            Partner with us.
                                        </p>
                                    </div>

                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        {/* Name Field */}
                                        <div className="space-y-2">
                                            <label htmlFor="name" className="text-sm font-medium text-gray-700 block">
                                                Name
                                            </label>
                                            <input
                                                type="text"
                                                id="name"
                                                required
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#2D7A4A] focus:ring-2 focus:ring-[#2D7A4A]/20 outline-none transition-all bg-gray-50 focus:bg-white"
                                                placeholder="Your full name"
                                            />
                                        </div>

                                        {/* Contact Method Toggle */}
                                        <div className="space-y-3">
                                            <label className="text-sm font-medium text-gray-700 block">
                                                How can we reach you?
                                            </label>
                                            <div className="grid grid-cols-2 gap-4">
                                                <button
                                                    type="button"
                                                    onClick={() => setContactMethod('email')}
                                                    className={cn(
                                                        "px-4 py-3 rounded-xl border text-sm font-medium transition-all text-center",
                                                        contactMethod === 'email'
                                                            ? "border-[#2D7A4A] bg-[#2D7A4A]/5 text-[#2D7A4A]"
                                                            : "border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                                                    )}
                                                >
                                                    Email
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setContactMethod('phone')}
                                                    className={cn(
                                                        "px-4 py-3 rounded-xl border text-sm font-medium transition-all text-center",
                                                        contactMethod === 'phone'
                                                            ? "border-[#2D7A4A] bg-[#2D7A4A]/5 text-[#2D7A4A]"
                                                            : "border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                                                    )}
                                                >
                                                    1:1 Phone Call
                                                </button>
                                            </div>
                                        </div>

                                        {/* Conditional Input */}
                                        {contactMethod && (
                                            <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                                                <input
                                                    type={contactMethod === 'email' ? 'email' : 'tel'}
                                                    required
                                                    value={formData.contact}
                                                    onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#2D7A4A] focus:ring-2 focus:ring-[#2D7A4A]/20 outline-none transition-all bg-gray-50 focus:bg-white"
                                                    placeholder={contactMethod === 'email' ? 'your@email.com' : '+1 (555) 000-0000'}
                                                />
                                            </div>
                                        )}

                                        {/* Pitch Deck Option */}
                                        <div className="pt-2">
                                            <label className="flex items-start gap-3 cursor-pointer group">
                                                <div className="relative flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        className="peer sr-only"
                                                        checked={formData.downloadPitch}
                                                        onChange={(e) => setFormData({ ...formData, downloadPitch: e.target.checked })}
                                                    />
                                                    <div className="w-5 h-5 border-2 border-gray-300 rounded peer-checked:bg-[#2D7A4A] peer-checked:border-[#2D7A4A] transition-all"></div>
                                                    <Check size={12} className="absolute top-1 left-1 text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                                                </div>
                                                <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
                                                    Yes, send me the <span className="font-medium text-[#2D7A4A]">Investment Pitch Deck</span>
                                                </span>
                                            </label>
                                        </div>

                                        {/* Submit Button */}
                                        <Button
                                            type="submit"
                                            disabled={!contactMethod}
                                            className="w-full h-14 text-lg bg-[#2D7A4A] hover:bg-[#25663e] text-white rounded-xl font-bold shadow-lg shadow-[#2D7A4A]/20 hover:shadow-xl hover:shadow-[#2D7A4A]/30 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Connect with Pathways Health
                                        </Button>
                                    </form>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
