import { cn } from '@/lib/utils';

type RiskLevel = 'resilient' | 'low_risk' | 'medium_risk' | 'high_risk' | 'extreme';

interface RiskBadgeProps {
    level: RiskLevel | string;
    className?: string;
    showLabel?: boolean;
}

const riskConfig: Record<string, { label: string; color: string; bg: string }> = {
    resilient: {
        label: 'Resilient',
        color: 'text-green-700',
        bg: 'bg-green-100 border-green-200',
    },
    low_risk: {
        label: 'Low Risk',
        color: 'text-blue-700',
        bg: 'bg-blue-100 border-blue-200',
    },
    medium_risk: {
        label: 'Medium Risk',
        color: 'text-yellow-700',
        bg: 'bg-yellow-100 border-yellow-200',
    },
    high_risk: {
        label: 'High Risk',
        color: 'text-orange-700',
        bg: 'bg-orange-100 border-orange-200',
    },
    extreme: {
        label: 'Extreme Risk',
        color: 'text-red-700',
        bg: 'bg-red-100 border-red-200',
    },
    // Fallback
    unknown: {
        label: 'Unknown',
        color: 'text-gray-700',
        bg: 'bg-gray-100 border-gray-200',
    }
};

export function RiskBadge({ level, className, showLabel = true }: RiskBadgeProps) {
    const normalizedLevel = (level || 'unknown').toString().toLowerCase();
    const config = riskConfig[normalizedLevel] || riskConfig.unknown;

    return (
        <span
            className={cn(
                "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                config.bg,
                config.color,
                className
            )}
        >
            {showLabel ? config.label : null}
        </span>
    );
}
