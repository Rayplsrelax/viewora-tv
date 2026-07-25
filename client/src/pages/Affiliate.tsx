import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, Gift, Users, TrendingUp, Copy, Check, ArrowLeft, Star } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import { toast } from "sonner";

export default function Affiliate() {
  const [copiedExample, setCopiedExample] = useState(false);

  const copyExample = () => {
    navigator.clipboard.writeText("https://vieworatv.live?ref=YOUR_CODE");
    setCopiedExample(true);
    toast.success("Example link copied!");
    setTimeout(() => setCopiedExample(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Header */}
      <nav className="border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white">
                <ArrowLeft className="w-4 h-4 mr-1" /> Home
              </Button>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <Play className="w-3.5 h-3.5 text-white fill-white" />
            </div>
            <span className="text-lg font-bold tracking-tight">
              Viewora<span className="text-violet-400">TV</span>
            </span>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-16">
        {/* Hero */}
        <div className="text-center mb-16">
          <Badge variant="outline" className="border-violet-500/30 text-violet-300 mb-4 px-3 py-1">
            <Gift className="w-3 h-3 mr-1.5" /> Referral Programme
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Earn Free Streaming
          </h1>
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
            Share Viewora TV with friends and earn service credits. The more people you refer, the more you save.
          </p>
        </div>

        {/* How It Works */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <Card className="bg-zinc-900/50 border-zinc-800/50 text-center">
            <CardContent className="p-6">
              <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-violet-400" />
              </div>
              <h3 className="font-semibold text-white mb-2">1. Share Your Link</h3>
              <p className="text-sm text-zinc-400">
                Get your unique referral code and share it with friends, family, or your audience.
              </p>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900/50 border-zinc-800/50 text-center">
            <CardContent className="p-6">
              <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-6 h-6 text-violet-400" />
              </div>
              <h3 className="font-semibold text-white mb-2">2. They Subscribe</h3>
              <p className="text-sm text-zinc-400">
                When someone uses your link and subscribes, we track the referral automatically.
              </p>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900/50 border-zinc-800/50 text-center">
            <CardContent className="p-6">
              <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center mx-auto mb-4">
                <Gift className="w-6 h-6 text-violet-400" />
              </div>
              <h3 className="font-semibold text-white mb-2">3. Earn Rewards</h3>
              <p className="text-sm text-zinc-400">
                Earn service credits for each successful referral. Stack them up for free months!
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Reward Tiers */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-center mb-8">Reward Structure</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-zinc-900/50 border-violet-500/20">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Star className="w-5 h-5 text-violet-400" />
                  <h3 className="font-semibold text-white">Per Referral Credit</h3>
                </div>
                <p className="text-sm text-zinc-400 mb-3">
                  For each person who subscribes using your referral code and stays active for at least 14 days, you earn a service credit.
                </p>
                <Badge className="bg-violet-500/10 text-violet-300 border-violet-500/20">
                  1 Active Referral = 1 Service Credit
                </Badge>
              </CardContent>
            </Card>
            <Card className="bg-zinc-900/50 border-violet-500/20">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Gift className="w-5 h-5 text-violet-400" />
                  <h3 className="font-semibold text-white">Free Month Bonus</h3>
                </div>
                <p className="text-sm text-zinc-400 mb-3">
                  Once you accumulate 3 qualifying referrals (each active for 14+ days), you earn a full free month of service.
                </p>
                <Badge className="bg-violet-500/10 text-violet-300 border-violet-500/20">
                  3 Active Referrals = 1 Free Month
                </Badge>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* How to Use */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-center mb-8">How to Use Your Referral Link</h2>
          <Card className="bg-zinc-900/50 border-zinc-800/50">
            <CardContent className="p-6 space-y-4">
              <p className="text-sm text-zinc-400">
                Your referral link follows this format:
              </p>
              <div className="flex items-center gap-2 bg-zinc-800/50 rounded-lg p-3 border border-zinc-700/50">
                <code className="text-sm text-violet-300 flex-1 font-mono">
                  https://vieworatv.live?ref=YOUR_CODE
                </code>
                <Button variant="ghost" size="sm" onClick={copyExample} className="text-zinc-400 hover:text-white shrink-0">
                  {copiedExample ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
              <p className="text-sm text-zinc-400">
                Replace <code className="text-violet-300">YOUR_CODE</code> with the referral code provided to you. The code persists for 30 days in the visitor's browser, so even if they don't subscribe immediately, you'll still get credit.
              </p>
              <p className="text-sm text-zinc-400">
                You can also share the code directly — visitors can enter it on the trial request form or at checkout.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Rules */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-center mb-8">Programme Rules</h2>
          <Card className="bg-zinc-900/50 border-zinc-800/50">
            <CardContent className="p-6">
              <ul className="space-y-3 text-sm text-zinc-400">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-violet-400 mt-0.5 shrink-0" />
                  <span>Referrals must be genuine new customers — self-referrals or duplicate accounts are not eligible.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-violet-400 mt-0.5 shrink-0" />
                  <span>The referred customer must remain an active subscriber for at least 14 days for the referral to qualify.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-violet-400 mt-0.5 shrink-0" />
                  <span>Service credits are applied to your account manually by our team within 7 business days of qualifying.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-violet-400 mt-0.5 shrink-0" />
                  <span>Free month rewards are applied as an extension to your current subscription period.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-violet-400 mt-0.5 shrink-0" />
                  <span>We reserve the right to pause or modify the programme at any time. Existing earned credits will be honoured.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-violet-400 mt-0.5 shrink-0" />
                  <span>To become an affiliate, contact us via Telegram or WhatsApp and we'll set up your referral code.</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* CTA */}
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to Start Earning?</h2>
          <p className="text-zinc-400 mb-6">Contact us to get your unique referral code and start earning free streaming.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="https://t.me/+EbGpQ2NZyhhhMzYx"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400 text-sm hover:bg-blue-500/20 transition-colors"
            >
              Contact on Telegram
            </a>
            <a
              href="https://chat.whatsapp.com/DzL8dDYSjOTE3j59PKP0qf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 text-sm hover:bg-green-500/20 transition-colors"
            >
              Contact on WhatsApp
            </a>
          </div>
        </div>
      </main>

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
            <Link href="/" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">Home</Link>
            <a href="/trial" className="text-xs text-violet-400 hover:text-violet-300 transition-colors">Free Trial</a>
            <a href="/terms" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
