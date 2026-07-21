import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Tv, Film, Zap, Shield, Globe, Headphones, Check, Play, Star } from "lucide-react";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" as const },
  }),
};

export default function Home() {
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
              Premium IPTV Streaming
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
              { icon: Globe, title: "Multi-Device Support", desc: "Watch on Smart TV, phone, tablet, Fire Stick, or any IPTV player" },
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

        <div className="relative max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Choose Your Plan</h2>
            <p className="text-zinc-400 text-lg max-w-xl mx-auto">All plans include full access to every channel, movie, and show. No hidden fees.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {plansQuery.data?.map((plan) => (
              <Card
                key={plan.id}
                className={`relative bg-zinc-900/50 border transition-all duration-300 hover:scale-[1.02] ${
                  plan.popular
                    ? "border-violet-500/50 shadow-lg shadow-violet-500/10"
                    : "border-zinc-800/50 hover:border-zinc-700"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-violet-600 to-purple-600 text-white border-0 px-3 py-1">Most Popular</Badge>
                  </div>
                )}
                <CardContent className="p-6 pt-8">
                  <h3 className="text-lg font-semibold text-white mb-2">{plan.name}</h3>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-white">${(plan.price / 100).toFixed(2)}</span>
                    <span className="text-zinc-500 ml-1">/{plan.intervalCount > 1 ? `${plan.intervalCount}mo` : "mo"}</span>
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
                      plan.popular
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
            ))}
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
              { q: "What devices are supported?", a: "Viewora TV works on Smart TVs (Samsung, LG, Android TV), Amazon Fire Stick, Apple TV, smartphones (iOS & Android), tablets, PCs, and any device that supports IPTV players like TiviMate, IPTV Smarters, or VLC." },
              { q: "How quickly will I receive my credentials?", a: "Instantly! After payment, your login credentials are automatically generated and sent to your email within seconds. No waiting, no manual processing." },
              { q: "Can I use it on multiple devices?", a: "Each subscription supports one active connection at a time. If you need multiple simultaneous streams, please contact our support team for multi-device plans." },
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
