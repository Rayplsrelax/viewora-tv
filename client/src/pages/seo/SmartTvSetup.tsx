import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Play, ArrowLeft, Tv, Shield, Send, MessageCircle } from "lucide-react";
import { Link } from "wouter";
import { usePageView } from "@/hooks/useAnalytics";

export default function SmartTvSetup() {
  usePageView("seo_smart_tv_setup");
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
            How to Set Up Viewora TV on <span className="text-violet-400">Smart TV</span>
          </h1>
          <p className="text-zinc-400 text-lg mb-8">
            Set up Viewora TV on Samsung, LG, Android TV, or any Smart TV. Works with IPTV Smarters, TiviMate, and the built-in web browser.
          </p>

          <div className="space-y-8">
            <Card className="bg-zinc-900/50 border-zinc-800/50">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold text-white mb-4">Option 1: Using IPTV Smarters (Recommended)</h2>
                <p className="text-zinc-300 mb-4">Most Smart TVs support IPTV Smarters from their app store.</p>
                <ol className="space-y-3 text-zinc-300 list-decimal list-inside">
                  <li>Open your TV's app store (Samsung: Smart Hub, LG: LG Content Store, Android TV: Google Play Store)</li>
                  <li>Search for <strong>"IPTV Smarters Pro"</strong> or <strong>"Smarters Player Lite"</strong></li>
                  <li>Install and open the app</li>
                  <li>Select <strong>"Login with Xtream Codes API"</strong></li>
                  <li>Enter your Name (any name), Username, Password, and Server URL from your credentials email</li>
                  <li>Press "Add User" and start streaming</li>
                </ol>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900/50 border-zinc-800/50">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold text-white mb-4">Option 2: Using TiviMate (Android TV)</h2>
                <p className="text-zinc-300 mb-4">If you have an Android TV (Sony, Nvidia Shield, Xiaomi Mi Box, etc.):</p>
                <ol className="space-y-3 text-zinc-300 list-decimal list-inside">
                  <li>Install <strong>TiviMate</strong> from the Google Play Store</li>
                  <li>Open TiviMate and select "Add Playlist"</li>
                  <li>Choose <strong>"Xtream Codes"</strong></li>
                  <li>Enter your Server URL, Username, and Password from your credentials email</li>
                  <li>Save and enjoy your channels</li>
                </ol>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900/50 border-zinc-800/50">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold text-white mb-4">Option 3: Web Player (Any Smart TV with Browser)</h2>
                <p className="text-zinc-300 mb-4">If your TV has a web browser, you can use our web player directly:</p>
                <ol className="space-y-3 text-zinc-300 list-decimal list-inside">
                  <li>Open the web browser on your Smart TV</li>
                  <li>Navigate to <strong className="text-violet-300">https://watch.vieworatv.live/login</strong></li>
                  <li>Create a playlist name and enter your Username and Password</li>
                  <li>Browse channels and start watching</li>
                </ol>
                <p className="text-zinc-400 text-sm mt-4">Note: Web player only requires Username and Password — no server URL needed.</p>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900/50 border-zinc-800/50">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-green-400" /> VPN Recommended
                </h2>
                <p className="text-zinc-300">For the best streaming experience, we recommend using a VPN on your router or directly on your Smart TV if supported.</p>
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
