import Link from "next/link";
import { ShieldCheck, Activity, BarChart3, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import Image from "next/image";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import AnalyticsTracker from "@/components/AnalyticsTracker";

export default async function Home() {
  const { userId } = await auth();
  if (userId) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen flex flex-col font-[family-name:var(--font-geist-sans)] relative overflow-hidden">
      <AnalyticsTracker eventName="view_landing" />
      {/* Hero Section with Parallax and Glassmorphism */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Parallax Background */}
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: "url('/hero-bg.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundAttachment: "fixed", // Simple CSS parallax
          }}
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>
        </div>

        <div className="container mx-auto px-4 text-center relative z-10 pt-20">
          {/* Glassmorphism Card */}
          <div className="max-w-4xl mx-auto bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 md:p-12 shadow-2xl animate-in fade-in zoom-in duration-1000">
            <div className="flex justify-center mb-8">
              <Image src="/PH_logo.png" alt="Pathways Health Logo" width={180} height={180} className="h-auto w-auto max-h-40 drop-shadow-lg" />
            </div>

            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-resilience-green/20 text-white text-sm font-semibold mb-8 border border-white/10">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-resilience-green opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-resilience-green"></span>
              </span>
              Empowering Healthcare Resilience
            </div>

            <h1 className="text-5xl md:text-7xl font-bold text-white mb-8 leading-tight tracking-tight drop-shadow-md">
              Assess Your Facility's <br />
              <span className="text-resilience-green drop-shadow-sm">Climate Resilience</span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-100 mb-10 max-w-3xl mx-auto leading-relaxed drop-shadow-sm">
              Simple, actionable checklists to identify risks and strengthen your healthcare facility against climate change.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="text-lg h-14 px-8 bg-resilience-green hover:bg-resilience-green/90 text-white border-0 shadow-lg shadow-resilience-green/20 transition-all hover:-translate-y-1 hover:shadow-xl">
                <Link href="/assessment">
                  Start Assessment <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-lg h-14 px-8 border-2 border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white hover:border-white/50 backdrop-blur-sm transition-all hover:-translate-y-1">
                <Link href="#features">
                  Learn More
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Overview */}
      <section id="features" className="py-24 bg-bg-primary">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-earth-brown mb-4">How It Works</h2>
            <p className="text-lg text-storm-gray max-w-2xl mx-auto">A guided path to understanding and improving your facility's readiness.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Card 1 */}
            <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white group">
              <CardHeader className="pb-4">
                <div className="w-14 h-14 bg-resilience-green/10 rounded-2xl flex items-center justify-center mb-4 text-resilience-green group-hover:scale-110 transition-transform duration-300">
                  <ShieldCheck size={32} />
                </div>
                <CardTitle className="text-xl font-bold text-foreground">1. Identify Hazards</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-storm-gray leading-relaxed">
                  Determine which climate risks—floods, heatwaves, storms—most affect your facility's location and operations.
                </p>
              </CardContent>
            </Card>

            {/* Card 2 */}
            <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white group">
              <CardHeader className="pb-4">
                <div className="w-14 h-14 bg-seed-yellow/10 rounded-2xl flex items-center justify-center mb-4 text-seed-yellow group-hover:scale-110 transition-transform duration-300">
                  <Activity size={32} />
                </div>
                <CardTitle className="text-xl font-bold text-foreground">2. Assess Vulnerability</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-storm-gray leading-relaxed">
                  Evaluate your preparedness across workforce, WASH, energy, and infrastructure systems using WHO-aligned checklists.
                </p>
              </CardContent>
            </Card>

            {/* Card 3 */}
            <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white group">
              <CardHeader className="pb-4">
                <div className="w-14 h-14 bg-sky-blue/10 rounded-2xl flex items-center justify-center mb-4 text-sky-blue group-hover:scale-110 transition-transform duration-300">
                  <BarChart3 size={32} />
                </div>
                <CardTitle className="text-xl font-bold text-foreground">3. Build Resilience</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-storm-gray leading-relaxed">
                  Get a tailored action plan with concrete steps and resources to strengthen your facility's defenses immediately.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="bg-bg-secondary py-16 border-t border-border/50">
        <div className="container mx-auto px-4 text-center">
          <p className="text-storm-gray font-semibold mb-8 uppercase tracking-widest text-xs">Trusted Frameworks & Standards</p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
            <div className="flex items-center gap-2 text-xl font-bold text-earth-brown">
              <CheckCircle2 className="w-6 h-6" /> WHO CRESHCF Guidance
            </div>
            <div className="flex items-center gap-2 text-xl font-bold text-earth-brown">
              <CheckCircle2 className="w-6 h-6" /> IPCC Data Aligned
            </div>
            <div className="flex items-center gap-2 text-xl font-bold text-earth-brown">
              <CheckCircle2 className="w-6 h-6" /> Ministry of Health Approved
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
