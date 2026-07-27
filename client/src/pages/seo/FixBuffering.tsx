import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Play, ArrowLeft, Shield, Wifi, Zap, Send, MessageCircle } from "lucide-react";
import { Link } from "wouter";
import { usePageView } from "@/hooks/useAnalytics";

export default function FixBuffering() {
  usePageView("seo_fix_buffering");
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <Play className="w-4 h-4 text-white fill-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">Viewora<span className="text-violet-400">TV</span></span>
          </Link>
          <Link href="/setup">
            <Button variant="outline" size="sm" className="border-violet-500/30 text-violet-300 hover:bg-violet-500/10">
              <ArrowLeft className="w-4 h-4 mr-1" /> All Guides
            </Button>
          </Link>
        </div>
      </nav>

      <section className="pt-28 pb-12 px-6">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            How to <span className="text-violet-400">Fix Buffering</span> & Improve Stream Quality
          </h1>
          <p className="text-zinc-400 text-lg mb-8">
            Experiencing buffering or freezing? Here are proven solutions to improve your streaming experience with Viewora TV.
          </p>

          <div className="space-y-8">
            <Card className="bg-zinc-900/50 border-zinc-800/50">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-green-400" />
                  Solution 1: Use a VPN (Most Effective)
                </h2>
                <p className="text-zinc-300 mb-4">The most common cause of buffering is ISP throttling. Using a VPN prevents your internet provider from slowing down streaming traffic.</p>
                <div className="p-4 bg-green-500/5 border border-green-500/20 rounded-lg">
                  <p className="text-green-300 text-sm font-medium">This fixes buffering for 90% of users. Connect to a server close to your location for best speeds.</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900/50 border-zinc-800/50">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Wifi className="w-5 h-5 text-blue-400" />
                  Solution 2: Improve Your Internet Connection
                </h2>
                <ul className="space-y-3 text-zinc-300">
                  <li className="flex items-start gap-2"><span className="text-violet-400 mt-1">•</span><span><strong>Use ethernet:</strong> A wired connection is always more stable than WiFi</span></li>
                  <li className="flex items-start gap-2"><span className="text-violet-400 mt-1">•</span><span><strong>Move closer to router:</strong> If using WiFi, reduce the distance to your router</span></li>
                  <li className="flex items-start gap-2"><span className="text-violet-400 mt-1">•</span><span><strong>Use 5GHz WiFi:</strong> Switch from 2.4GHz to 5GHz band for faster speeds</span></li>
                  <li className="flex items-start gap-2"><span className="text-violet-400 mt-1">•</span><span><strong>Minimum speed:</strong> We recommend at least 25 Mbps for HD and 50 Mbps for 4K</span></li>
                  <li className="flex items-start gap-2"><span className="text-violet-400 mt-1">•</span><span><strong>Restart router:</strong> Power cycle your router to clear any congestion</span></li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900/50 border-zinc-800/50">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-400" />
                  Solution 3: Optimize Your Streaming App
                </h2>
                <ul className="space-y-3 text-zinc-300">
                  <li className="flex items-start gap-2"><span className="text-violet-400 mt-1">•</span><span><strong>Clear app cache:</strong> Go to Settings → Apps → IPTV Smarters → Clear Cache</span></li>
                  <li className="flex items-start gap-2"><span className="text-violet-400 mt-1">•</span><span><strong>Change player:</strong> In IPTV Smarters, try switching between VLC, ExoPlayer, or the built-in player</span></li>
                  <li className="flex items-start gap-2"><span className="text-violet-400 mt-1">•</span><span><strong>Lower quality:</strong> If available, switch from 4K to HD to reduce bandwidth requirements</span></li>
                  <li className="flex items-start gap-2"><span className="text-violet-400 mt-1">•</span><span><strong>Close background apps:</strong> Other apps using bandwidth can cause buffering</span></li>
                  <li className="flex items-start gap-2"><span className="text-violet-400 mt-1">•</span><span><strong>Update the app:</strong> Make sure you're running the latest version</span></li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900/50 border-zinc-800/50">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold text-white mb-4">Solution 4: Try the Web Player</h2>
                <p className="text-zinc-300 mb-4">If apps are giving you trouble, try our web player as an alternative. It works on any device with a browser.</p>
                <a href="https://watch.vieworatv.live/login" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-violet-500/10 border border-violet-500/30 rounded-lg text-violet-300 hover:bg-violet-500/20 transition-all">
                  <Play className="w-4 h-4" /> Open Web Player
                </a>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900/50 border-zinc-800/50">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold text-white mb-4">Still Having Issues?</h2>
                <p className="text-zinc-300 mb-4">If none of the above solutions work, the issue may be temporary server maintenance. Contact our support team and we'll help you troubleshoot.</p>
                <div className="flex items-center gap-4">
                  <a href="https://t.me/+EbGpQ2NZyhhhMzYx" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-[#229ED9]/10 border border-[#229ED9]/30 rounded-lg text-[#229ED9] hover:bg-[#229ED9]/20 transition-all text-sm">
                    <Send className="w-4 h-4" /> Telegram Support
                  </a>
                  <a href="https://chat.whatsapp.com/DzL8dDYSjOTE3j59PKP0qf" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-[#25D366]/10 border border-[#25D366]/30 rounded-lg text-[#25D366] hover:bg-[#25D366]/20 transition-all text-sm">
                    <MessageCircle className="w-4 h-4" /> WhatsApp Support
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-12 text-center">
            <p className="text-zinc-400 mb-4">Don't have a subscription yet?</p>
            <Link href="/#pricing">
              <Button className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white px-8 py-3">
                Get Started — From £14.99/mo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <footer className="py-8 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="text-xs text-zinc-500">&copy; {new Date().getFullYear()} Viewora TV</span>
          <div className="flex items-center gap-4">
            <Link href="/setup" className="text-xs text-zinc-500 hover:text-zinc-300">Setup Guide</Link>
            <Link href="/terms" className="text-xs text-zinc-500 hover:text-zinc-300">Terms</Link>
            <Link href="/privacy" className="text-xs text-zinc-500 hover:text-zinc-300">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
