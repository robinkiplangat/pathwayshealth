"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Users,
    Droplets,
    Zap,
    Building2,
    ArrowRight,
    Download,
    AlertTriangle,
    CheckCircle2,
    Calendar,
    MapPin
} from "lucide-react";
import Link from "next/link";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { AssessmentReport } from "@/components/AssessmentReport";
import { getAssessmentSession, clearAssessmentSession } from "@/lib/assessment-session";

interface AssessmentSummary {
    id: string;
    date: string;
    facilityName: string;
    location: string;
    overallScore: number;
    pillarScores: Record<string, number>;
    actionPlan: Array<{
        id: string;
        statement: string;
        pillar: string;
        hazard: string;
        priority: string;
    }>;
}

interface DashboardData {
    hasData: boolean;
    assessments: AssessmentSummary[];
}

export default function DashboardPage() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedAssessmentId, setSelectedAssessmentId] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Check for pending session to link
                const session = getAssessmentSession();
                if (session && session.assessmentId) {
                    console.log('Found pending session, linking...', session.assessmentId);
                    await fetch('/api/assessment/save', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            assessmentId: session.assessmentId,
                            facilityName: session.facilityName
                        }),
                    });
                    // Clear session after linking
                    clearAssessmentSession();
                }

                const res = await fetch('/api/dashboard');
                const json = await res.json();
                setData(json);
                if (json.assessments && json.assessments.length > 0) {
                    setSelectedAssessmentId(json.assessments[0].id);
                }
            } catch (e) {
                console.error("Failed to fetch dashboard data", e);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!data || !data.hasData || data.assessments.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 text-center">
                <div className="bg-white p-8 rounded-2xl max-w-md shadow-lg">
                    <h2 className="text-2xl font-bold mb-4 text-gray-900">No Saved Assessments</h2>
                    <p className="text-gray-600 mb-8">Start your first assessment to see your facility's resilience score.</p>
                    <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">
                        <Link href="/assessment">Start Assessment</Link>
                    </Button>
                </div>
            </div>
        );
    }

    const selectedAssessment = data.assessments.find(a => a.id === selectedAssessmentId) || data.assessments[0];

    const getRiskLevel = (score: number) => {
        if (score >= 80) return { label: "High Resilience", color: "text-green-600", bg: "bg-green-100" };
        if (score >= 50) return { label: "Medium Risk", color: "text-yellow-600", bg: "bg-yellow-100" };
        return { label: "High Risk", color: "text-red-600", bg: "bg-red-100" };
    };

    const overallRisk = getRiskLevel(selectedAssessment.overallScore);

    const PILLAR_CONFIG = {
        WORKFORCE: { label: "Workforce Capacity", icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
        WASH: { label: "WASH & Waste", icon: Droplets, color: "text-cyan-600", bg: "bg-cyan-50" },
        ENERGY: { label: "Energy Services", icon: Zap, color: "text-yellow-600", bg: "bg-yellow-50" },
        INFRASTRUCTURE: { label: "Infrastructure", icon: Building2, color: "text-purple-600", bg: "bg-purple-50" },
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans">
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">

                {/* Sidebar: List of Assessments */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-gray-900">Your Reports</h2>
                        <Button size="sm" variant="outline" asChild>
                            <Link href="/assessment">New</Link>
                        </Button>
                    </div>
                    <div className="space-y-3">
                        {data.assessments.map((assessment) => (
                            <div
                                key={assessment.id}
                                onClick={() => setSelectedAssessmentId(assessment.id)}
                                className={`p-4 rounded-xl cursor-pointer transition-all border ${selectedAssessmentId === assessment.id
                                    ? "bg-white border-blue-500 shadow-md"
                                    : "bg-white border-gray-200 hover:border-blue-300"
                                    }`}
                            >
                                <h3 className="font-semibold text-gray-900 truncate">{assessment.facilityName}</h3>
                                <div className="flex items-center text-xs text-gray-500 mt-1 gap-2">
                                    <Calendar size={12} />
                                    <span>{new Date(assessment.date).toLocaleDateString()}</span>
                                </div>
                                <div className="mt-3 flex items-center justify-between">
                                    <Badge variant={assessment.overallScore >= 80 ? "default" : assessment.overallScore >= 50 ? "secondary" : "destructive"}>
                                        Score: {assessment.overallScore}
                                    </Badge>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Main Content: Selected Assessment Details */}
                <div className="lg:col-span-3 space-y-8">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">{selectedAssessment.facilityName}</h1>
                            <div className="flex items-center gap-4 mt-2 text-gray-500">
                                <div className="flex items-center gap-1">
                                    <Calendar size={16} />
                                    <span>{new Date(selectedAssessment.date).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <MapPin size={16} />
                                    <span>{selectedAssessment.location}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            {/* PDF Download */}
                            <PDFDownloadLink
                                document={<AssessmentReport data={selectedAssessment} />}
                                fileName={`pathways-report-${selectedAssessment.facilityName.replace(/\s+/g, '-').toLowerCase()}.pdf`}
                            >
                                {({ blob, url, loading, error }) => (
                                    <Button variant="outline" className="gap-2" disabled={loading}>
                                        <Download size={16} />
                                        {loading ? 'Generating...' : 'Export PDF'}
                                    </Button>
                                )}
                            </PDFDownloadLink>
                        </div>
                    </div>

                    {/* Overview Card */}
                    <Card className="border-none shadow-lg bg-white overflow-hidden relative">
                        <div className={`absolute top-0 left-0 w-2 h-full ${overallRisk.bg.replace('bg-', 'bg-opacity-100 bg-').replace('100', '500')}`}></div>
                        <CardContent className="p-8">
                            <div className="flex flex-col md:flex-row gap-8 items-center">
                                <div className="flex-1">
                                    <h2 className="text-xl font-semibold text-gray-600 mb-2">Overall Resilience Score</h2>
                                    <div className="flex items-baseline gap-4">
                                        <span className="text-6xl font-bold text-gray-900">{selectedAssessment.overallScore}</span>
                                        <span className="text-xl text-gray-400">/ 100</span>
                                    </div>
                                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium mt-4 ${overallRisk.bg} ${overallRisk.color}`}>
                                        {selectedAssessment.overallScore < 50 ? <AlertTriangle size={16} /> : <CheckCircle2 size={16} />}
                                        {overallRisk.label}
                                    </div>
                                </div>
                                <div className="flex-1 w-full max-w-md">
                                    <div className="flex justify-between text-sm mb-2">
                                        <span>Progress to Resilience</span>
                                        <span>{selectedAssessment.overallScore}%</span>
                                    </div>
                                    <Progress value={selectedAssessment.overallScore} className="h-4" />
                                    <p className="text-sm text-gray-500 mt-4">
                                        Your facility is currently at <strong>{overallRisk.label}</strong>. Focus on the priority actions below to improve your score.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Pillars Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {Object.entries(selectedAssessment.pillarScores || {}).map(([key, score]) => {
                            const config = PILLAR_CONFIG[key as keyof typeof PILLAR_CONFIG];
                            const Icon = config.icon;
                            const risk = getRiskLevel(score);

                            return (
                                <Card key={key} className="border-none shadow-md hover:shadow-lg transition-all hover:-translate-y-1 bg-white">
                                    <CardHeader className="pb-2">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${config.bg} ${config.color}`}>
                                            <Icon size={24} />
                                        </div>
                                        <CardTitle className="text-lg font-semibold text-gray-900">{config.label}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex justify-between items-end mb-2">
                                            <span className="text-3xl font-bold">{score}</span>
                                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${risk.bg} ${risk.color}`}>
                                                {risk.label}
                                            </span>
                                        </div>
                                        <Progress value={score} className="h-2 mb-4" />
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>

                    {/* Action Plan Section */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Comprehensive Action Plan</h2>
                                <p className="text-gray-500 mt-1">Recommended steps to improve facility resilience based on your assessment.</p>
                            </div>
                            <Badge variant="outline" className="px-3 py-1">
                                {selectedAssessment.actionPlan?.length || 0} Actions Identified
                            </Badge>
                        </div>

                        {(!selectedAssessment.actionPlan || selectedAssessment.actionPlan.length === 0) ? (
                            <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                <CheckCircle2 className="mx-auto h-12 w-12 text-green-500 mb-4" />
                                <h3 className="text-lg font-medium text-gray-900">No Critical Actions Needed</h3>
                                <p className="text-gray-500 max-w-md mx-auto mt-2">
                                    Your facility appears to be in good standing based on the current assessment criteria. Continue monitoring and maintaining your resilience measures.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {["WORKFORCE", "WASH", "ENERGY", "INFRASTRUCTURE"].map(pillar => {
                                    const pillarActions = selectedAssessment.actionPlan.filter(a => a.pillar === pillar);
                                    if (pillarActions.length === 0) return null;

                                    const config = PILLAR_CONFIG[pillar as keyof typeof PILLAR_CONFIG];
                                    const Icon = config.icon;

                                    return (
                                        <div key={pillar} className="border rounded-xl overflow-hidden">
                                            <div className={`px-6 py-4 flex items-center gap-3 border-b ${config.bg}`}>
                                                <Icon className={`h-5 w-5 ${config.color}`} />
                                                <h3 className={`font-semibold ${config.color}`}>{config.label}</h3>
                                            </div>
                                            <div className="divide-y divide-gray-100">
                                                {pillarActions.map(action => (
                                                    <div key={action.id} className="p-4 md:p-6 flex gap-4 hover:bg-gray-50 transition-colors">
                                                        <div className="mt-1">
                                                            {action.priority === 'MAJOR' || action.priority === 'HIGH' ? (
                                                                <div className="h-2 w-2 rounded-full bg-red-500 mt-2" title="High Priority" />
                                                            ) : (
                                                                <div className="h-2 w-2 rounded-full bg-yellow-500 mt-2" title="Medium Priority" />
                                                            )}
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">{action.hazard}</span>
                                                                <Badge variant={action.priority === 'MAJOR' ? 'destructive' : 'secondary'} className="text-[10px] h-5">
                                                                    {action.priority} PRIORITY
                                                                </Badge>
                                                            </div>
                                                            <p className="text-gray-900 font-medium">{action.statement}</p>
                                                            <p className="text-sm text-gray-500 mt-2">
                                                                <strong>Recommendation:</strong> Implement mitigation strategies for {action.hazard.toLowerCase()} risks affecting {config.label.toLowerCase()}.
                                                                {/* Placeholder for more specific recommendation logic */}
                                                            </p>
                                                        </div>
                                                        <Button variant="ghost" size="sm" className="self-center">
                                                            Details
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
