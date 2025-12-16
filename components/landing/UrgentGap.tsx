import React from 'react';
import Image from 'next/image';
import { Building2, WifiOff, Banknote, FileText, Smartphone, ArrowDown, AlertTriangle, Droplets, ThermometerSun } from 'lucide-react';

const UrgentGap = () => {
    return (
        <section className="w-full font-[family-name:var(--font-geist-sans)]">
            {/* 1. Section Header & The Core Conflict */}
            <div className="bg-bg-secondary py-20 md:py-28">
                {/* DOM ORDER CHANGE: Move flex group out of container and place before container */}
                <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
                    {/* Text Content */}
                    <div className="lg:w-1/2 space-y-8">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-risk-high/10 text-risk-high font-bold text-sm uppercase tracking-wider">
                            <AlertTriangle size={16} />
                            Critical Gap
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold text-foreground leading-tight">
                            The Climate Crisis is Disrupting Healthcare Now. <br />
                            <span className="text-storm-gray">Most Facilities Are Flying Blind.</span>
                        </h2>
                        <p className="text-xl text-storm-gray leading-relaxed">
                            Climate impacts—from extreme heat and flooding to shifting disease patterns—are rising faster than health systems can adapt. Frontline facilities are the first to be hit, yet they lack the basic tools to understand their own vulnerabilities.
                        </p>
                        {/* Removed Statistic Box from here to move it to the map side */}
                        <div className="p-6 rounded-2xl bg-white/50 border border-border/50 backdrop-blur-sm">
                            <p className="text-lg text-storm-gray font-medium italic">
                                "They cannot manage risks they cannot measure."
                            </p>
                        </div>
                    </div>
                    {/* Visual Content */}
                    <div className="lg:w-1/2 relative">
                        {/* Statistic Overlay/Connection */}
                        <div
                            className="absolute z-20 bg-white p-6 rounded-2xl shadow-xl border-l-8 border-resilience-green max-w-xs text-center md:text-left"
                            style={{ left: '422px', top: '659px' }}
                        >
                            <div className="text-5xl md:text-6xl font-bold text-resilience-green mb-1">
                                95%
                            </div>
                            <p className="text-sm font-bold text-foreground leading-tight">
                                of facilities in high-risk regions have no baseline of their climate resilience.
                            </p>
                        </div>
                        <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white mt-8 md:mt-0">
                            <Image
                                src="/urgent-gap-map.png"
                                alt="Map showing climate risks and data gaps"
                                width={800}
                                height={600}
                                className="w-full h-auto object-cover"
                            />
                            {/* Overlay Gradient */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none"></div>
                        </div>
                    </div>
                </div>
                {/* The rest of container content stays as is, after the flex group */}
                <div className="container mx-auto px-4">
                    {/* Could contain additional section content if any */}
                </div>
            </div>

            {/* 2. The Human & Operational Cost */}
            <div className="bg-white py-20 md:py-28">
                <div className="container mx-auto px-4">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h3 className="text-3xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
                            When Resilience Fails, <br /><span className="text-risk-high">Essential Care Stops.</span>
                        </h3>
                        <p className="text-xl text-storm-gray">
                            Without proactive adaptation, climate shocks directly undermine service delivery and health outcomes.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Impact Point 1: Infrastructure */}
                        <div className="group">
                            <div className="relative h-64 rounded-2xl overflow-hidden mb-6 shadow-md group-hover:shadow-xl transition-all duration-300">
                                <Image
                                    src="/urgent-gap-access.png"
                                    alt="Flooded road blocking access to clinic"
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-300"></div>
                            </div>
                            <h4 className="text-2xl font-bold text-earth-brown mb-3">Infrastructure & Access</h4>
                            <p className="text-storm-gray leading-relaxed">
                                Flooding cuts off roads to clinics and damages critical equipment, preventing patients from reaching care when they need it most.
                            </p>
                        </div>
                        {/* Impact Point 2: WASH */}
                        <div className="group">
                            <div className="relative h-64 rounded-2xl overflow-hidden mb-6 shadow-md group-hover:shadow-xl transition-all duration-300">
                                <Image
                                    src="/urgent-gap-wash.png"
                                    alt="Healthcare worker with empty water tank"
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-300"></div>
                            </div>
                            <h4 className="text-2xl font-bold text-earth-brown mb-3">WASH & Infection Control</h4>
                            <p className="text-storm-gray leading-relaxed">
                                Droughts and water scarcity compromise sanitation, drastically increasing the risk of facility-acquired infections during crises.
                            </p>
                        </div>
                        {/* Impact Point 3: Workforce */}
                        <div className="group">
                            <div className="relative h-64 rounded-2xl overflow-hidden mb-6 shadow-md group-hover:shadow-xl transition-all duration-300">
                                <Image
                                    src="/urgent-gap-heat.png"
                                    alt="Crowded, hot waiting room"
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-300"></div>
                            </div>
                            <h4 className="text-2xl font-bold text-earth-brown mb-3">Workforce & Patients</h4>
                            <p className="text-storm-gray leading-relaxed">
                                Extreme heat threatens staff safety and endangers vulnerable patients, especially in maternal and neonatal wards where cooling is critical.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. The "Why" (Systemic Failure) */}
            <div className="bg-bg-secondary py-20 md:py-28 relative overflow-hidden shadow-inner">
                {/* Subtle Texture Background */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/5 to-transparent pointer-events-none"></div>
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                    style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23000000\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}>
                </div>
                <div className="container mx-auto px-4">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h3 className="text-3xl md:text-4xl font-bold text-foreground mb-6">Why the Gap Persists</h3>
                        <p className="text-xl text-storm-gray">
                            High-level global guidance exists, but it hasn't been operationalized for the "last mile." Current assessment approaches fail frontline facilities.
                        </p>
                    </div>
                    {/* Broken Bridge Visualization */}
                    <div className="max-w-5xl mx-auto relative">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-8 md:gap-0 relative z-10">
                            {/* Left Side: Global Guidance */}
                            <div className="flex flex-col items-center text-center w-full md:w-1/4">
                                <div className="w-24 h-24 bg-white rounded-full shadow-lg flex items-center justify-center mb-4 border-4 border-earth-brown/20">
                                    <Building2 size={40} className="text-earth-brown" />
                                </div>
                                <h4 className="font-bold text-lg text-foreground">Global Guidance</h4>
                                <p className="text-sm text-storm-gray">(Geneva / WHO)</p>
                            </div>
                            {/* The Gap (Barriers) */}
                            <div className="flex-1 flex flex-col items-center justify-center px-4 md:px-8 w-full">
                                <div className="flex justify-center gap-4 md:gap-8 mb-4">
                                    <div className="flex flex-col items-center">
                                        <div className="w-12 h-12 bg-risk-high/10 rounded-full flex items-center justify-center mb-2 text-risk-high">
                                            <FileText size={20} />
                                        </div>
                                        <span className="text-xs font-bold text-risk-high uppercase tracking-wide">Too Complex</span>
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <div className="w-12 h-12 bg-risk-high/10 rounded-full flex items-center justify-center mb-2 text-risk-high">
                                            <Banknote size={20} />
                                        </div>
                                        <span className="text-xs font-bold text-risk-high uppercase tracking-wide">Too Expensive</span>
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <div className="w-12 h-12 bg-risk-high/10 rounded-full flex items-center justify-center mb-2 text-risk-high">
                                            <WifiOff size={20} />
                                        </div>
                                        <span className="text-xs font-bold text-risk-high uppercase tracking-wide">No Connectivity</span>
                                    </div>
                                </div>
                                {/* Visual Gap Line */}
                                <div className="w-full h-2 bg-gray-200 rounded-full relative overflow-hidden">
                                    <div className="absolute left-0 top-0 bottom-0 w-1/3 bg-earth-brown/30 rounded-l-full"></div>
                                    <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-resilience-green/30 rounded-r-full"></div>
                                    {/* The Break */}
                                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-8 bg-bg-secondary flex items-center justify-center">
                                        <AlertTriangle size={24} className="text-risk-high" />
                                    </div>
                                </div>
                            </div>
                            {/* Right Side: Frontline */}
                            <div className="flex flex-col items-center text-center w-full md:w-1/4">
                                <div className="w-24 h-24 bg-white rounded-full shadow-lg flex items-center justify-center mb-4 border-4 border-resilience-green/20">
                                    <Smartphone size={40} className="text-resilience-green" />
                                </div>
                                <h4 className="font-bold text-lg text-foreground">Frontline Facilities</h4>
                                <p className="text-sm text-storm-gray">(The Last Mile)</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 4. Transition to Solution */}
            <div className="bg-white py-16 text-center">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mx-auto">
                        <p className="text-2xl md:text-4xl font-medium text-foreground leading-relaxed mb-8">
                            To close this gap, we don't need more complex frameworks. <br />
                            We need <span className="text-resilience-green font-bold bg-resilience-green/10 px-2 rounded-md">practical, scalable tools</span> that empower facilities to generate their own data and take immediate action.
                        </p>
                        <div className="flex justify-center animate-bounce">
                            <ArrowDown size={32} className="text-resilience-green" />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default UrgentGap;
