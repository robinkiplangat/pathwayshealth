import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Globe2, Handshake, LineChart } from 'lucide-react';

const ScaleImpact = () => {
    return (
        <section id="partners" className="py-24 bg-resilience-green/5 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5 pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(#2D7A4A 1px, transparent 1px)', backgroundSize: '32px 32px' }}>
            </div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="flex flex-col lg:flex-row items-center gap-16">

                    {/* Content Side */}
                    <div className="lg:w-1/2 space-y-8">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-resilience-green/10 text-resilience-green font-bold text-sm uppercase tracking-wider">
                            <Handshake size={16} />
                            For Donors & Partners
                        </div>

                        <h2 className="text-4xl md:text-5xl font-bold text-foreground leading-tight">
                            Scale Resilience. <br />
                            <span className="text-resilience-green">Unlock Data.</span> <br />
                            Protect Lives.
                        </h2>

                        <p className="text-xl text-storm-gray leading-relaxed">
                            We bridge the gap between global climate funding and frontline facility readiness. Partner with us to deploy this assessment at scale, generating the granular data needed to direct adaptation funds where they matter most.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 pt-4">
                            <Button asChild size="lg" className="text-lg h-14 px-8 bg-transparent border-2 border-foreground text-foreground hover:bg-foreground hover:text-white shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 font-bold">
                                <Link href="mailto:partners@pathways.health">
                                    Partner With Us <ArrowRight className="ml-2 w-5 h-5" />
                                </Link>
                            </Button>
                            <Button asChild variant="outline" size="lg" className="text-lg h-14 px-8 border-2 border-resilience-green text-resilience-green hover:bg-resilience-green hover:text-white transition-all">
                                <Link href="/methodology">
                                    View Methodology
                                </Link>
                            </Button>
                        </div>
                    </div>

                    {/* Visual/Cards Side */}
                    <div className="lg:w-1/2 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white p-8 rounded-2xl shadow-md hover:shadow-lg transition-shadow border border-border/50">
                            <div className="w-12 h-12 bg-sky-blue/10 rounded-xl flex items-center justify-center mb-4 text-sky-blue">
                                <Globe2 size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-foreground mb-2">Scale Across Regions</h3>
                            <p className="text-storm-gray">
                                Rapidly deploy standardized assessments across hundreds of facilities in high-risk zones.
                            </p>
                        </div>

                        <div className="bg-white p-8 rounded-2xl shadow-md hover:shadow-lg transition-shadow border border-border/50 md:translate-y-8">
                            <div className="w-12 h-12 bg-earth-brown/10 rounded-xl flex items-center justify-center mb-4 text-earth-brown">
                                <LineChart size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-foreground mb-2">Data-Driven Funding</h3>
                            <p className="text-storm-gray">
                                Access aggregated, anonymized dashboards to identify systemic gaps and target investments effectively.
                            </p>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default ScaleImpact;
