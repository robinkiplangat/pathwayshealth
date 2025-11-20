"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    Waves,
    CloudLightning,
    ArrowUpFromLine,
    Sun,
    ThermometerSun,
    Flame,
    Snowflake,
    CheckCircle2,
    ArrowRight,
    ChevronLeft,
    ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const HAZARDS = [
    { id: "FLOOD", label: "Floods", icon: Waves, color: "text-blue-500", bg: "bg-blue-50" },
    { id: "STORM", label: "Storms", icon: CloudLightning, color: "text-yellow-600", bg: "bg-yellow-50" },
    { id: "SEA_LEVEL_RISE", label: "Sea Level Rise", icon: ArrowUpFromLine, color: "text-cyan-500", bg: "bg-cyan-50" },
    { id: "DROUGHT", label: "Drought", icon: Sun, color: "text-orange-500", bg: "bg-orange-50" },
    { id: "HEATWAVE", label: "Heatwave", icon: ThermometerSun, color: "text-red-500", bg: "bg-red-50" },
    { id: "WILDFIRE", label: "Wildfire", icon: Flame, color: "text-red-600", bg: "bg-red-50" },
    { id: "COLD_WAVE", label: "Cold Wave", icon: Snowflake, color: "text-blue-300", bg: "bg-blue-50" },
];

const PILLARS = ["WORKFORCE", "WASH", "ENERGY", "INFRASTRUCTURE"];

export default function AssessmentPage() {
    const router = useRouter();
    const [step, setStep] = useState<"hazards" | "questions" | "complete">("hazards");
    const [selectedHazards, setSelectedHazards] = useState<string[]>([]);
    const [questions, setQuestions] = useState<any[]>([]);
    const [currentHazardIndex, setCurrentHazardIndex] = useState(0);
    const [currentPillarIndex, setCurrentPillarIndex] = useState(0);
    const [responses, setResponses] = useState<Record<string, number>>({});
    const [loading, setLoading] = useState(false);

    const toggleHazard = (id: string) => {
        setSelectedHazards(prev =>
            prev.includes(id) ? prev.filter(h => h !== id) : [...prev, id]
        );
    };

    const startAssessment = async () => {
        if (selectedHazards.length === 0) return;
        setLoading(true);
        try {
            // Fetch questions for all selected hazards
            // In a real app, we might fetch per hazard or batch
            // For MVP, we'll fetch all and filter client-side or fetch sequentially
            // Let's fetch all for simplicity
            const res = await fetch('/api/questions');
            const allQuestions = await res.json();
            // Filter by selected hazards
            const filtered = allQuestions.filter((q: any) => selectedHazards.includes(q.hazard));
            setQuestions(filtered);
            setStep("questions");
        } catch (e) {
            console.error("Failed to fetch questions", e);
        } finally {
            setLoading(false);
        }
    };

    const handleResponse = (questionId: string, score: number) => {
        setResponses(prev => ({ ...prev, [questionId]: score }));
    };

    const nextSection = () => {
        // Logic to move to next pillar or next hazard
        if (currentPillarIndex < PILLARS.length - 1) {
            setCurrentPillarIndex(prev => prev + 1);
            window.scrollTo(0, 0);
        } else if (currentHazardIndex < selectedHazards.length - 1) {
            setCurrentHazardIndex(prev => prev + 1);
            setCurrentPillarIndex(0);
            window.scrollTo(0, 0);
        } else {
            submitAssessment();
        }
    };

    const submitAssessment = async () => {
        setLoading(true);
        try {
            const formattedResponses = Object.entries(responses).map(([questionId, score]) => ({
                questionId,
                score
            }));

            await fetch('/api/assessment/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    responses: formattedResponses,
                    facilityName: "My Facility", // Placeholder
                    location: "Unknown" // Placeholder
                })
            });
            setStep("complete");
        } catch (e) {
            console.error("Failed to submit", e);
        } finally {
            setLoading(false);
        }
    };

    // Get current questions
    const currentHazard = selectedHazards[currentHazardIndex];
    const currentPillar = PILLARS[currentPillarIndex];
    const currentQuestions = questions.filter(
        q => q.hazard === currentHazard && q.pillar === currentPillar
    );

    // Calculate progress
    const totalSections = selectedHazards.length * PILLARS.length;
    const completedSections = (currentHazardIndex * PILLARS.length) + currentPillarIndex;
    const progress = (completedSections / totalSections) * 100;

    if (step === "hazards") {
        return (
            <div className="min-h-screen bg-bg-secondary py-12 px-4">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-12">
                        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Select Your Hazards</h1>
                        <p className="text-storm-gray text-lg">Which climate risks are most relevant to your facility?</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-12">
                        {HAZARDS.map((hazard) => {
                            const Icon = hazard.icon;
                            const isSelected = selectedHazards.includes(hazard.id);
                            return (
                                <Card
                                    key={hazard.id}
                                    className={cn(
                                        "cursor-pointer transition-all duration-200 hover:shadow-md border-2",
                                        isSelected ? "border-resilience-green bg-resilience-green/5" : "border-transparent hover:border-resilience-green/30"
                                    )}
                                    onClick={() => toggleHazard(hazard.id)}
                                >
                                    <CardContent className="p-6 flex flex-col items-center text-center">
                                        <div className={cn("w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-colors", isSelected ? "bg-resilience-green text-white" : `${hazard.bg} ${hazard.color}`)}>
                                            <Icon size={32} />
                                        </div>
                                        <h3 className="font-semibold text-lg">{hazard.label}</h3>
                                        {isSelected && <div className="absolute top-3 right-3 text-resilience-green"><CheckCircle2 size={20} /></div>}
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>

                    {/* Sticky Footer for Action */}
                    <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-50">
                        <div className="max-w-4xl mx-auto flex items-center justify-between">
                            <div className="text-sm font-medium text-storm-gray hidden sm:block">
                                {selectedHazards.length} hazard{selectedHazards.length !== 1 ? 's' : ''} selected
                            </div>
                            <Button
                                size="lg"
                                onClick={startAssessment}
                                disabled={selectedHazards.length === 0 || loading}
                                className="w-full sm:w-auto px-8 text-lg h-12 shadow-lg shadow-resilience-green/20"
                            >
                                {loading ? "Loading..." : "Continue to Assessment"} <ArrowRight className="ml-2" />
                            </Button>
                        </div>
                    </div>

                    {/* Spacer for sticky footer */}
                    <div className="h-24"></div>
                </div>
            </div>
        );
    }

    if (step === "questions") {
        const HazardIcon = HAZARDS.find(h => h.id === currentHazard)?.icon || Waves;

        return (
            <div className="min-h-screen bg-bg-primary pb-20">
                {/* Header */}
                <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
                    <div className="container mx-auto px-4 py-4">
                        <div className="flex justify-between items-center mb-2">
                            <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-sm font-medium px-3 py-1">
                                    {HAZARDS.find(h => h.id === currentHazard)?.label}
                                </Badge>
                                <ChevronRight size={16} className="text-muted-foreground" />
                                <span className="font-semibold text-foreground">{currentPillar}</span>
                            </div>
                            <span className="text-sm text-muted-foreground">
                                Section {completedSections + 1} of {totalSections}
                            </span>
                        </div>
                        <Progress value={progress} className="h-2" />
                    </div>
                </div>

                <div className="container mx-auto px-4 py-8 max-w-3xl">
                    <div className="space-y-8">
                        {currentQuestions.map((q) => (
                            <Card key={q.id} className="border-none shadow-sm bg-white">
                                <CardHeader className="pb-2">
                                    <div className="flex justify-between items-start gap-4">
                                        <CardTitle className="text-lg font-medium leading-relaxed text-foreground">
                                            {q.text} {q.isCritical && <span className="text-red-500 ml-1" title="Critical Question">*</span>}
                                        </CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        {[
                                            { label: "Low / No", value: 1, color: "bg-green-50 hover:bg-green-100 border-green-200 text-green-700" },
                                            { label: "Medium / Partial", value: 2, color: "bg-yellow-50 hover:bg-yellow-100 border-yellow-200 text-yellow-700" },
                                            { label: "High / Yes", value: 3, color: "bg-red-50 hover:bg-red-100 border-red-200 text-red-700" }
                                        ].map((option) => (
                                            <button
                                                key={option.value}
                                                onClick={() => handleResponse(q.id, option.value)}
                                                className={cn(
                                                    "py-3 px-4 rounded-lg border-2 text-sm font-semibold transition-all",
                                                    responses[q.id] === option.value
                                                        ? "ring-2 ring-offset-2 ring-resilience-green border-transparent bg-resilience-green text-white shadow-md"
                                                        : `${option.color} border-transparent`
                                                )}
                                            >
                                                {option.label}
                                            </button>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <div className="mt-12 flex justify-end">
                        <Button
                            size="lg"
                            onClick={nextSection}
                            className="px-8 h-12 text-lg shadow-lg shadow-resilience-green/20"
                        >
                            Next Section <ArrowRight className="ml-2" />
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-bg-secondary flex items-center justify-center px-4">
            <Card className="max-w-lg w-full text-center p-8 shadow-xl border-none">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600">
                    <CheckCircle2 size={48} />
                </div>
                <h1 className="text-3xl font-bold mb-4">Assessment Complete!</h1>
                <p className="text-storm-gray mb-8">
                    Your responses have been recorded. View your dashboard to see your resilience score and action plan.
                </p>
                <Button size="lg" className="w-full h-12 text-lg" onClick={() => router.push('/dashboard')}>
                    Go to Dashboard
                </Button>
            </Card>
        </div>
    );
}
