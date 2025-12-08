import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
    title: string;
    value: string | number;
    icon?: LucideIcon;
    trend?: {
        value: number;
        label: string;
        direction: 'up' | 'down' | 'neutral';
    };
    className?: string;
    description?: string;
}

export function StatCard({
    title,
    value,
    icon: Icon,
    trend,
    className,
    description,
}: StatCardProps) {
    return (
        <div className={cn("rounded-xl border bg-card text-card-foreground shadow-sm p-6", className)}>
            <div className="flex items-center justify-between space-y-0 pb-2">
                <h3 className="tracking-tight text-sm font-medium text-muted-foreground">
                    {title}
                </h3>
                {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
            </div>
            <div className="flex flex-col gap-1">
                <div className="text-2xl font-bold">{value}</div>
                {description && (
                    <p className="text-xs text-muted-foreground">{description}</p>
                )}
                {trend && (
                    <p className={cn("text-xs flex items-center gap-1", {
                        "text-green-500": trend.direction === 'up',
                        "text-red-500": trend.direction === 'down',
                        "text-muted-foreground": trend.direction === 'neutral',
                    })}>
                        {trend.direction === 'up' ? '↑' : trend.direction === 'down' ? '↓' : '→'}
                        <span className="font-medium">{Math.abs(trend.value)}%</span>
                        <span className="text-muted-foreground">{trend.label}</span>
                    </p>
                )}
            </div>
        </div>
    );
}
