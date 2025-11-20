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
    CheckCircle2
} from "lucide-react";
import Link from "next/link";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { AssessmentReport } from "@/components/AssessmentReport";

interface DashboardData {
    hasData: boolean;
    date?: string;
    facilityName?: string;
    overallScore?: number;
    pillarScores?: Record<string, number>;
}

export default function DashboardPage() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch('/api/dashboard');
                const json = await res.json();
                setData(json);
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
            <div className="min-h-screen flex items-center justify-center bg-bg-primary">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-resilience-green"></div>
            </div>
        );
    }

    if (!data || !data.hasData) {
        return (
            <div className="min-h-screen bg-bg-primary flex flex-col items-center justify-center p-4 text-center">
                <div className="bg-bg-secondary p-8 rounded-2xl max-w-md">
                    <h2 className="text-2xl font-bold mb-4 text-foreground">No Assessment Found</h2>
                    <p className="text-storm-gray mb-8">Start your first assessment to see your facility's resilience score.</p>
                    <Button asChild size="lg" className="bg-resilience-green hover:bg-resilience-green/90">
                        <Link href="/assessment">Start Assessment</Link>
                    </Button>
                </div>
            </div>
        );
    }

    const getRiskLevel = (score: number) => {
        if (score >= 80) return { label: "High Resilience", color: "text-green-600", bg: "bg-green-100" };
        if (score >= 50) return { label: "Medium Risk", color: "text-yellow-600", bg: "bg-yellow-100" };
        return { label: "High Risk", color: "text-red-600", bg: "bg-red-100" };
    };

    const overallRisk = getRiskLevel(data.overallScore || 0);

    const PILLAR_CONFIG = {
        WORKFORCE: { label: "Workforce Capacity", icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
        WASH: { label: "WASH & Waste", icon: Droplets, color: "text-cyan-600", bg: "bg-cyan-50" },
        ENERGY: { label: "Energy Services", icon: Zap, color: "text-yellow-600", bg: "bg-yellow-50" },
        INFRASTRUCTURE: { label: "Infrastructure", icon: Building2, color: "text-purple-600", bg: "bg-purple-50" },
    };

    return (
        <div className="min-h-screen bg-bg-secondary p-4 md:p-8 font-sans">
            <div className="max-w-6xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">{data.facilityName}</h1>
                        <p className="text-storm-gray">Last assessed: {new Date(data.date!).toLocaleDateString()}</p>
                    </div>
                    <div className="flex gap-3">
                        {data && (
                            <PDFDownloadLink
                                document={<AssessmentReport data={data} />}
                                fileName={`PathwaysHealth_Report_${new Date().toISOString().split('T')[0]}.pdf`}
                            >
                                {({ blob, url, loading, error }: any) => (
                                    <Button variant="outline" className="gap-2" disabled={loading}>
                                        <Download size={16} /> {loading ? 'Generating...' : 'Export Report'}
                                    </Button>
                                )}
                            </PDFDownloadLink>
                        )}
                        <Button className="bg-resilience-green hover:bg-resilience-green/90 gap-2" asChild>
                            <Link href="/assessment">New Assessment</Link>
                        </Button>
                    </div>
                </div>

                {/* Overview Card */}
                <Card className="border-none shadow-lg bg-white overflow-hidden relative">
                    <div className="absolute top-0 left-0 w-2 h-full bg-resilience-green"></div>
                    <CardContent className="p-8">
                        <div className="flex flex-col md:flex-row gap-8 items-center">
                            <div className="flex-1">
                                <h2 className="text-xl font-semibold text-storm-gray mb-2">Overall Resilience Score</h2>
                                <div className="flex items-baseline gap-4">
                                    <span className="text-6xl font-bold text-foreground">{data.overallScore}</span>
                                    <span className="text-xl text-muted-foreground">/ 100</span>
                                </div>
                                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium mt-4 ${overallRisk.bg} ${overallRisk.color}`}>
                                    {data.overallScore! < 50 ? <AlertTriangle size={16} /> : <CheckCircle2 size={16} />}
                                    {overallRisk.label}
                                </div>
                            </div>
                            <div className="flex-1 w-full max-w-md">
                                <div className="flex justify-between text-sm mb-2">
                                    <span>Progress to Resilience</span>
                                    <span>{data.overallScore}%</span>
                                </div>
                                <Progress value={data.overallScore} className="h-4" />
                                <p className="text-sm text-storm-gray mt-4">
                                    Your facility is currently at <strong>{overallRisk.label}</strong>. Focus on the priority actions below to improve your score.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Pillars Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {Object.entries(data.pillarScores || {}).map(([key, score]) => {
                        const config = PILLAR_CONFIG[key as keyof typeof PILLAR_CONFIG];
                        const Icon = config.icon;
                        const risk = getRiskLevel(score);

                        return (
                            <Card key={key} className="border-none shadow-md hover:shadow-lg transition-all hover:-translate-y-1 bg-white">
                                <CardHeader className="pb-2">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${config.bg} ${config.color}`}>
                                        <Icon size={24} />
                                    </div>
                                    <CardTitle className="text-lg font-semibold text-foreground">{config.label}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex justify-between items-end mb-2">
                                        <span className="text-3xl font-bold">{score}</span>
                                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${risk.bg} ${risk.color}`}>
                                            {risk.label}
                                        </span>
                                    </div>
                                    <Progress value={score} className="h-2 mb-4" />
                                    <Button variant="ghost" className="w-full justify-between text-sm text-storm-gray hover:text-resilience-green p-0 h-auto">
                                        View Details <ArrowRight size={16} />
                                    </Button>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {/* Priority Actions (Placeholder for now) */}
                <Card className="border-none shadow-md bg-white">
                    <CardHeader>
                        <CardTitle>Priority Actions</CardTitle>
                        <CardDescription>Recommended steps based on your lowest scores.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex items-start gap-4 p-4 rounded-lg bg-bg-secondary border border-border/50">
                                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-resilience-green font-bold shadow-sm shrink-0">
                                        {i}
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-foreground">Conduct a detailed flood risk assessment</h4>
                                        <p className="text-sm text-storm-gray mt-1">Infrastructure • High Impact • Low Cost</p>
                                    </div>
                                    <Button variant="outline" size="sm" className="ml-auto shrink-0">Add to Plan</Button>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

            </div>
        </div>
    );
}
