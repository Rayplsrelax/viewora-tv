import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Tv, Film, Zap, Shield, Globe, Headphones, Check, Play, Star, Monitor, Users, Crown } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useMemo } from "react";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" as const },
  }),
};

const DURATION_OPTIONS = [
  { months: 1, label: "1 Month" },
  { months: 3, label: "3 Months" },
  { months: 6, label: "6 Months" },
  { months: 12, label: "12 Months" },
];

const TIER_ICONS = [Monitor, Users, Crown];

export default function Home() {
  const [selectedDuration, setSelectedDuration] = useState(6);
  const plansQuery = trpc.plans.list.useQuery();
  const checkoutMutation = trpc.checkout.create.useMutation({
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create checkout session");
    },
  });

  // Filter plans by selected duration and group by device tier
  const filteredPlans = useMemo(() => {
    if (!plansQuery.data) return [];
    return plansQuery.data
      .filter((p) => p.months === selectedDuration)
      .sort((a, b) => a.devices - b.devices);
  }, [plansQuery.data, selectedDuration]);

  const handleSubscribe = (planId: string) => {
    checkoutMutation.mutate({ planId });
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <Play className="w-4 h-4 text-white fill-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">
              Viewora<span className="text-violet-400">TV</span>
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-zinc-400 hover:text-white transition-colors">Features</a>
            <a href="#pricing" className="text-sm text-zinc-400 hover:text-white transition-colors">Pricing</a>
            <a href="/setup" className="text-sm text-zinc-400 hover:text-white transition-colors">Setup Guide</a>
            <a href="#faq" className="text-sm text-zinc-400 hover:text-white transition-colors">FAQ</a>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="border-violet-500/30 text-violet-300 hover:bg-violet-500/10 hover:border-violet-500/50"
            onClick={() => document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" })}
          >
            Get Started
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 px-6">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-violet-600/10 rounded-full blur-[120px]" />
          <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-purple-600/5 rounded-full blur-[80px]" />
        </div>

        <div className="relative max-w-5xl mx-auto text-center">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
            <Badge variant="outline" className="border-violet-500/30 text-violet-300 mb-6 px-4 py-1.5">
              <Star className="w-3 h-3 mr-1.5 fill-violet-400 text-violet-400" />
              Premium Streaming Service
            </Badge>
          </motion.div>

          <motion.h1
            className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.1] mb-6"
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={1}
          >
            Unlimited Entertainment.
            <br />
            <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-fuchsia-400 bg-clip-text text-transparent">
              One Subscription.
            </span>
          </motion.h1>

          <motion.p
            className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed"
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={2}
          >
            Access 20,000+ live channels, 100,000+ movies, and 50,000+ TV shows
            in stunning HD & 4K quality. Stream anywhere, anytime.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={3}
          >
            <Button
              size="lg"
              className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white px-8 py-6 text-base font-semibold shadow-lg shadow-violet-500/20"
              onClick={() => document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" })}
            >
              Start Streaming Now
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-zinc-700 text-zinc-300 hover:bg-zinc-800/50 px-8 py-6 text-base"
              onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}
            >
              Learn More
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div
            className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto"
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={4}
          >
            <div>
              <p className="text-2xl md:text-3xl font-bold text-white">20K+</p>
              <p className="text-sm text-zinc-500 mt-1">Live Channels</p>
            </div>
            <div>
              <p className="text-2xl md:text-3xl font-bold text-white">100K+</p>
              <p className="text-sm text-zinc-500 mt-1">Movies</p>
            </div>
            <div>
              <p className="text-2xl md:text-3xl font-bold text-white">50K+</p>
              <p className="text-sm text-zinc-500 mt-1">TV Shows</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything You Need to Stream</h2>
            <p className="text-zinc-400 text-lg max-w-xl mx-auto">Premium features designed for the ultimate viewing experience</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Tv, title: "20,000+ Live Channels", desc: "Sports, news, entertainment, and international channels from around the world" },
              { icon: Film, title: "Massive VOD Library", desc: "100,000+ movies and 50,000+ TV shows with new content added daily" },
              { icon: Zap, title: "HD & 4K Quality", desc: "Crystal-clear streaming with adaptive bitrate for the best picture quality" },
              { icon: Shield, title: "Anti-Freeze Technology", desc: "Advanced buffering system ensures smooth, uninterrupted playback" },
              { icon: Globe, title: "Multi-Device Support", desc: "Watch on Smart TV, phone, tablet, Fire Stick, or via our web player" },
              { icon: Headphones, title: "24/7 Support", desc: "Dedicated support team available around the clock to help you" },
            ].map((feature, i) => (
              <Card key={i} className="bg-zinc-900/50 border-zinc-800/50 hover:border-violet-500/20 transition-all duration-300 group">
                <CardContent className="p-6">
                  <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center mb-4 group-hover:bg-violet-500/20 transition-colors">
                    <feature.icon className="w-5 h-5 text-violet-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-sm text-zinc-400 leading-relaxed">{feature.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-6 border-t border-white/5 relative">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-600/5 rounded-full blur-[100px]" />
        </div>

        <div className="relative max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Choose Your Plan</h2>
            <p className="text-zinc-400 text-lg max-w-xl mx-auto">All plans include full access to every channel, movie, and show. No hidden fees.</p>
          </div>

          {/* Duration Toggle */}
          <div className="flex justify-center mb-12">
            <div className="inline-flex bg-zinc-900/80 border border-zinc-800/50 rounded-xl p-1.5 gap-1">
              {DURATION_OPTIONS.map((dur) => (
                <button
                  key={dur.months}
                  onClick={() => setSelectedDuration(dur.months)}
                  className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    selectedDuration === dur.months
                      ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-md shadow-violet-500/20"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
                  }`}
                >
                  {dur.label}
                  {dur.months >= 6 && (
                    <span className="ml-1.5 text-[10px] text-violet-300 font-semibold">
                      SAVE {dur.months === 6 ? "33" : "50"}%
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Plan Cards */}
          <div className="grid md:grid-cols-3 gap-6">
            {filteredPlans.map((plan, idx) => {
              const isPopular = plan.devices === 2;
              const TierIcon = TIER_ICONS[idx] || Monitor;
              return (
                <Card
                  key={plan.id}
                  className={`relative bg-zinc-900/50 border transition-all duration-300 hover:scale-[1.02] ${
                    isPopular
                      ? "border-violet-500/50 shadow-lg shadow-violet-500/10"
                      : "border-zinc-800/50 hover:border-zinc-700"
                  }`}
                >
                  {isPopular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-gradient-to-r from-violet-600 to-purple-600 text-white border-0 px-3 py-1">Most Popular</Badge>
                    </div>
                  )}
                  <CardContent className="p-6 pt-8">
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        isPopular ? "bg-violet-500/20" : "bg-zinc-800"
                      }`}>
                        <TierIcon className={`w-5 h-5 ${isPopular ? "text-violet-400" : "text-zinc-400"}`} />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">{plan.tierName}</h3>
                        <p className="text-xs text-zinc-500">{plan.tierDescription}</p>
                      </div>
                    </div>

                    <div className="mb-6">
                      <span className="text-4xl font-bold text-white">${(plan.price / 100).toFixed(2)}</span>
                      <span className="text-zinc-500 ml-1">/{plan.months > 1 ? `${plan.months}mo` : "mo"}</span>
                      {plan.months > 1 && (
                        <p className="text-xs text-zinc-500 mt-1">
                          ${(plan.price / 100 / plan.months).toFixed(2)}/mo effective
                        </p>
                      )}
                    </div>

                    <ul className="space-y-3 mb-8">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-zinc-300">
                          <Check className="w-4 h-4 text-violet-400 mt-0.5 shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <Button
                      className={`w-full ${
                        isPopular
                          ? "bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white shadow-md shadow-violet-500/20"
                          : "bg-zinc-800 hover:bg-zinc-700 text-white"
                      }`}
                      onClick={() => handleSubscribe(plan.id)}
                      disabled={checkoutMutation.isPending}
                    >
                      {checkoutMutation.isPending ? "Processing..." : "Subscribe Now"}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* How to Watch / Setup Section */}
      <section id="how-to-watch" className="py-24 px-6 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How to Watch</h2>
            <p className="text-zinc-400 text-lg max-w-xl mx-auto">Get started in minutes with our simple setup process</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* App-based Setup */}
            <Card className="bg-zinc-900/50 border-zinc-800/50">
              <CardContent className="p-8">
                <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center mb-6">
                  <Tv className="w-6 h-6 text-violet-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">Via Streaming App</h3>
                <p className="text-sm text-zinc-400 mb-6">Use IPTV Smarters Pro on your device</p>
                <ol className="space-y-4">
                  {[
                    "Download IPTV Smarters Pro or Smarters Player Lite",
                    "Select \"Xtream Codes\" login method",
                    "Enter your Username, Password, and URL from your email",
                    "Start watching 20,000+ channels instantly!",
                  ].map((step, i) => (
                    <li key={i} className="flex gap-3 text-sm">
                      <span className="w-6 h-6 rounded-full bg-violet-500/10 text-violet-400 flex items-center justify-center shrink-0 text-xs font-bold">
                        {i + 1}
                      </span>
                      <span className="text-zinc-300 pt-0.5">{step}</span>
                    </li>
                  ))}
                </ol>
                <div className="mt-6 pt-6 border-t border-zinc-800/50">
                  <p className="text-xs text-zinc-500 font-medium mb-2">Compatible Apps:</p>
                  <p className="text-xs text-zinc-400">IPTV Smarters Pro, TiviMate, VLC, GSE Smart, Perfect Player</p>
                </div>
                <a href="/setup" className="mt-4 inline-flex items-center gap-1.5 text-sm text-violet-400 hover:text-violet-300 transition-colors">
                  View full setup guide &rarr;
                </a>
              </CardContent>
            </Card>

            {/* Web Player */}
            <Card className="bg-zinc-900/50 border-zinc-800/50 relative overflow-hidden">
              <div className="absolute top-4 right-4">
                <Badge className="bg-green-500/10 text-green-400 border-green-500/20">No App Needed</Badge>
              </div>
              <CardContent className="p-8">
                <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center mb-6">
                  <Globe className="w-6 h-6 text-violet-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">Via Web Player</h3>
                <p className="text-sm text-zinc-400 mb-6">Stream directly in your browser — works on any device with internet access</p>
                <ol className="space-y-4">
                  {[
                    "Open your browser on any device",
                    "Go to the web player URL below",
                    "Create a playlist name and enter your Username & Password",
                    "Browse channels and start streaming!",
                  ].map((step, i) => (
                    <li key={i} className="flex gap-3 text-sm">
                      <span className="w-6 h-6 rounded-full bg-violet-500/10 text-violet-400 flex items-center justify-center shrink-0 text-xs font-bold">
                        {i + 1}
                      </span>
                      <span className="text-zinc-300 pt-0.5">{step}</span>
                    </li>
                  ))}
                </ol>

                <div className="mt-6 p-4 bg-zinc-800/50 border border-zinc-700/50 rounded-xl">
                  <p className="text-xs text-zinc-500 font-medium mb-2">Web Player URL:</p>
                  <a
                    href="http://162.0.216.135/playlists"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-violet-400 text-sm font-mono hover:text-violet-300 transition-colors break-all"
                  >
                    http://162.0.216.135/playlists
                  </a>
                  <p className="text-xs text-zinc-500 mt-3 flex items-center gap-1.5">
                    <Shield className="w-3 h-3" />
                    Works best with a VPN for optimal performance
                  </p>
                </div>

                <div className="mt-6 pt-6 border-t border-zinc-800/50">
                  <p className="text-xs text-zinc-500 font-medium mb-2">Works on:</p>
                  <p className="text-xs text-zinc-400">Any device with a web browser — PC, Mac, iPhone, Android, tablet, Smart TV browser</p>
                </div>
                <a href="/setup" className="mt-4 inline-flex items-center gap-1.5 text-sm text-violet-400 hover:text-violet-300 transition-colors">
                  View full setup guide &rarr;
                </a>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 px-6 border-t border-white/5">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-6">
            {[
              { q: "What devices are supported?", a: "Viewora TV works on Smart TVs (Samsung, LG, Android TV), Amazon Fire Stick, Apple TV, smartphones (iOS & Android), tablets, PCs, and any device with a web browser via our web player. Compatible apps include TiviMate, IPTV Smarters, and VLC." },
              { q: "How quickly will I receive my credentials?", a: "Instantly! After payment, your login credentials are automatically generated and sent to your email within seconds. No waiting, no manual processing." },
              { q: "What are multi-connection plans?", a: "Multi-connection plans let you stream on multiple devices simultaneously. A 2-connection plan gives you 2 separate sets of credentials so two people can watch different things at the same time. A 4-connection plan supports up to 4 simultaneous streams — perfect for families." },
              { q: "How does the web player work?", a: "The web player lets you stream directly in your browser without downloading any app. Just visit the web player URL, log in with your credentials, and start watching. It works on any device with internet access and is best used with a VPN." },
              { q: "What payment methods do you accept?", a: "We accept all major credit cards, debit cards, and Apple Pay through our secure Stripe payment processor. All transactions are encrypted and secure." },
              { q: "Is there a free trial?", a: "We don't offer free trials, but all plans come with a satisfaction guarantee. If you experience any issues, our support team will work with you to resolve them." },
            ].map((item, i) => (
              <div key={i} className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-6 hover:border-zinc-700/50 transition-colors">
                <h3 className="text-base font-semibold text-white mb-2">{item.q}</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <Play className="w-3 h-3 text-white fill-white" />
            </div>
            <span className="text-sm font-semibold">Viewora<span className="text-violet-400">TV</span></span>
          </div>
          <p className="text-xs text-zinc-500">&copy; {new Date().getFullYear()} Viewora TV. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">Privacy Policy</a>
            <a href="#" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">Terms of Service</a>
            <a href="mailto:info@rayallcompany.business" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
