import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, Tv, Globe, Shield, Smartphone, Monitor, ArrowLeft, ExternalLink, Download, MessageCircle, Send } from "lucide-react";
import { Link } from "wouter";
import { usePageView } from "@/hooks/useAnalytics";

export default function Setup() {
  usePageView("setup");
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                <Play className="w-4 h-4 text-white fill-white" />
              </div>
              <span className="text-xl font-bold tracking-tight">
                Viewora<span className="text-violet-400">TV</span>
              </span>
            </Link>
          </div>
          <Link href="/">
            <Button
              variant="outline"
              size="sm"
              className="border-violet-500/30 text-violet-300 hover:bg-violet-500/10 hover:border-violet-500/50"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Home
            </Button>
          </Link>
        </div>
      </nav>

      {/* Header */}
      <section className="pt-28 pb-12 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">
            Setup <span className="text-violet-400">Guide</span>
          </h1>
          <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
            Follow these simple instructions to start streaming on your preferred device. Choose your method below.
          </p>
          <div className="flex items-center justify-center gap-4 mt-6">
            <a href="https://t.me/+EbGpQ2NZyhhhMzYx" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-[#229ED9]/10 border border-[#229ED9]/30 rounded-lg text-[#229ED9] hover:bg-[#229ED9]/20 transition-all text-sm">
              <Send className="w-4 h-4" /> Telegram Support
            </a>
            <a href="https://chat.whatsapp.com/DzL8dDYSjOTE3j59PKP0qf" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-[#25D366]/10 border border-[#25D366]/30 rounded-lg text-[#25D366] hover:bg-[#25D366]/20 transition-all text-sm">
              <MessageCircle className="w-4 h-4" /> WhatsApp Support
            </a>
          </div>
        </div>
      </section>

      {/* Web Player Section */}
      <section className="py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
              <Globe className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Web Player</h2>
              <p className="text-sm text-zinc-400">No app needed — works on any device with internet</p>
            </div>
            <Badge className="ml-auto bg-green-500/10 text-green-400 border-green-500/20">Easiest</Badge>
          </div>

          <Card className="bg-zinc-900/50 border-zinc-800/50">
            <CardContent className="p-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">How to Use</h3>
                  <ol className="space-y-4">
                    {[
                      "Open any web browser on your device (Chrome, Safari, Firefox, etc.)",
                      "Go to the Web Player URL below",
                      "Create a playlist name of your choice",
                      "Enter the Username and Password from your email",
                      "Start streaming — no domain/URL needed for web player!",
                    ].map((step, i) => (
                      <li key={i} className="flex gap-3 text-sm">
                        <span className="w-6 h-6 rounded-full bg-green-500/10 text-green-400 flex items-center justify-center shrink-0 text-xs font-bold">
                          {i + 1}
                        </span>
                        <span className="text-zinc-300 pt-0.5">{step}</span>
                      </li>
                    ))}
                  </ol>

                  <div className="mt-6 p-4 bg-zinc-800/50 border border-zinc-700/50 rounded-xl">
                    <p className="text-xs text-zinc-500 font-medium mb-2">Web Player URL:</p>
                    <a
                      href="https://watch.vieworatv.live"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-violet-400 text-sm font-mono hover:text-violet-300 transition-colors break-all flex items-center gap-2"
                    >
                      https://watch.vieworatv.live
                      <ExternalLink className="w-3 h-3 shrink-0" />
                    </a>
                  </div>

                  <div className="mt-4 p-3 bg-amber-500/5 border border-amber-500/20 rounded-lg">
                    <p className="text-xs text-amber-300 flex items-center gap-1.5">
                      <Shield className="w-3 h-3" />
                      Works best with a VPN for optimal performance
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">What You Need</h3>
                  <div className="space-y-3">
                    <div className="p-3 bg-zinc-800/50 rounded-lg">
                      <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Username</p>
                      <p className="text-sm text-zinc-300">From your credentials email</p>
                    </div>
                    <div className="p-3 bg-zinc-800/50 rounded-lg">
                      <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Password</p>
                      <p className="text-sm text-zinc-300">From your credentials email</p>
                    </div>
                    <div className="p-3 bg-zinc-800/50 rounded-lg border border-green-500/20">
                      <p className="text-xs text-green-400 uppercase tracking-wider mb-1">Domain / URL</p>
                      <p className="text-sm text-zinc-300">NOT needed for web player</p>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-zinc-800/50">
                    <p className="text-xs text-zinc-500 font-medium mb-2">Works on:</p>
                    <p className="text-xs text-zinc-400">PC, Mac, iPhone, Android, Tablet, Smart TV browser — any device with internet access</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* App Setup Section */}
      <section className="py-12 px-6 border-t border-white/5">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
              <Tv className="w-5 h-5 text-violet-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">App Setup</h2>
              <p className="text-sm text-zinc-400">Use IPTV Smarters Pro on your streaming device</p>
            </div>
          </div>

          {/* 3 Easy Steps Visual */}
          <Card className="bg-zinc-900/50 border-zinc-800/50 mb-8">
            <CardContent className="p-8">
              <h3 className="text-xl font-bold text-center text-white mb-8">3 Easy Steps</h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-violet-500/20 text-violet-400 flex items-center justify-center mx-auto mb-4 text-xl font-bold">1</div>
                  <h4 className="text-sm font-semibold text-white mb-2">Download the App</h4>
                  <p className="text-xs text-zinc-400">Get IPTV Smarters Pro or Smarters Player Lite on your device</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-violet-500/20 text-violet-400 flex items-center justify-center mx-auto mb-4 text-xl font-bold">2</div>
                  <h4 className="text-sm font-semibold text-white mb-2">Select Xtream Codes</h4>
                  <p className="text-xs text-zinc-400">Choose "Xtream Codes" or "Login with Xtream Codes API"</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-violet-500/20 text-violet-400 flex items-center justify-center mx-auto mb-4 text-xl font-bold">3</div>
                  <h4 className="text-sm font-semibold text-white mb-2">Enter Your Credentials</h4>
                  <p className="text-xs text-zinc-400">Use the Username, Password, and URL from your email</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Instructions by Device */}
          <div className="space-y-6">
            {/* Firestick */}
            <Card className="bg-zinc-900/50 border-zinc-800/50">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                    <Tv className="w-4 h-4 text-orange-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">Amazon Fire Stick / Fire TV</h3>
                </div>
                <ol className="space-y-4">
                  {[
                    { text: "Install the \"Downloader\" app from the Amazon App Store" },
                    { text: "Open Downloader and enter the code: ", highlight: "250931" },
                    { text: "If the code doesn't work, enter: ", highlight: "firesticktricks.com/smarter" },
                    { text: "Scroll down and select \"IPTV Smarters Pro\"" },
                    { text: "Once installed, open the app and select \"Login with Xtream Codes API\"" },
                    { text: "Enter your credentials from the email:", sub: true },
                  ].map((step, i) => (
                    <li key={i} className="flex gap-3 text-sm">
                      <span className="w-6 h-6 rounded-full bg-orange-500/10 text-orange-400 flex items-center justify-center shrink-0 text-xs font-bold">
                        {i + 1}
                      </span>
                      <span className="text-zinc-300 pt-0.5">
                        {step.text}
                        {step.highlight && <code className="text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded text-xs ml-1">{step.highlight}</code>}
                      </span>
                    </li>
                  ))}
                </ol>

                <div className="mt-4 ml-9 p-4 bg-zinc-800/50 border border-zinc-700/50 rounded-xl">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-xs text-zinc-500 uppercase mb-1">Name</p>
                      <p className="text-zinc-300">Any name you prefer</p>
                    </div>
                    <div>
                      <p className="text-xs text-zinc-500 uppercase mb-1">Username</p>
                      <p className="text-zinc-300">From your email</p>
                    </div>
                    <div>
                      <p className="text-xs text-zinc-500 uppercase mb-1">Password</p>
                      <p className="text-zinc-300">From your email</p>
                    </div>
                    <div>
                      <p className="text-xs text-zinc-500 uppercase mb-1">URL / Domain</p>
                      <p className="text-violet-400 font-mono text-xs">From your email</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Smart TV / Android TV */}
            <Card className="bg-zinc-900/50 border-zinc-800/50">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <Monitor className="w-4 h-4 text-blue-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">Smart TV / Android TV</h3>
                </div>
                <ol className="space-y-4">
                  {[
                    "Search for \"IPTV Smarters Pro\" in your TV's app store (Google Play Store on Android TV)",
                    "Install and open the app",
                    "Select \"Login with Xtream Codes API\"",
                    "Enter your Name (any name), Username, Password, and URL from your email",
                    "Press \"Add User\" and start streaming!",
                  ].map((step, i) => (
                    <li key={i} className="flex gap-3 text-sm">
                      <span className="w-6 h-6 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0 text-xs font-bold">
                        {i + 1}
                      </span>
                      <span className="text-zinc-300 pt-0.5">{step}</span>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>

            {/* iOS */}
            <Card className="bg-zinc-900/50 border-zinc-800/50">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-lg bg-zinc-500/10 flex items-center justify-center">
                    <Smartphone className="w-4 h-4 text-zinc-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">iPhone / iPad (iOS)</h3>
                </div>
                <ol className="space-y-4">
                  {[
                    "Open the App Store and search for \"Smarters Player Lite\"",
                    "Download and install the app",
                    "Open the app and select \"Add User\"",
                    "Choose \"Xtream Codes\" as the playlist type",
                    "Enter your Name (any name), Username, Password, and URL from your email",
                    "Tap \"Add User\" and enjoy streaming!",
                  ].map((step, i) => (
                    <li key={i} className="flex gap-3 text-sm">
                      <span className="w-6 h-6 rounded-full bg-zinc-500/10 text-zinc-400 flex items-center justify-center shrink-0 text-xs font-bold">
                        {i + 1}
                      </span>
                      <span className="text-zinc-300 pt-0.5">{step}</span>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>

            {/* Android */}
            <Card className="bg-zinc-900/50 border-zinc-800/50">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                    <Smartphone className="w-4 h-4 text-green-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">Android Phone / Tablet</h3>
                </div>
                <ol className="space-y-4">
                  {[
                    "Visit https://www.iptvsmarters.com/ in your browser and download the APK",
                    "Alternatively, search \"IPTV Smarters Pro\" on the Google Play Store",
                    "Open the app and select \"Add Your Playlist\"",
                    "Choose \"Login with Xtream Codes API\"",
                    "Enter your Name (any name), Username, Password, and URL from your email",
                    "Tap \"Add User\" and start watching!",
                  ].map((step, i) => (
                    <li key={i} className="flex gap-3 text-sm">
                      <span className="w-6 h-6 rounded-full bg-green-500/10 text-green-400 flex items-center justify-center shrink-0 text-xs font-bold">
                        {i + 1}
                      </span>
                      <span className="text-zinc-300 pt-0.5">{step}</span>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Important Notes */}
      <section className="py-12 px-6 border-t border-white/5">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl font-bold text-white mb-6">Important Notes</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-zinc-900/50 border border-zinc-800/50 rounded-xl">
              <h4 className="text-sm font-semibold text-white mb-2">All Apps Work Best with VPN</h4>
              <p className="text-xs text-zinc-400">For the best streaming experience, we recommend using a VPN. This helps with connection stability and access to all content.</p>
            </div>
            <div className="p-4 bg-zinc-900/50 border border-zinc-800/50 rounded-xl">
              <h4 className="text-sm font-semibold text-white mb-2">Credentials from Email</h4>
              <p className="text-xs text-zinc-400">Your Username, Password, and Server URL/Domain are sent to your email immediately after purchase. Check your spam folder if you don't see it.</p>
            </div>
            <div className="p-4 bg-zinc-900/50 border border-zinc-800/50 rounded-xl">
              <h4 className="text-sm font-semibold text-white mb-2">Web Player vs Apps</h4>
              <p className="text-xs text-zinc-400">The web player only needs Username and Password. Apps require Username, Password, AND the Server URL/Domain from your email.</p>
            </div>
            <div className="p-4 bg-zinc-900/50 border border-zinc-800/50 rounded-xl">
              <h4 className="text-sm font-semibold text-white mb-2">Need Help?</h4>
              <p className="text-xs text-zinc-400">Contact us at <a href="mailto:info@rayallcompany.business" className="text-violet-400 hover:text-violet-300">info@rayallcompany.business</a> and we'll get you set up.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom Support CTA */}
      <section className="py-12 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="p-8 bg-gradient-to-br from-violet-500/5 to-purple-600/5 border border-violet-500/20 rounded-2xl">
            <h3 className="text-xl font-bold text-white mb-2">Still Need Help?</h3>
            <p className="text-zinc-400 text-sm mb-6">Our support team is available to help you get set up. Reach out anytime.</p>
            <div className="flex items-center justify-center gap-4">
              <a href="https://t.me/+EbGpQ2NZyhhhMzYx" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#229ED9] rounded-lg text-white font-medium hover:bg-[#229ED9]/80 transition-all text-sm">
                <Send className="w-4 h-4" /> Join Telegram
              </a>
              <a href="https://chat.whatsapp.com/DzL8dDYSjOTE3j59PKP0qf" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#25D366] rounded-lg text-white font-medium hover:bg-[#25D366]/80 transition-all text-sm">
                <MessageCircle className="w-4 h-4" /> Join WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Trial CTA */}
      <section className="py-8 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm text-zinc-400 mb-3">Want to test before you buy?</p>
          <a href="/trial" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-violet-500/10 border border-violet-500/30 text-violet-300 text-sm hover:bg-violet-500/20 transition-colors">
            Request a Free Trial
          </a>
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
            <a href="/trial" className="text-xs text-violet-400 hover:text-violet-300 transition-colors">Free Trial</a>
            <Link href="/" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">Home</Link>
            <a href="mailto:info@rayallcompany.business" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
