"use client";

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Cell,
} from "recharts";

interface HazardData {
    hazard: string;
    vulnerability: number;
    impact: number;
    resilience: number;
}

interface HazardChartProps {
    data: HazardData[];
    className?: string;
}

const COLORS = {
    vulnerability: "#f97316", // orange-500
    impact: "#ef4444", // red-500
    resilience: "#22c55e", // green-500
};

export function HazardChart({ data, className }: HazardChartProps) {
    // Transform data for chart if needed, or use as is
    // Capitalize hazard names for display
    const chartData = data.map((item) => ({
        ...item,
        name: item.hazard.charAt(0).toUpperCase() + item.hazard.slice(1).replace(/_/g, " "),
    }));

    return (
        <div className={className} style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer>
                <BarChart
                    data={chartData}
                    margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 5,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip
                        contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
                        cursor={{ fill: 'transparent' }}
                    />
                    <Legend />
                    <Bar dataKey="vulnerability" name="Vulnerability" fill={COLORS.vulnerability} radius={[4, 4, 0, 0]} />
                    <Bar dataKey="impact" name="Impact" fill={COLORS.impact} radius={[4, 4, 0, 0]} />
                    <Bar dataKey="resilience" name="Resilience" fill={COLORS.resilience} radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
