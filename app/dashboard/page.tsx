import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
    return (
        <div className="min-h-screen bg-bg-primary flex flex-col items-center justify-center p-4">
            <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
            <p className="text-storm-gray mb-8">This is a placeholder for the dashboard.</p>
            <Button asChild>
                <Link href="/">Back to Home</Link>
            </Button>
        </div>
    );
}
