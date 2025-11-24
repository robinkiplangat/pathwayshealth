'use client';

import { useState } from 'react';
import { Download, Save, Share2, X, Check, Copy, Link as LinkIcon } from 'lucide-react';
import AuthGate from './AuthGate';
import { saveAssessmentSession } from '@/lib/assessment-session';
import { useAuth } from '@clerk/nextjs';
import { trackEvent } from '@/lib/analytics';
import { pdf } from '@react-pdf/renderer';
import { AssessmentReport } from '@/components/AssessmentReport';

interface ReportPreviewProps {
    assessmentId: string;
    facilityName: string;
    location: string;
    score: number;
    responses: Array<{
        questionId: string;
        answer: string;
        score: number;
    }>;
}

export default function ReportPreview({
    assessmentId,
    facilityName: initialFacilityName,
    location,
    score,
    responses,
}: ReportPreviewProps) {
    const { isSignedIn } = useAuth();
    const [isSaving, setIsSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [showSaveModal, setShowSaveModal] = useState(false);
    const [facilityName, setFacilityName] = useState(initialFacilityName === 'My Facility' ? '' : initialFacilityName);

    // Share state
    const [isSharing, setIsSharing] = useState(false);
    const [shareUrl, setShareUrl] = useState<string | null>(null);
    const [showShareModal, setShowShareModal] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleSaveClick = () => {
        if (saved) return;
        setShowSaveModal(true);
    };

    const handleConfirmSave = async () => {
        setIsSaving(true);
        const nameToSave = facilityName || "My Facility";

        console.log('Saving assessment session:', { assessmentId, facilityName: nameToSave });

        // Update session storage first (persists across auth redirects)
        saveAssessmentSession({
            assessmentId,
            facilityName: nameToSave,
            location,
            responses
        });

        if (isSignedIn) {
            // If already signed in, save directly
            try {
                const response = await fetch('/api/assessment/save', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        assessmentId,
                        facilityName: nameToSave
                    }),
                });

                if (response.ok) {
                    setSaved(true);
                    setShowSaveModal(false);
                    trackEvent('save_assessment', { facility_name: nameToSave });
                } else {
                    console.error('Failed to save assessment');
                }
            } catch (error) {
                console.error('Error saving assessment:', error);
            } finally {
                setIsSaving(false);
            }
        } else {
            // If not signed in, the AuthGate wrapping the button will handle the sign-in flow.
            // But wait, we are inside the modal now. We need a button that triggers sign-in.
            // We'll handle this in the render.
            setIsSaving(false);
        }
    };

    const getReportData = () => {
        // Construct data object for AssessmentReport
        // We need to reconstruct the structure expected by AssessmentReport
        // For MVP, we'll do a best-effort mapping or fetch full data if needed.
        // However, AssessmentReport expects a specific structure. 
        // Let's assume we can pass the props we have + some defaults.

        // We need to calculate pillar scores if not provided. 
        // Since we only have raw responses here, we might need to rely on the server or do a quick calc.
        // For now, let's use the overall score and placeholder pillar scores if not available.

        return {
            id: assessmentId,
            date: new Date().toISOString(),
            facilityName: facilityName || initialFacilityName,
            location: location,
            overallScore: score,
            pillarScores: {}, // TODO: Calculate or pass these in
            actionPlan: [] // TODO: Calculate or pass these in
        };
    };

    const handleDownload = async () => {
        try {
            const data = getReportData();
            const blob = await pdf(<AssessmentReport data={data as any} />).toBlob();
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `pathways-report-${(facilityName || initialFacilityName).replace(/\s+/g, '-').toLowerCase()}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            trackEvent('download_report_pdf', { assessment_id: assessmentId });
        } catch (error) {
            console.error('Error generating PDF:', error);
        }
    };

    const handleShare = async () => {
        setIsSharing(true);
        try {
            const data = getReportData();
            const blob = await pdf(<AssessmentReport data={data as any} />).toBlob();
            const file = new File([blob], 'report.pdf', { type: 'application/pdf' });

            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch('/api/reports/upload', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                const { url } = await response.json();
                setShareUrl(url);
                setShowShareModal(true);
                trackEvent('share_report', { assessment_id: assessmentId });
            } else {
                console.error('Failed to upload report');
            }
        } catch (error) {
            console.error('Error sharing report:', error);
        } finally {
            setIsSharing(false);
        }
    };

    const copyToClipboard = () => {
        if (shareUrl) {
            navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div className="mx-auto max-w-4xl space-y-6 p-6">
            {/* Header */}
            <div className="rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 p-8 text-white shadow-xl">
                <h1 className="text-3xl font-bold">Assessment Report</h1>
                <p className="mt-2 text-blue-100">{facilityName || initialFacilityName}</p>
                <p className="text-sm text-blue-200">{location}</p>
            </div>

            {/* Score Summary */}
            <div className="rounded-xl bg-white p-6 shadow-lg">
                <h2 className="text-xl font-semibold text-gray-900">Overall Score</h2>
                <div className="mt-4 flex items-center justify-center">
                    <div className="text-center">
                        <div className="text-6xl font-bold text-blue-600">{score}</div>
                        <p className="mt-2 text-gray-600">out of 100</p>
                    </div>
                </div>
            </div>

            {/* Responses Summary */}
            <div className="rounded-xl bg-white p-6 shadow-lg">
                <h2 className="text-xl font-semibold text-gray-900">Responses</h2>
                <p className="mt-2 text-gray-600">
                    You answered {responses.length} questions
                </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4">
                <button
                    onClick={handleSaveClick}
                    disabled={isSaving || saved}
                    className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:bg-blue-700 disabled:opacity-50"
                >
                    <Save className="h-5 w-5" />
                    {saved ? 'Saved!' : isSaving ? 'Saving...' : 'Save Report'}
                </button>

                <AuthGate
                    modalTitle="Sign in to download your report"
                    modalMessage="Create a free account to download your assessment report as a PDF."
                >
                    <button
                        onClick={handleDownload}
                        className="flex items-center gap-2 rounded-lg border-2 border-blue-600 bg-white px-6 py-3 font-semibold text-blue-600 shadow-lg transition-all hover:bg-blue-50"
                    >
                        <Download className="h-5 w-5" />
                        Download PDF
                    </button>
                </AuthGate>

                <button
                    onClick={handleShare}
                    disabled={isSharing}
                    className="flex items-center gap-2 rounded-lg border-2 border-gray-300 bg-white px-6 py-3 font-semibold text-gray-700 shadow-lg transition-all hover:bg-gray-50 disabled:opacity-50"
                >
                    <Share2 className="h-5 w-5" />
                    {isSharing ? 'Generating Link...' : 'Share'}
                </button>
            </div>

            {/* Save Modal */}
            {showSaveModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="relative w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
                        <button
                            onClick={() => setShowSaveModal(false)}
                            className="absolute right-4 top-4 rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                        >
                            <X className="h-5 w-5" />
                        </button>

                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Save Your Report</h2>
                        <p className="text-gray-600 mb-6">Enter your facility name to identify this report later.</p>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Facility Name</label>
                                <input
                                    type="text"
                                    value={facilityName}
                                    onChange={(e) => setFacilityName(e.target.value)}
                                    placeholder="e.g., General Hospital Main Building"
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                                />
                            </div>

                            {isSignedIn ? (
                                <button
                                    onClick={handleConfirmSave}
                                    disabled={isSaving}
                                    className="w-full rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {isSaving ? 'Saving...' : 'Save Report'}
                                </button>
                            ) : (
                                <AuthGate
                                    modalTitle="Sign in to save"
                                    modalMessage="Create a free account to save your report securely."
                                >
                                    <button
                                        onClick={handleConfirmSave}
                                        className="w-full rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:bg-blue-700"
                                    >
                                        Sign In & Save
                                    </button>
                                </AuthGate>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Share Modal */}
            {showShareModal && shareUrl && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="relative w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
                        <button
                            onClick={() => setShowShareModal(false)}
                            className="absolute right-4 top-4 rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                        >
                            <X className="h-5 w-5" />
                        </button>

                        <div className="flex flex-col items-center text-center mb-6">
                            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mb-4 text-green-600">
                                <LinkIcon className="h-6 w-6" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900">Share Report</h2>
                            <p className="mt-2 text-gray-600">Anyone with this link can view your assessment report.</p>
                        </div>

                        <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3 mb-6">
                            <input
                                type="text"
                                readOnly
                                value={shareUrl}
                                className="flex-1 bg-transparent text-sm text-gray-600 outline-none"
                            />
                            <button
                                onClick={copyToClipboard}
                                className="p-2 hover:bg-white rounded-md transition-colors text-gray-500 hover:text-blue-600"
                            >
                                {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                            </button>
                        </div>

                        <button
                            onClick={() => setShowShareModal(false)}
                            className="w-full rounded-lg bg-gray-900 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:bg-gray-800"
                        >
                            Done
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
