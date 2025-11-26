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
import { AssessmentBackground } from "@/components/AssessmentBackground";
import ReportPreview from "@/components/ReportPreview";
import { saveAssessmentSession } from "@/lib/assessment-session";
import { trackEvent } from "@/lib/analytics";


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
    const [assessmentId, setAssessmentId] = useState<string | null>(null);

    const toggleHazard = (id: string) => {
        setSelectedHazards(prev =>
            prev.includes(id) ? prev.filter(h => h !== id) : [...prev, id]
        );
    };

    const previousSection = () => {
        if (currentPillarIndex > 0) {
            setCurrentPillarIndex(prev => prev - 1);
            window.scrollTo(0, 0);
        } else if (currentHazardIndex > 0) {
            setCurrentHazardIndex(prev => prev - 1);
            setCurrentPillarIndex(PILLARS.length - 1);
            window.scrollTo(0, 0);
        }
    };

    const startAssessment = async () => {

        if (selectedHazards.length === 0) return;
        setLoading(true);
        trackEvent('start_assessment', { hazards: selectedHazards });
        try {
            // Fetch questions for all selected hazards
            // In a real app, we might fetch per hazard or batch
            // For MVP, we'll fetch all and filter client-side or fetch sequentially
            // Let's fetch all for simplicity
            const res = await fetch('/api/questions');
            const allQuestions = await res.json();

            if (!Array.isArray(allQuestions)) {
                console.error("API returned non-array:", allQuestions);
                setQuestions([]);
                return;
            }

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

    interface AssessmentResponseInput {
        questionId: string;
        score?: number;
        answer?: string | number;
    }

    const submitAssessment = async () => {
        setLoading(true);
        trackEvent('complete_assessment', {
            score: 0, // Placeholder, score is calculated in render currently
            hazard_count: selectedHazards.length
        });
        try {
            const formattedResponses = Object.entries(responses).map(([questionId, score]) => ({
                questionId,
                score
            }));

            const res = await fetch('/api/assessment/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    responses: formattedResponses,
                    facilityName: "My Facility", // Placeholder
                    location: "Unknown" // Placeholder
                })
            });

            const data = await res.json();
            if (data.id) {
                setAssessmentId(data.id);
                // Save session for potential linking later
                saveAssessmentSession({
                    assessmentId: data.id,
                    facilityName: "My Facility", // Default, can be updated later
                    location: "Unknown",
                    responses: formattedResponses.map(r => ({ ...r, answer: r.score.toString() }))
                });
            }

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

    // Calculate question-level progress for current section
    const totalQuestionsInSection = currentQuestions.length;
    const answeredQuestionsInSection = currentQuestions.filter(q => responses[q.id] !== undefined).length;
    const questionProgress = totalQuestionsInSection > 0
        ? (answeredQuestionsInSection / totalQuestionsInSection) * 100
        : 0;

    // Sound Effect Logic
    useEffect(() => {
        if (step === "questions" && currentHazard) {
            // Placeholder for actual audio playback
            // const audio = new Audio(`/sounds/${currentHazard.toLowerCase()}.mp3`);
            // audio.play().catch(e => console.log("Audio play failed", e));
        }
    }, [currentHazard, step]);

    if (step === "hazards") {
        return (
            <div className="min-h-screen relative overflow-hidden py-12 px-4">
                <AssessmentBackground hazardId="DEFAULT" />

                <div className="max-w-5xl mx-auto relative z-10">
                    <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white/80 text-sm font-medium mb-6 backdrop-blur-sm">
                            <CheckCircle2 size={16} className="text-resilience-green" />
                            Join 500+ facilities building climate resilience
                        </div>
                        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 drop-shadow-lg">
                            Identify Your Climate Risks
                        </h1>
                        <p className="text-gray-200 text-xl max-w-3xl mx-auto leading-relaxed mb-4">
                            Select the climate threats your facility faces. We'll create a customized resilience plan based on your specific risks.
                        </p>
                        <p className="text-gray-300 text-sm max-w-2xl mx-auto">
                            <span className="text-resilience-green font-semibold">💡 Tip:</span> Choose all that apply - most facilities select 2-4 hazards
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-24">
                        {HAZARDS.map((hazard, index) => {
                            const Icon = hazard.icon;
                            const isSelected = selectedHazards.includes(hazard.id);
                            return (
                                <div
                                    key={hazard.id}
                                    className={cn(
                                        "group relative cursor-pointer transition-all duration-300 hover:-translate-y-1",
                                        "animate-in fade-in zoom-in duration-500",
                                        { "delay-100": index % 2 !== 0 }
                                    )}
                                    style={{ animationDelay: `${index * 50}ms` }}
                                    onClick={() => toggleHazard(hazard.id)}
                                >
                                    <div className={cn(
                                        "h-full p-6 rounded-2xl border backdrop-blur-md transition-all duration-300 flex flex-col items-center justify-center text-center gap-4",
                                        isSelected
                                            ? "bg-white/20 border-resilience-green/50 shadow-[0_0_30px_rgba(74,222,128,0.2)]"
                                            : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
                                    )}>
                                        <div className={cn(
                                            "w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300",
                                            isSelected ? "bg-resilience-green text-white scale-110" : "bg-white/10 text-white group-hover:scale-110"
                                        )}>
                                            <Icon size={32} />
                                        </div>
                                        <h3 className={cn("font-semibold text-lg transition-colors", isSelected ? "text-white" : "text-gray-200")}>
                                            {hazard.label}
                                        </h3>
                                        {isSelected && (
                                            <div className="absolute top-4 right-4 text-resilience-green animate-in zoom-in duration-300">
                                                <CheckCircle2 size={20} />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Sticky Footer for Action */}
                    <div className={cn(
                        "fixed bottom-0 left-0 right-0 p-6 backdrop-blur-xl border-t border-white/10 z-50 transition-transform duration-500",
                        selectedHazards.length > 0 ? "translate-y-0" : "translate-y-full"
                    )}>
                        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
                            <div className="flex-1">
                                <div className="text-lg font-medium text-white mb-1">
                                    <span className="text-resilience-green font-bold">{selectedHazards.length}</span> hazard{selectedHazards.length !== 1 ? 's' : ''} selected
                                </div>
                                <div className="text-sm text-gray-300 hidden sm:block">
                                    Next: Answer questions for each hazard (~15-20 min)
                                </div>
                            </div>
                            <Button
                                size="lg"
                                onClick={startAssessment}
                                disabled={selectedHazards.length === 0 || loading}
                                className="w-full sm:w-auto px-10 text-lg h-14 bg-resilience-green hover:bg-resilience-green/90 text-white shadow-lg shadow-resilience-green/20 rounded-xl transition-all hover:scale-105"
                            >
                                {loading ? "Loading..." : "Continue Assessment"} <ArrowRight className="ml-2" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (step === "questions") {
        // Optimize: Find current hazard details once instead of repeatedly searching
        const currentHazardDetails = HAZARDS.find(h => h.id === currentHazard);

        return (
            <div className="flex flex-col h-screen">
                <AssessmentBackground hazardId={currentHazard} />

                {/* Sticky Header */}
                <div className="sticky top-0 z-40 backdrop-blur-xl bg-black/20 border-b border-white/10 shadow-lg">
                    <div className="container mx-auto px-4 py-4">
                        <div className="flex justify-between items-center mb-3 text-white">
                            <div className="flex items-center gap-3">
                                <Badge
                                    variant="outline"
                                    className="text-sm font-medium px-3 py-1 border-white/30 text-white bg-white/10 backdrop-blur-sm cursor-pointer hover:bg-white/20 transition-colors"
                                    onClick={() => setStep("hazards")}
                                >
                                    All Assessments
                                </Badge>
                                <ChevronRight size={16} className="text-white/50" />
                                <Badge variant="outline" className="text-sm font-medium px-3 py-1 border-white/30 text-white bg-white/10 backdrop-blur-sm">
                                    {currentHazardDetails?.label}
                                </Badge>
                                <ChevronRight size={16} className="text-white/50" />
                                <span className="font-semibold text-lg tracking-wide">{currentPillar}</span>
                            </div>
                            <span className="text-sm text-white/70 font-medium">
                                {completedSections + 1} / {totalSections}
                            </span>
                        </div>
                        <Progress
                            value={questionProgress}
                            className="h-2 bg-white/10 border border-white/20 shadow-inner"
                            indicatorClassName="bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"
                        />
                    </div>
                </div>

                {/* Scrollable Content Area */}
                <div className="flex-grow overflow-y-auto">
                    <div className="container mx-auto px-4 py-12 max-w-3xl relative z-10">
                        {/* Contextual Header */}
                        <div className="mb-8 text-center animate-in fade-in slide-in-from-top-4 duration-700">
                            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3 drop-shadow-lg">
                                Assessing {currentHazardDetails?.label} Impact
                            </h2>
                            <p className="text-gray-200 text-lg max-w-2xl mx-auto">
                                on <span className="text-resilience-green font-semibold">{currentPillar}</span> systems
                            </p>
                            <p className="text-gray-300 text-sm mt-2 max-w-xl mx-auto">
                                Understanding these vulnerabilities helps prioritize critical upgrades and resilience investments.
                            </p>
                        </div>

                        {/* Milestone Celebration */}
                        {progress >= 50 && progress < 55 && (
                            <div className="mb-8 p-6 rounded-2xl bg-resilience-green/20 border border-resilience-green/30 backdrop-blur-md animate-in zoom-in duration-500">
                                <div className="text-center">
                                    <div className="text-4xl mb-2">🎉</div>
                                    <h3 className="text-xl font-bold text-white mb-1">Halfway There!</h3>
                                    <p className="text-gray-200 text-sm">You're making great progress. Keep going!</p>
                                </div>
                            </div>
                        )}
                        <div className="space-y-8 pb-8">
                            {currentQuestions.map((q, idx) => (
                                <Card key={q.id} className="border-white/10 bg-white/10 backdrop-blur-md shadow-xl animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-backwards" style={{ animationDelay: `${idx * 100}ms` }}>
                                    <CardHeader className="pb-4">
                                        <div className="flex justify-between items-start gap-4">
                                            <CardTitle className="text-xl font-medium leading-relaxed text-white">
                                                {q.text} {q.isCritical && <span className="text-red-400 ml-1 drop-shadow-md" title="Critical Question">*</span>}
                                            </CardTitle>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                            {[
                                                { label: "Low / No", value: 1, color: "hover:bg-red-500/20 hover:border-red-500/50 text-white border-white/20" },
                                                { label: "Medium / Partial", value: 2, color: "hover:bg-yellow-500/20 hover:border-yellow-500/50 text-white border-white/20" },
                                                { label: "High / Yes", value: 3, color: "hover:bg-green-500/20 hover:border-green-500/50 text-white border-white/20" }
                                            ].map((option) => (
                                                <button
                                                    key={option.value}
                                                    onClick={() => handleResponse(q.id, option.value)}
                                                    className={cn(
                                                        "py-4 px-4 rounded-xl border transition-all duration-200 text-sm font-semibold backdrop-blur-sm",
                                                        responses[q.id] === option.value
                                                            ? "ring-2 ring-offset-2 ring-offset-transparent ring-resilience-green border-transparent bg-resilience-green text-white shadow-lg scale-[1.02]"
                                                            : `${option.color} bg-white/5`
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
                    </div>
                </div>

                {/* Sticky Footer Navigation */}
                <div className="sticky bottom-0 z-40 backdrop-blur-xl bg-black/20 border-t border-white/10 shadow-lg py-3 px-4">
                    <div className="container mx-auto max-w-3xl flex justify-between">
                        <Button
                            size="default"
                            variant="outline"
                            onClick={previousSection}
                            disabled={currentHazardIndex === 0 && currentPillarIndex === 0}
                            className="px-6 h-11 text-base border-white/20 text-white hover:bg-white/10 bg-transparent backdrop-blur-sm"
                        >
                            <ChevronLeft className="mr-2" size={18} /> Previous
                        </Button>
                        <Button
                            size="default"
                            onClick={nextSection}
                            className="px-8 h-11 text-base bg-white text-black hover:bg-white/90 shadow-xl shadow-white/10 rounded-xl transition-transform hover:scale-105"
                        >
                            Next Section <ArrowRight className="ml-2" size={18} />
                        </Button>
                    </div>
                </div>
            </div>
        );
    }



    // ... (keep existing code)

    if (step === "complete") {
        // Calculate score (placeholder logic)
        // Calculate weighted score
        let totalWeightedScore = 0;
        let maxWeightedScore = 0;

        Object.entries(responses).forEach(([qId, score]) => {
            const question = questions.find(q => q.id === qId);
            const weight = question?.weight || 1;
            totalWeightedScore += score * weight;
            maxWeightedScore += 3 * weight; // Max score per question is 3
        });

        const percentageScore = maxWeightedScore > 0 ? Math.round((totalWeightedScore / maxWeightedScore) * 100) : 0;

        const formattedResponses = Object.entries(responses).map(([questionId, score]) => ({
            questionId,
            answer: score.toString(),
            score
        }));

        return (
            <div className="min-h-screen bg-gray-50">
                <ReportPreview
                    assessmentId={assessmentId || ""} // You need to store assessmentId from submit response
                    facilityName="My Facility"
                    location="Unknown"
                    score={percentageScore}
                    responses={formattedResponses}
                />
                <div className="max-w-4xl mx-auto px-6 pb-12 flex justify-center">
                    <Button
                        size="lg"
                        variant="outline"
                        className="gap-2"
                        onClick={() => router.push('/dashboard')}
                    >
                        Go to Dashboard <ArrowRight size={16} />
                    </Button>
                </div>
            </div>
        );
    }
    return null;
}
