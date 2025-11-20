"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface AssessmentBackgroundProps {
    hazardId?: string;
}

const HAZARD_GRADIENTS: Record<string, string> = {
    FLOOD: "from-blue-900 via-blue-700 to-cyan-600",
    STORM: "from-slate-900 via-purple-900 to-slate-800",
    SEA_LEVEL_RISE: "from-cyan-900 via-teal-800 to-blue-800",
    DROUGHT: "from-orange-900 via-amber-800 to-yellow-700",
    HEATWAVE: "from-red-900 via-orange-800 to-red-700",
    WILDFIRE: "from-red-950 via-orange-900 to-yellow-900",
    COLD_WAVE: "from-blue-950 via-indigo-900 to-slate-800",
    DEFAULT: "from-slate-900 via-slate-800 to-slate-900",
};

export function AssessmentBackground({ hazardId }: AssessmentBackgroundProps) {
    const [gradient, setGradient] = useState(HAZARD_GRADIENTS.DEFAULT);

    useEffect(() => {
        if (hazardId && HAZARD_GRADIENTS[hazardId]) {
            setGradient(HAZARD_GRADIENTS[hazardId]);
        } else {
            setGradient(HAZARD_GRADIENTS.DEFAULT);
        }
    }, [hazardId]);

    return (
        <div className="fixed inset-0 -z-10 transition-all duration-1000 ease-in-out">
            <div
                className={cn(
                    "absolute inset-0 bg-gradient-to-br opacity-90 transition-all duration-1000",
                    gradient
                )}
            />
            <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10" />
            <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px]" />
        </div>
    );
}
