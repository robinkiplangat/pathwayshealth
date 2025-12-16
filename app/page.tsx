import Link from "next/link";
import { ShieldCheck, Activity, BarChart3, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import Image from "next/image";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import AnalyticsTracker from "@/components/AnalyticsTracker";
import UrgentGap from "@/components/landing/UrgentGap";
import ScaleImpact from "@/components/landing/ScaleImpact";

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
            backgroundImage: "url('/public-space.svg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundAttachment: "fixed", // Simple CSS parallax
          }}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px]"></div>
        </div>

        {/* Logo - Positioned to match Navbar */}
        <div className="absolute top-0 left-0 right-0 z-20 py-4 pointer-events-none">
          <div className="container mx-auto px-4">
            <Image src="/Pathways_clear_Logo.png" alt="Pathways Health Logo" width={280} height={280} className="h-auto w-auto max-h-32 drop-shadow-2xl" />
          </div>
        </div>

        <div className="container mx-auto px-4 text-center relative z-10 pt-20">
          {/* Content directly on background */}
          <div className="max-w-5xl mx-auto animate-in fade-in zoom-in duration-1000 relative">

            <h1 className="text-5xl md:text-7xl font-bold text-white mb-8 leading-tight tracking-tight drop-shadow-2xl">
              Strengthen Your <br />
              Healthcare Facility against <br />
              <span className="text-resilience-green drop-shadow-md">Climate Shocks</span>
            </h1>

            <div className="relative inline-block">
              <div className="absolute inset-0 bg-black/40 blur-xl rounded-full"></div>
              <p className="text-xl md:text-2xl text-gray-100 mb-12 max-w-3xl mx-auto leading-relaxed drop-shadow-xl font-medium relative z-10">
                The digital assessment platform for climate-resilient health facilities. Transform local risks into standardized documentation for climate finance
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Button asChild size="lg" className="text-xl h-16 px-12 bg-resilience-green hover:bg-resilience-green/90 text-white border-2 border-white shadow-[0_0_20px_rgba(45,122,74,0.5)] transition-all hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(45,122,74,0.7)] rounded-xl font-bold focus-visible:ring-4 focus-visible:ring-white/50 focus-visible:outline-none">
                <Link href="/assessment">
                  Get Started
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-lg h-16 px-10 border-2 border-white/80 bg-black/20 text-white hover:bg-white hover:text-black hover:border-white backdrop-blur-md transition-all hover:-translate-y-1 rounded-xl font-semibold focus-visible:ring-4 focus-visible:ring-white/50 focus-visible:outline-none">
                <Link href="#partners">
                  For Donors & Partners
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>



      {/* Trust Indicators - Moved Up */}
      <section className="bg-white py-8 border-b border-border/50 shadow-sm relative z-20">
        <div className="container mx-auto px-4 text-center">
          <p className="text-storm-gray font-semibold mb-6 uppercase tracking-widest text-xs">Trusted Frameworks & Standards</p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-80 grayscale hover:grayscale-0 transition-all duration-500">
            <div className="flex items-center gap-2 text-lg font-bold text-earth-brown">
              <CheckCircle2 className="w-5 h-5 text-resilience-green" /> WHO CRESHCF Guidance
            </div>
            <div className="flex items-center gap-2 text-lg font-bold text-earth-brown">
              <CheckCircle2 className="w-5 h-5 text-resilience-green" /> IPCC Data Aligned
            </div>
            {/* <div className="flex items-center gap-2 text-lg font-bold text-earth-brown">
              <CheckCircle2 className="w-5 h-5 text-resilience-green" /> Ministry of Health Approved
            </div> */}
          </div>
        </div>
      </section>

      {/* Urgent Gap Section */}
      <UrgentGap />


      {/* Feature Overview */}
      <section id="features" className="py-24 bg-bg-primary relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-earth-brown mb-6">How It Works</h2>
            <p className="text-xl text-storm-gray max-w-2xl mx-auto">A guided path to understanding and improving your facility's readiness.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto relative">
            {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-1 bg-gradient-to-r from-resilience-green/20 via-resilience-green/40 to-resilience-green/20 -z-10"></div>

            {/* Card 1 */}
            <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 bg-white group relative">
              <CardHeader className="pb-4 text-center">
                <div className="w-20 h-20 mx-auto bg-resilience-green/10 rounded-full flex items-center justify-center mb-6 text-resilience-green group-hover:scale-110 transition-transform duration-300 border-4 border-white shadow-sm">
                  <ShieldCheck size={40} />
                </div>
                <CardTitle className="text-2xl font-bold text-foreground">1. Identify Hazards</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-storm-gray leading-relaxed text-lg">
                  Determine which climate risks—floods, heatwaves, storms—most affect your facility's location and operations.
                </p>
              </CardContent>
            </Card>

            {/* Card 2 */}
            <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 bg-white group relative">
              <CardHeader className="pb-4 text-center">
                <div className="w-20 h-20 mx-auto bg-seed-yellow/10 rounded-full flex items-center justify-center mb-6 text-seed-yellow group-hover:scale-110 transition-transform duration-300 border-4 border-white shadow-sm">
                  <Activity size={40} />
                </div>
                <CardTitle className="text-2xl font-bold text-foreground">2. Assess Vulnerability</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-storm-gray leading-relaxed text-lg">
                  Evaluate your preparedness across workforce, WASH, energy, and infrastructure systems using WHO-aligned checklists.
                </p>
              </CardContent>
            </Card>

            {/* Card 3 */}
            <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 bg-white group relative">
              <CardHeader className="pb-4 text-center">
                <div className="w-20 h-20 mx-auto bg-sky-blue/10 rounded-full flex items-center justify-center mb-6 text-sky-blue group-hover:scale-110 transition-transform duration-300 border-4 border-white shadow-sm">
                  <BarChart3 size={40} />
                </div>
                <CardTitle className="text-2xl font-bold text-foreground">3. Build Resilience</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-storm-gray leading-relaxed text-lg">
                  Get a tailored action plan with concrete steps and resources to strengthen your facility's defenses immediately.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Scale Our Impact Section */}
      <ScaleImpact />

      {/* Trust Indicators - Removed from here (moved up) */}
    </div>
  );
}
