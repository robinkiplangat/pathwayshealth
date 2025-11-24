"use client";

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Check, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PartnerFormProps {
    className?: string;
    children?: React.ReactNode;
}

export function PartnerForm({ className, children }: PartnerFormProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [formData, setFormData] = useState({
        organisationName: '',
        partnerType: '',
        geographicFocus: [] as string[],
        countryRegion: '',
        interestAreas: [] as string[],
        contactPerson: '',
        workEmail: '',
        phone: '',
        website: '',
        referralSource: '',
        explorationGoal: '',
        downloadPitch: false
    });
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const response = await fetch('/api/partner', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error('Failed to submit');
            }

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
                setFormData({
                    organisationName: '',
                    partnerType: '',
                    geographicFocus: [],
                    countryRegion: '',
                    interestAreas: [],
                    contactPerson: '',
                    workEmail: '',
                    phone: '',
                    website: '',
                    referralSource: '',
                    explorationGoal: '',
                    downloadPitch: false
                });
            }, 3000);
        } catch (error) {
            console.error('Submission error:', error);
            alert('Something went wrong. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleMultiSelect = (field: 'geographicFocus' | 'interestAreas', value: string) => {
        setFormData(prev => {
            const current = prev[field];
            const updated = current.includes(value)
                ? current.filter(item => item !== value)
                : [...current, value];
            return { ...prev, [field]: updated };
        });
    };

    const [mounted, setMounted] = React.useState(false);
    React.useEffect(() => {
        setMounted(true);
    }, []);

    const modalContent = (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
            <div
                className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden relative animate-in zoom-in-95 duration-200 my-8"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    onClick={() => setIsOpen(false)}
                    className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100 z-10"
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
                            <div className="mb-8">
                                <h2 className="text-3xl font-bold text-gray-900 mb-3">Partner with Pathways</h2>
                                <p className="text-gray-600 leading-relaxed">
                                    Join us in building climate resilience for healthcare facilities globally.
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Organisation Details */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Organisation</h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700">Organisation Name *</label>
                                            <input
                                                required
                                                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-[#2D7A4A] focus:ring-2 focus:ring-[#2D7A4A]/20 outline-none"
                                                value={formData.organisationName}
                                                onChange={e => setFormData({ ...formData, organisationName: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700">Website</label>
                                            <input
                                                type="url"
                                                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-[#2D7A4A] focus:ring-2 focus:ring-[#2D7A4A]/20 outline-none"
                                                placeholder="https://"
                                                value={formData.website}
                                                onChange={e => setFormData({ ...formData, website: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">Partner Type *</label>
                                        <p className="text-xs text-gray-500">Choose the option that best describes your organisation.</p>
                                        <select
                                            required
                                            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-[#2D7A4A] focus:ring-2 focus:ring-[#2D7A4A]/20 outline-none bg-white"
                                            value={formData.partnerType}
                                            onChange={e => setFormData({ ...formData, partnerType: e.target.value })}
                                        >
                                            <option value="">Select type...</option>
                                            <option value="Funder / Donor">Funder / Donor</option>
                                            <option value="Implementing Partner">Implementing Partner (NGO/Technical)</option>
                                            <option value="Government">Government / Public Sector</option>
                                            <option value="Healthcare Facility">Healthcare Facility / Network</option>
                                            <option value="Private Sector">Private Sector</option>
                                            <option value="Academic / Research">Academic / Research</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Focus & Interests */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Focus & Interests</h3>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">Geographic Focus</label>
                                        <p className="text-xs text-gray-500">Where do you primarily operate or invest?</p>
                                        <div className="flex flex-wrap gap-2">
                                            {['Global', 'Africa', 'Asia', 'Latin America', 'Europe', 'North America'].map(region => (
                                                <button
                                                    key={region}
                                                    type="button"
                                                    onClick={() => handleMultiSelect('geographicFocus', region)}
                                                    className={cn(
                                                        "px-3 py-1 rounded-full text-sm border transition-all",
                                                        formData.geographicFocus.includes(region)
                                                            ? "bg-[#2D7A4A] text-white border-[#2D7A4A]"
                                                            : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                                                    )}
                                                >
                                                    {region}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">Country / Region Details</label>
                                        <input
                                            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-[#2D7A4A] focus:ring-2 focus:ring-[#2D7A4A]/20 outline-none"
                                            placeholder="Specific countries or regions..."
                                            value={formData.countryRegion}
                                            onChange={e => setFormData({ ...formData, countryRegion: e.target.value })}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">Interest Areas</label>
                                        <p className="text-xs text-gray-500">What kind of collaboration are you most interested in?</p>
                                        <div className="flex flex-wrap gap-2">
                                            {['Funding / Investment', 'Implementation / Deployment', 'Data & Analytics', 'Policy & Advocacy', 'Technology Integration'].map(area => (
                                                <button
                                                    key={area}
                                                    type="button"
                                                    onClick={() => handleMultiSelect('interestAreas', area)}
                                                    className={cn(
                                                        "px-3 py-1 rounded-full text-sm border transition-all",
                                                        formData.interestAreas.includes(area)
                                                            ? "bg-[#2D7A4A] text-white border-[#2D7A4A]"
                                                            : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                                                    )}
                                                >
                                                    {area}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Contact Details */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Contact</h3>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">Contact Person *</label>
                                        <input
                                            required
                                            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-[#2D7A4A] focus:ring-2 focus:ring-[#2D7A4A]/20 outline-none"
                                            value={formData.contactPerson}
                                            onChange={e => setFormData({ ...formData, contactPerson: e.target.value })}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700">Work Email *</label>
                                            <input
                                                type="email"
                                                required
                                                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-[#2D7A4A] focus:ring-2 focus:ring-[#2D7A4A]/20 outline-none"
                                                value={formData.workEmail}
                                                onChange={e => setFormData({ ...formData, workEmail: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700">WhatsApp / Phone</label>
                                            <input
                                                type="tel"
                                                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-[#2D7A4A] focus:ring-2 focus:ring-[#2D7A4A]/20 outline-none"
                                                value={formData.phone}
                                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Additional Info */}
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">What would you like to explore with us?</label>
                                        <p className="text-xs text-gray-500">Briefly describe how you see Pathways Health fitting into your work.</p>
                                        <textarea
                                            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-[#2D7A4A] focus:ring-2 focus:ring-[#2D7A4A]/20 outline-none min-h-[80px]"
                                            value={formData.explorationGoal}
                                            onChange={e => setFormData({ ...formData, explorationGoal: e.target.value })}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">How did you hear about Pathways Health?</label>
                                        <input
                                            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-[#2D7A4A] focus:ring-2 focus:ring-[#2D7A4A]/20 outline-none"
                                            value={formData.referralSource}
                                            onChange={e => setFormData({ ...formData, referralSource: e.target.value })}
                                        />
                                    </div>
                                </div>

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
                                    disabled={isSubmitting}
                                    className="w-full h-14 text-lg bg-[#2D7A4A] hover:bg-[#25663e] text-white rounded-xl font-bold shadow-lg shadow-[#2D7A4A]/20 hover:shadow-xl hover:shadow-[#2D7A4A]/30 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? 'Submitting...' : 'Submit Inquiry'}
                                </Button>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </div>
    );

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

            {isOpen && mounted && typeof document !== 'undefined' && createPortal(modalContent, document.body)}
        </>
    );
}
