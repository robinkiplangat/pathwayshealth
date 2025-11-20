export default function AssessmentPage() {
    return (
        <div className="container mx-auto px-4 py-12">
            <h1 className="text-3xl font-bold text-resilience-green mb-6">Assessment</h1>
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                <p className="text-lg text-storm-gray mb-4">
                    Select a hazard to begin your assessment.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {['Floods', 'Storms', 'Heatwaves', 'Drought', 'Wildfires'].map((hazard) => (
                        <button
                            key={hazard}
                            className="p-6 text-left border rounded-lg hover:border-resilience-green hover:bg-bg-secondary transition-all group"
                        >
                            <h3 className="font-bold text-lg group-hover:text-resilience-green">{hazard}</h3>
                            <p className="text-sm text-storm-gray mt-2">Start assessment &rarr;</p>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
