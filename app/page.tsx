import Link from "next/link";
import { ShieldCheck, Activity, BarChart3, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="bg-bg-secondary py-16 md:py-24">
        <div className="container mx-auto px-4 text-center max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-bold text-resilience-green mb-6 leading-tight">
            Assess Your Facility's Climate Resilience
          </h1>
          <p className="text-lg md:text-xl text-storm-gray mb-8 max-w-2xl mx-auto">
            Simple checklists to identify risks and strengthen your healthcare facility against climate change.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/assessment"
              className="bg-resilience-green text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-opacity-90 transition-all flex items-center justify-center gap-2"
            >
              Start Assessment <ArrowRight size={20} />
            </Link>
            <Link
              href="#"
              className="bg-white text-resilience-green border-2 border-resilience-green px-8 py-4 rounded-lg font-bold text-lg hover:bg-resilience-green hover:text-white transition-all"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Overview */}
      <section className="py-16 bg-bg-primary">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-earth-brown mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="bg-white p-8 rounded-xl shadow-sm border-l-4 border-resilience-green">
              <div className="w-12 h-12 bg-bg-secondary rounded-full flex items-center justify-center mb-6 text-resilience-green">
                <ShieldCheck size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3 text-foreground">1. Identify Hazards</h3>
              <p className="text-storm-gray">
                Determine which climate risks—floods, heatwaves, storms—most affect your facility's location.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-white p-8 rounded-xl shadow-sm border-l-4 border-seed-yellow">
              <div className="w-12 h-12 bg-bg-secondary rounded-full flex items-center justify-center mb-6 text-seed-yellow">
                <Activity size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3 text-foreground">2. Assess Vulnerability</h3>
              <p className="text-storm-gray">
                Evaluate your preparedness across workforce, WASH, energy, and infrastructure systems.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-white p-8 rounded-xl shadow-sm border-l-4 border-sky-blue">
              <div className="w-12 h-12 bg-bg-secondary rounded-full flex items-center justify-center mb-6 text-sky-blue">
                <BarChart3 size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3 text-foreground">3. Build Resilience</h3>
              <p className="text-storm-gray">
                Get a tailored action plan with concrete steps to strengthen your facility's defenses.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="bg-bg-secondary py-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-storm-gray font-medium mb-6 uppercase tracking-wider text-sm">Trusted Frameworks</p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-70 grayscale hover:grayscale-0 transition-all">
            {/* Placeholders for logos */}
            <div className="text-xl font-bold text-earth-brown">WHO CRESHCF Guidance</div>
            <div className="text-xl font-bold text-earth-brown">IPCC Data Aligned</div>
            <div className="text-xl font-bold text-earth-brown">Ministry of Health Approved</div>
          </div>
        </div>
      </section>
    </div>
  );
}
