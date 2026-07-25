import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Play, ArrowLeft, Download, Tv, Shield, ExternalLink, Send, MessageCircle } from "lucide-react";
import { Link } from "wouter";
import { usePageView } from "@/hooks/useAnalytics";

export default function FirestickSetup() {
  usePageView("seo_firestick_setup");
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
            How to Set Up Viewora TV on <span className="text-violet-400">Amazon Fire Stick</span>
          </h1>
          <p className="text-zinc-400 text-lg mb-8">
            Complete step-by-step guide to installing and configuring Viewora TV on your Amazon Fire Stick or Fire TV device. Takes less than 5 minutes.
          </p>

          <div className="space-y-8">
            <Card className="bg-zinc-900/50 border-zinc-800/50">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-violet-500/20 text-violet-400 flex items-center justify-center text-sm font-bold">1</span>
                  Install the Downloader App
                </h2>
                <p className="text-zinc-300 mb-4">From your Fire Stick home screen, go to the Search icon and type <strong>"Downloader"</strong>. Install the orange Downloader app by AFTVnews.</p>
                <div className="p-4 bg-zinc-800/50 rounded-lg border border-zinc-700/50">
                  <p className="text-sm text-zinc-400"><strong>Important:</strong> Before using Downloader, go to Settings → My Fire TV → Developer Options → Install Unknown Apps → enable Downloader.</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900/50 border-zinc-800/50">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-violet-500/20 text-violet-400 flex items-center justify-center text-sm font-bold">2</span>
                  Enter the Download Code
                </h2>
                <p className="text-zinc-300 mb-4">Open the Downloader app and enter the code:</p>
                <div className="p-4 bg-gradient-to-r from-violet-500/10 to-purple-500/10 border border-violet-500/30 rounded-xl text-center">
                  <span className="text-3xl font-mono font-bold text-violet-300">250931</span>
                </div>
                <p className="text-zinc-400 text-sm mt-4">If this code doesn't work, try entering: <strong className="text-violet-300">firesticktricks.com/smarter</strong></p>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900/50 border-zinc-800/50">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-violet-500/20 text-violet-400 flex items-center justify-center text-sm font-bold">3</span>
                  Install IPTV Smarters Pro
                </h2>
                <p className="text-zinc-300 mb-4">After the page loads, scroll down to find our recommended apps. Select <strong>"IPTV Smarters Pro"</strong> and install it.</p>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900/50 border-zinc-800/50">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-violet-500/20 text-violet-400 flex items-center justify-center text-sm font-bold">4</span>
                  Log In with Your Credentials
                </h2>
                <p className="text-zinc-300 mb-4">Open IPTV Smarters Pro and select <strong>"Login with Xtream Codes API"</strong>. Enter your details:</p>
                <ul className="space-y-3 text-zinc-300">
                  <li className="flex items-start gap-2"><span className="text-violet-400 mt-1">•</span><span><strong>Name:</strong> Any name you prefer (e.g., "My TV")</span></li>
                  <li className="flex items-start gap-2"><span className="text-violet-400 mt-1">•</span><span><strong>Username:</strong> From your credentials email</span></li>
                  <li className="flex items-start gap-2"><span className="text-violet-400 mt-1">•</span><span><strong>Password:</strong> From your credentials email</span></li>
                  <li className="flex items-start gap-2"><span className="text-violet-400 mt-1">•</span><span><strong>URL:</strong> The Server/Domain from your credentials email</span></li>
                </ul>
                <p className="text-zinc-400 text-sm mt-4">Press "Add User" and you're ready to stream!</p>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900/50 border-zinc-800/50">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-green-400" />
                  VPN Recommended
                </h2>
                <p className="text-zinc-300">For the best streaming experience on Fire Stick, we recommend using a VPN. This helps with connection stability and ensures smooth playback.</p>
              </CardContent>
            </Card>
          </div>

          {/* CTA */}
          <div className="mt-12 text-center">
            <p className="text-zinc-400 mb-4">Don't have a subscription yet?</p>
            <Link href="/#pricing">
              <Button className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white px-8 py-3">
                Get Started — From £14.99/mo
              </Button>
            </Link>
          </div>

          {/* Support */}
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
