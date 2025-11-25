"use client";

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Check, Download, ChevronRight, ChevronLeft, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PartnerFormProps {
    className?: string;
    children?: React.ReactNode;
}

const STEPS = [
    { id: 1, title: 'About You', description: 'Tell us about your organization' },
    { id: 2, title: 'Your Focus', description: 'Areas of interest and geography' },
    { id: 3, title: 'Contact Details', description: 'How we can reach you' },
];

export function PartnerForm({ className, children }: PartnerFormProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
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
    const [showExitConfirm, setShowExitConfirm] = useState(false);

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
                link.href = '/api/download-pitch';
                link.target = '_blank';
                link.rel = 'noopener noreferrer';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }

            // Close modal after delay
            setTimeout(() => {
                setIsOpen(false);
                setIsSubmitted(false);
                setCurrentStep(1);
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

    const hasData = () => {
        return formData.organisationName ||
            formData.partnerType ||
            formData.contactPerson ||
            formData.workEmail ||
            formData.geographicFocus.length > 0 ||
            formData.interestAreas.length > 0 ||
            formData.countryRegion ||
            formData.phone ||
            formData.website ||
            formData.referralSource ||
            formData.explorationGoal ||
            formData.downloadPitch;
    };

    const canProceed = () => {
        if (currentStep === 1) {
            return formData.organisationName && formData.partnerType;
        }
        if (currentStep === 2) {
            return true; // Optional fields
        }
        if (currentStep === 3) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return formData.contactPerson && formData.workEmail && emailRegex.test(formData.workEmail);
        }
        return false;
    };

    const nextStep = () => {
        if (canProceed() && currentStep < 3) {
            setCurrentStep(currentStep + 1);
        }
    };

    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleClose = () => {
        if (hasData() && !isSubmitted) {
            setShowExitConfirm(true);
        } else {
            setIsOpen(false);
            setCurrentStep(1);
        }
    };

    const confirmExit = () => {
        setShowExitConfirm(false);
        setIsOpen(false);
        setCurrentStep(1);
    };

    const [mounted, setMounted] = React.useState(false);
    React.useEffect(() => {
        setMounted(true);
    }, []);

    const modalContent = (
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto"
            onClick={(e) => {
                // Only trigger if clicking the backdrop directly
                if (e.target === e.currentTarget && !isSubmitted) {
                    handleClose();
                }
            }}
        >
            <div
                className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden relative animate-in zoom-in-95 duration-200 my-8"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100 z-10"
                    aria-label="Close form"
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
                                <h2 className="text-3xl font-bold text-gray-900 mb-3">Partner with Pathways</h2>
                                <p className="text-gray-600 leading-relaxed">
                                    Join us in building climate resilience for healthcare facilities globally.
                                </p>
                            </div>

                            {/* Progress Indicator */}
                            <div className="mb-8">
                                <div className="flex items-center justify-between mb-2">
                                    {STEPS.map((step, index) => (
                                        <React.Fragment key={step.id}>
                                            <div className="flex flex-col items-center flex-1">
                                                <div
                                                    className={cn(
                                                        "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all",
                                                        currentStep > step.id
                                                            ? "bg-[#2D7A4A] text-white"
                                                            : currentStep === step.id
                                                                ? "bg-[#2D7A4A] text-white ring-4 ring-[#2D7A4A]/20"
                                                                : "bg-gray-200 text-gray-500"
                                                    )}
                                                >
                                                    {currentStep > step.id ? <Check size={20} /> : step.id}
                                                </div>
                                                <div className="mt-2 text-center">
                                                    <div className={cn(
                                                        "text-xs font-medium",
                                                        currentStep >= step.id ? "text-gray-900" : "text-gray-400"
                                                    )}>
                                                        {step.title}
                                                    </div>
                                                </div>
                                            </div>
                                            {index < STEPS.length - 1 && (
                                                <div
                                                    className={cn(
                                                        "h-1 flex-1 mx-2 rounded transition-all",
                                                        currentStep > step.id ? "bg-[#2D7A4A]" : "bg-gray-200"
                                                    )}
                                                    style={{ maxWidth: '60px', marginTop: '-24px' }}
                                                />
                                            )}
                                        </React.Fragment>
                                    ))}
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Step 1: Organisation Details */}
                                {currentStep === 1 && (
                                    <div className="space-y-4 animate-in fade-in slide-in-from-right-5 duration-300">
                                        <h3 className="text-xl font-semibold text-gray-900 pb-2 border-b">About Your Organization</h3>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700">Organisation Name *</label>
                                            <input
                                                required
                                                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#2D7A4A] focus:ring-2 focus:ring-[#2D7A4A]/20 outline-none transition-all"
                                                value={formData.organisationName}
                                                onChange={e => setFormData({ ...formData, organisationName: e.target.value })}
                                                placeholder="e.g., Global Health Initiative"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700">Partner Type *</label>
                                            <p className="text-xs text-gray-500">Choose the option that best describes your organisation.</p>
                                            <select
                                                required
                                                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#2D7A4A] focus:ring-2 focus:ring-[#2D7A4A]/20 outline-none bg-white transition-all"
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

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700">Website</label>
                                            <input
                                                type="url"
                                                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#2D7A4A] focus:ring-2 focus:ring-[#2D7A4A]/20 outline-none transition-all"
                                                placeholder="https://"
                                                value={formData.website}
                                                onChange={e => setFormData({ ...formData, website: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Step 2: Focus & Interests */}
                                {currentStep === 2 && (
                                    <div className="space-y-4 animate-in fade-in slide-in-from-right-5 duration-300">
                                        <h3 className="text-xl font-semibold text-gray-900 pb-2 border-b">Your Focus & Interests</h3>

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
                                                            "px-4 py-2 rounded-full text-sm border transition-all",
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
                                                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#2D7A4A] focus:ring-2 focus:ring-[#2D7A4A]/20 outline-none transition-all"
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
                                                            "px-4 py-2 rounded-full text-sm border transition-all",
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

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700">What would you like to explore with us?</label>
                                            <p className="text-xs text-gray-500">Briefly describe how you see Pathways Health fitting into your work.</p>
                                            <textarea
                                                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#2D7A4A] focus:ring-2 focus:ring-[#2D7A4A]/20 outline-none min-h-[100px] transition-all"
                                                value={formData.explorationGoal}
                                                onChange={e => setFormData({ ...formData, explorationGoal: e.target.value })}
                                                placeholder="Tell us about your goals..."
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Step 3: Contact Details */}
                                {currentStep === 3 && (
                                    <div className="space-y-4 animate-in fade-in slide-in-from-right-5 duration-300">
                                        <h3 className="text-xl font-semibold text-gray-900 pb-2 border-b">Contact Information</h3>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700">Contact Person *</label>
                                            <input
                                                required
                                                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#2D7A4A] focus:ring-2 focus:ring-[#2D7A4A]/20 outline-none transition-all"
                                                value={formData.contactPerson}
                                                onChange={e => setFormData({ ...formData, contactPerson: e.target.value })}
                                                placeholder="Your full name"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700">Work Email *</label>
                                            <input
                                                type="email"
                                                required
                                                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#2D7A4A] focus:ring-2 focus:ring-[#2D7A4A]/20 outline-none transition-all"
                                                value={formData.workEmail}
                                                onChange={e => setFormData({ ...formData, workEmail: e.target.value })}
                                                placeholder="your.email@organization.com"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700">WhatsApp / Phone</label>
                                            <input
                                                type="tel"
                                                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#2D7A4A] focus:ring-2 focus:ring-[#2D7A4A]/20 outline-none transition-all"
                                                value={formData.phone}
                                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                                placeholder="+1 234 567 8900"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700">How did you hear about us?</label>
                                            <input
                                                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#2D7A4A] focus:ring-2 focus:ring-[#2D7A4A]/20 outline-none transition-all"
                                                value={formData.referralSource}
                                                onChange={e => setFormData({ ...formData, referralSource: e.target.value })}
                                                placeholder="Referral, social media, conference, etc."
                                            />
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
                                    </div>
                                )}

                                {/* Navigation Buttons */}
                                <div className="flex items-center justify-between gap-4 pt-4 border-t">
                                    <Button
                                        type="button"
                                        onClick={prevStep}
                                        disabled={currentStep === 1}
                                        variant="outline"
                                        className="flex items-center gap-2 disabled:opacity-50"
                                    >
                                        <ChevronLeft size={20} />
                                        Back
                                    </Button>

                                    {currentStep < 3 ? (
                                        <Button
                                            type="button"
                                            onClick={nextStep}
                                            disabled={!canProceed()}
                                            className="flex items-center gap-2 bg-[#2D7A4A] hover:bg-[#25663e] text-white disabled:opacity-50"
                                        >
                                            Continue
                                            <ChevronRight size={20} />
                                        </Button>
                                    ) : (
                                        <Button
                                            type="submit"
                                            disabled={isSubmitting || !canProceed()}
                                            className="bg-[#2D7A4A] hover:bg-[#25663e] text-white font-bold px-8 disabled:opacity-50"
                                        >
                                            {isSubmitting ? 'Submitting...' : 'Submit Inquiry'}
                                        </Button>
                                    )}
                                </div>
                            </form>
                        </>
                    )}
                </div>
            </div>

            {/* Custom Exit Confirmation Modal */}
            {showExitConfirm && (
                <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 animate-in zoom-in-95 duration-200">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <AlertTriangle size={32} />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">Exit Form?</h3>
                            <p className="text-gray-600 mb-6">
                                You have unsaved changes. Are you sure you want to exit? Your progress will be lost.
                            </p>
                            <div className="flex gap-3">
                                <Button
                                    onClick={() => setShowExitConfirm(false)}
                                    variant="outline"
                                    className="flex-1"
                                >
                                    Continue Editing
                                </Button>
                                <Button
                                    onClick={confirmExit}
                                    className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                                >
                                    Exit Anyway
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
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
