import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, FileText, Globe2, ShieldCheck, Zap, Droplets, Building2, AlertTriangle } from 'lucide-react';

export default function MethodologyPage() {
    return (
        <div className="min-h-screen bg-bg-primary font-[family-name:var(--font-geist-sans)]">
            {/* Header / Navigation - Handled by Layout */}

            <main className="container mx-auto px-4 py-12 md:py-20 max-w-4xl">
                {/* Title Section */}
                <div className="mb-16 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-teal/10 text-primary-teal font-bold text-sm uppercase tracking-wider mb-6">
                        <FileText size={16} />
                        White Paper
                    </div>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
                        Guiding Climate Resilience Investment through the <span className="text-primary-teal">Pathways Health</span> Assessment Framework
                    </h1>
                    <p className="text-xl text-storm-gray max-w-2xl mx-auto leading-relaxed">
                        An investable data platform providing the essential intelligence required to climate-proof global health systems.
                    </p>
                </div>

                {/* 1. Introduction */}
                <section className="mb-16">
                    <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6 flex items-center gap-3">
                        <span className="bg-primary-teal/10 text-primary-teal w-10 h-10 rounded-full flex items-center justify-center text-lg">1</span>
                        Introduction
                    </h2>
                    <div className="prose prose-lg text-storm-gray max-w-none">
                        <p className="mb-4">
                            <strong>Pathways Health</strong> provides critical infrastructure for transitioning healthcare facilities from vulnerability to enduring climate resilience by delivering clear, actionable, and measurable pathways.
                        </p>
                        <p>
                            Designed for healthcare facilities and communities in climate-vulnerable, low-resource environments (LMICs), this framework offers standardized, evidence-based data to address the critical financial gap hindering justified investments in resilience. By aligning with <a href="https://iris.who.int/server/api/core/bitstreams/f900ad24-8550-4bb8-8e1b-3c290ca73389/content" target="_blank" rel="noopener noreferrer" className="text-primary-teal hover:underline font-medium">WHO climate resilient and sustainable healthcare guidance</a>, the Pathways Health assessment process facilitates evaluation of socio-economic effects, advances Sustainable Development Goals (SDGs), and builds robust financial foundations essential for sustainable development.
                        </p>
                    </div>
                </section>

                {/* 2. The Challenge */}
                <section className="mb-16 bg-white p-8 rounded-3xl shadow-sm border border-border/50">
                    <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6 flex items-center gap-3">
                        <span className="bg-risk-high/10 text-risk-high w-10 h-10 rounded-full flex items-center justify-center text-lg">2</span>
                        The Challenge: Vulnerability & Economic Toll
                    </h2>
                    <div className="grid md:grid-cols-2 gap-8 items-center">
                        <div className="prose prose-lg text-storm-gray">
                            <p>
                                Climate change represents an escalating threat to global health systems. Roughly <strong>2.2 billion people</strong> depend on healthcare facilities exposed to climate risks.
                            </p>
                            <p className="mt-4">
                                Facilities in Low- and Middle-Income Countries (LMICs) face a <strong>4.5 times greater risk</strong> of climate disruptions than those in high-income countries—highlighting vast disparities in exposure.
                            </p>
                        </div>
                        <div className="bg-risk-high/5 p-6 rounded-2xl border border-risk-high/10">
                            <div className="flex items-start gap-4 mb-4">
                                <AlertTriangle className="text-risk-high shrink-0 mt-1" size={24} />
                                <div>
                                    <h4 className="font-bold text-risk-high text-lg mb-1">The Cost of Inaction</h4>
                                    <p className="text-foreground font-medium text-2xl">$43 Billion</p>
                                    <p className="text-sm text-storm-gray">Estimated annual loss in health outcomes due to climate-damaged infrastructure.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 3. Methodology */}
                <section className="mb-16">
                    <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6 flex items-center gap-3">
                        <span className="bg-primary-teal/10 text-primary-teal w-10 h-10 rounded-full flex items-center justify-center text-lg">3</span>
                        Pathways Health Assessment Framework
                    </h2>
                    <p className="text-lg text-storm-gray mb-8">
                        Pathways Health operationalizes the comprehensive WHO Guidance for climate-resilient and environmentally sustainable health care facilities (CRESHCF). This methodology provides detailed insights into current and projected climate risks, enabling tailored adaptation strategies.
                    </p>

                    <h3 className="text-xl font-bold text-foreground mb-6">3.1 Four Pillars of Climate-Resilient Healthcare</h3>
                    <div className="grid sm:grid-cols-2 gap-6 mb-10">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-border/50 hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 bg-sky-blue/10 rounded-xl flex items-center justify-center mb-4 text-sky-blue">
                                <ShieldCheck size={24} />
                            </div>
                            <h4 className="font-bold text-lg mb-2">Health Workforce Capacity</h4>
                            <p className="text-sm text-storm-gray">Ensuring a skilled, protected, and informed workforce empowered to respond to environmental challenges.</p>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-border/50 hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 bg-primary-teal/10 rounded-xl flex items-center justify-center mb-4 text-primary-teal">
                                <Droplets size={24} />
                            </div>
                            <h4 className="font-bold text-lg mb-2">WASH & Waste Management</h4>
                            <p className="text-sm text-storm-gray">Managing water, sanitation, hygiene, and waste safely to prevent contamination during climate events.</p>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-border/50 hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 bg-seed-yellow/10 rounded-xl flex items-center justify-center mb-4 text-seed-yellow">
                                <Zap size={24} />
                            </div>
                            <h4 className="font-bold text-lg mb-2">Energy Services</h4>
                            <p className="text-sm text-storm-gray">Providing reliable, sustainable energy systems resilient to hazards, including back-up power solutions.</p>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-border/50 hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 bg-earth-brown/10 rounded-xl flex items-center justify-center mb-4 text-earth-brown">
                                <Building2 size={24} />
                            </div>
                            <h4 className="font-bold text-lg mb-2">Infrastructure & Technology</h4>
                            <p className="text-sm text-storm-gray">Maintaining and adapting facilities, technology, and operational systems to sustain effective delivery.</p>
                        </div>
                    </div>

                    <h3 className="text-xl font-bold text-foreground mb-6">3.2 Climate Hazards & Risk Assessment</h3>
                    <div className="bg-white p-8 rounded-3xl border border-border/50">
                        <p className="text-storm-gray mb-6">The framework evaluates resilience against seven climate hazards, recognizing risk amplification from multiple or sequential threats:</p>
                        <div className="flex flex-wrap gap-3 mb-8">
                            {["Floods", "Storms", "Sea-Level Rise", "Drought", "Heatwaves", "Wildfires", "Cold Waves"].map((hazard) => (
                                <span key={hazard} className="px-4 py-2 bg-bg-secondary rounded-lg text-sm font-medium text-foreground border border-border/50">
                                    {hazard}
                                </span>
                            ))}
                        </div>
                        <div className="p-4 bg-primary-teal/5 rounded-xl border border-primary-teal/10">
                            <p className="text-sm text-primary-teal-dark font-medium">
                                <strong>Assessment Output:</strong> Vulnerability Checklists classify facilities into <span className="text-risk-high">High</span>, <span className="text-risk-medium">Medium</span>, or <span className="text-risk-low">Low</span> risk. Impact Checklists assess consequence severity as MAJOR, MODERATE, or MINOR.
                            </p>
                        </div>
                    </div>
                </section>

                {/* 4. Socio-Economic Effects */}
                <section className="mb-16">
                    <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6 flex items-center gap-3">
                        <span className="bg-primary-teal/10 text-primary-teal w-10 h-10 rounded-full flex items-center justify-center text-lg">4</span>
                        Evaluating Socio-Economic Effects
                    </h2>
                    <div className="prose prose-lg text-storm-gray max-w-none">
                        <p className="mb-6">
                            Pathways Health inherently captures socio-economic dimensions of climate vulnerability, recognizing that physical infrastructure damage alone does not define resilience.
                        </p>
                        <ul className="space-y-4 list-none pl-0">
                            <li className="flex gap-4">
                                <div className="w-2 h-2 mt-2.5 rounded-full bg-primary-teal shrink-0"></div>
                                <div>
                                    <strong className="text-foreground block">Economic Impacts</strong>
                                    Tracking costs from infrastructure repair, loss of critical medical supplies, disrupted supply chains, and service interruptions.
                                </div>
                            </li>
                            <li className="flex gap-4">
                                <div className="w-2 h-2 mt-2.5 rounded-full bg-primary-teal shrink-0"></div>
                                <div>
                                    <strong className="text-foreground block">Social and Livelihood</strong>
                                    Effects on health workers' capacity and mental health, population displacement, and reduced community access to primary health care.
                                </div>
                            </li>
                            <li className="flex gap-4">
                                <div className="w-2 h-2 mt-2.5 rounded-full bg-primary-teal shrink-0"></div>
                                <div>
                                    <strong className="text-foreground block">Vulnerability Drivers</strong>
                                    Assessing social and economic conditions that heighten susceptibility, including coordination with local governments.
                                </div>
                            </li>
                        </ul>
                    </div>
                </section>

                {/* 5. SDGs Alignment */}
                <section className="mb-16 bg-gradient-to-br from-primary-teal/5 to-sky-blue/5 p-8 rounded-3xl border border-primary-teal/10">
                    <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6 flex items-center gap-3">
                        <span className="bg-white text-primary-teal w-10 h-10 rounded-full flex items-center justify-center text-lg shadow-sm">5</span>
                        Alignment with SDGs
                    </h2>
                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="bg-white p-6 rounded-xl shadow-sm">
                            <div className="text-4xl font-black text-resilience-green mb-2">03</div>
                            <h4 className="font-bold text-foreground mb-2">Good Health & Well-being</h4>
                            <p className="text-xs text-storm-gray">Guarantees continuity and quality of health services through climate adaptation.</p>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm">
                            <div className="text-4xl font-black text-earth-brown mb-2">11</div>
                            <h4 className="font-bold text-foreground mb-2">Sustainable Cities</h4>
                            <p className="text-xs text-storm-gray">Enhances urban resilience through healthcare facility and local government integration.</p>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm">
                            <div className="text-4xl font-black text-primary-teal mb-2">13</div>
                            <h4 className="font-bold text-foreground mb-2">Climate Action</h4>
                            <p className="text-xs text-storm-gray">Provides tools for urgent climate risk identification and mitigation.</p>
                        </div>
                    </div>
                </section>

                {/* 6. Financial Foundations */}
                <section className="mb-16">
                    <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6 flex items-center gap-3">
                        <span className="bg-primary-teal/10 text-primary-teal w-10 h-10 rounded-full flex items-center justify-center text-lg">6</span>
                        Financial Foundations: Unlocking Capital
                    </h2>
                    <div className="prose prose-lg text-storm-gray max-w-none mb-8">
                        <p>
                            By translating vulnerability data into investment-ready, standardized documentation, Pathways Health bridges the financing gap often preventing critical adaptation investments.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 mb-12">
                        <div>
                            <h3 className="text-xl font-bold text-foreground mb-4">De-risking Investment</h3>
                            <ul className="space-y-3">
                                {["Financing Automation", "Unlocking Climate Funds", "High Return on Investment (15-20x)", "Budgeting for Resilience"].map((item) => (
                                    <li key={item} className="flex items-center gap-2 text-storm-gray">
                                        <ShieldCheck size={16} className="text-primary-teal" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-foreground mb-4">Sustainable Funding Model</h3>
                            <p className="text-storm-gray text-sm leading-relaxed">
                                Pathways Health employs a phased business strategy, offering a free initial assessment to broaden uptake. Premium tiers provide ongoing monitoring, automated financing support, and integration with national health and finance systems.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Analogy Section */}
                <div className="my-20 bg-primary-teal-dark text-white p-10 rounded-3xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 opacity-10">
                        <Globe2 size={300} />
                    </div>
                    <div className="relative z-10">
                        <h3 className="text-2xl font-bold mb-4 text-seed-yellow">Analogy for Understanding Pathways Health</h3>
                        <p className="text-lg leading-relaxed opacity-90">
                            If climate change is a relentless storm battering global healthcare systems, <strong>Pathways Health acts as a structural engineering inspection report.</strong> It identifies every vulnerability within a facility's structure—the four pillars—and transforms this damage assessment into a precise, bank-ready blueprint. This blueprint not only directs immediate repairs but builds a stronger foundation, enabling continuous healthcare delivery and supporting sustainable development goals when the next storm strikes.
                        </p>
                    </div>
                </div>

                {/* 7. Conclusion */}
                <section className="mb-20 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">Conclusion & Investment Opportunity</h2>
                    <p className="text-xl text-storm-gray max-w-3xl mx-auto mb-10">
                        Pathways Health is not just a framework; it is an <span className="text-primary-teal font-bold">investable data platform</span> providing the essential intelligence required to climate-proof global health systems.
                    </p>

                    <div className="bg-white p-8 rounded-3xl shadow-lg border-2 border-primary-teal/20 max-w-2xl mx-auto">
                        <h3 className="text-xl font-bold text-foreground mb-4">Join Us in Scaling Resilience</h3>
                        <p className="text-storm-gray mb-8">
                            We are seeking partners to scale our deployment across three high-priority regions in Sub-Saharan Africa and Southeast Asia. We invite investors, development banks, and corporate partners to join us.
                        </p>
                        <Button asChild size="lg" className="text-xl h-16 px-12 bg-[#2D7A4A] hover:bg-[#25663e] text-white border-2 border-white shadow-[0_0_20px_rgba(45,122,74,0.5)] transition-all hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(45,122,74,0.7)] rounded-xl font-bold w-full sm:w-auto">
                            <a href="/PathwaysHealth_Resilience_.pdf" download>
                                Get our Investment Pitch
                            </a>
                        </Button>
                    </div>
                </section>

            </main>

            {/* Footer */}
            <footer className="bg-bg-secondary py-12 border-t border-border/50">
                <div className="container mx-auto px-4 text-center text-storm-gray text-sm">
                    <p>&copy; {new Date().getFullYear()} Pathways Health. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}
