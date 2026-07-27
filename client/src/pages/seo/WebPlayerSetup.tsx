import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Play, ArrowLeft, Globe, Shield, Send, MessageCircle } from "lucide-react";
import { Link } from "wouter";
import { usePageView } from "@/hooks/useAnalytics";

export default function WebPlayerSetup() {
  usePageView("seo_web_player_setup");
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
            <span className="text-violet-400">Web Player</span> — Watch Anywhere, No App Needed
          </h1>
          <p className="text-zinc-400 text-lg mb-8">
            Our web player works on any device with a web browser — no downloads, no installations. Just log in and start watching.
          </p>

          <div className="space-y-8">
            <Card className="bg-gradient-to-br from-violet-500/10 to-purple-500/10 border-violet-500/30">
              <CardContent className="p-6 text-center">
                <Globe className="w-12 h-12 text-violet-400 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-white mb-2">Web Player URL</h2>
                <a href="https://watch.vieworatv.live" target="_blank" rel="noopener noreferrer" className="text-xl font-mono text-violet-300 hover:text-violet-200 underline underline-offset-4">
                  https://watch.vieworatv.live
                </a>
                <p className="text-zinc-400 text-sm mt-4">Works best with a VPN enabled</p>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900/50 border-zinc-800/50">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold text-white mb-4">How to Use the Web Player</h2>
                <ol className="space-y-3 text-zinc-300 list-decimal list-inside">
                  <li>Open any web browser (Chrome, Safari, Firefox, Edge, etc.)</li>
                  <li>Navigate to <strong className="text-violet-300">https://watch.vieworatv.live</strong></li>
                  <li>Create a <strong>Playlist Name</strong> (any name you like)</li>
                  <li>Enter your <strong>Username</strong> from your credentials email</li>
                  <li>Enter your <strong>Password</strong> from your credentials email</li>
                  <li>Click to add your playlist and start browsing channels</li>
                </ol>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900/50 border-zinc-800/50">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold text-white mb-4">What You Need</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-zinc-800/50 rounded-lg">
                    <p className="text-green-400 font-semibold mb-1">You need:</p>
                    <ul className="text-zinc-300 text-sm space-y-1">
                      <li>• Username</li>
                      <li>• Password</li>
                    </ul>
                  </div>
                  <div className="p-4 bg-zinc-800/50 rounded-lg">
                    <p className="text-zinc-500 font-semibold mb-1">You DON'T need:</p>
                    <ul className="text-zinc-500 text-sm space-y-1">
                      <li>• Server URL / Domain</li>
                      <li>• Any app download</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900/50 border-zinc-800/50">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold text-white mb-4">Compatible Devices</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {["Windows PC", "Mac", "iPhone / iPad", "Android Phone", "Smart TV Browser", "Chromebook"].map((device) => (
                    <div key={device} className="p-3 bg-zinc-800/50 rounded-lg text-center text-sm text-zinc-300">
                      {device}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900/50 border-zinc-800/50">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-green-400" /> VPN Recommended
                </h2>
                <p className="text-zinc-300">The web player works best with a VPN enabled. This ensures stable connections and smooth playback regardless of your location.</p>
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

          <div className="mt-12 p-6 bg-zinc-900/50 border border-zinc-800/50 rounded-xl text-center">
            <h3 className="text-lg font-bold text-white mb-2">Need Help?</h3>
            <p className="text-zinc-400 text-sm mb-4">Our support team can walk you through the setup process.</p>
            <div className="flex items-center justify-center gap-4">
              <a href="https://t.me/+EbGpQ2NZyhhhMzYx" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-[#229ED9]/10 border border-[#229ED9]/30 rounded-lg text-[#229ED9] hover:bg-[#229ED9]/20 transition-all text-sm">
                <Send className="w-4 h-4" /> Telegram
              </a>
              <a href="https://chat.whatsapp.com/DzL8dDYSjOTE3j59PKP0qf" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-[#25D366]/10 border border-[#25D366]/30 rounded-lg text-[#25D366] hover:bg-[#25D366]/20 transition-all text-sm">
                <MessageCircle className="w-4 h-4" /> WhatsApp
              </a>
            </div>
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
