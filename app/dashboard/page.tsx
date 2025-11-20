export default function DashboardPage() {
    return (
        <div className="container mx-auto px-4 py-12">
            <h1 className="text-3xl font-bold text-resilience-green mb-6">Facility Dashboard</h1>

            {/* Overview Panel */}
            <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-risk-medium mb-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h2 className="text-xl font-bold mb-1">Overall Resilience Score</h2>
                        <div className="text-3xl font-bold text-risk-medium">62/100</div>
                        <p className="text-sm text-storm-gray">Status: Medium Vulnerability - Adapt Now</p>
                    </div>
                    <button className="bg-resilience-green text-white px-6 py-2 rounded-lg font-medium">
                        View Full Report
                    </button>
                </div>
            </div>

            {/* Pillars Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Workforce */}
                <div className="bg-white p-6 rounded-xl shadow-sm">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                        <span>👥</span> Workforce Capacity
                    </h3>
                    <div className="mb-4">
                        <div className="flex justify-between text-sm mb-1">
                            <span>Score</span>
                            <span className="font-bold">58/100</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div className="bg-risk-medium h-2.5 rounded-full" style={{ width: '58%' }}></div>
                        </div>
                    </div>
                    <p className="text-sm text-storm-gray">Top Priority: Train 5 more staff on climate response.</p>
                </div>

                {/* WASH */}
                <div className="bg-white p-6 rounded-xl shadow-sm">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                        <span>💧</span> WASH & Waste
                    </h3>
                    <div className="mb-4">
                        <div className="flex justify-between text-sm mb-1">
                            <span>Score</span>
                            <span className="font-bold">45/100</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div className="bg-risk-high h-2.5 rounded-full" style={{ width: '45%' }}></div>
                        </div>
                    </div>
                    <p className="text-sm text-storm-gray">Top Priority: Secure backup water supply for drought.</p>
                </div>
            </div>
        </div>
    );
}
