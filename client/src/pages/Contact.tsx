import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, MessageCircle, Mail, Clock } from "lucide-react";
import { useLocation } from "wouter";
import { usePageView } from "@/hooks/useAnalytics";

export default function Contact() {
  usePageView("contact");
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <Button
          variant="ghost"
          className="mb-8 text-zinc-400 hover:text-white"
          onClick={() => navigate("/")}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>

        <h1 className="text-3xl font-bold mb-2">Contact & Support</h1>
        <p className="text-zinc-400 mb-10">Need help? We're here for you. Reach out through any of the channels below.</p>

        <div className="grid gap-6">
          {/* Telegram */}
          <Card className="bg-zinc-900/50 border-zinc-800/50">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
                  <MessageCircle className="w-6 h-6 text-blue-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-1">Telegram</h3>
                  <p className="text-sm text-zinc-400 mb-3">Fastest response time. Get help with setup, troubleshooting, or general questions.</p>
                  <div className="flex items-center gap-2 text-xs text-zinc-500 mb-4">
                    <Clock className="w-3 h-3" />
                    <span>Typical response: under 1 hour</span>
                  </div>
                  <a
                    href="https://t.me/+EbGpQ2NZyhhhMzYx"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400 text-sm hover:bg-blue-500/20 transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Open Telegram
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* WhatsApp */}
          <Card className="bg-zinc-900/50 border-zinc-800/50">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center shrink-0">
                  <MessageCircle className="w-6 h-6 text-green-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-1">WhatsApp</h3>
                  <p className="text-sm text-zinc-400 mb-3">Convenient messaging support. Send us a message anytime.</p>
                  <div className="flex items-center gap-2 text-xs text-zinc-500 mb-4">
                    <Clock className="w-3 h-3" />
                    <span>Typical response: under 2 hours</span>
                  </div>
                  <a
                    href="https://chat.whatsapp.com/DzL8dDYSjOTE3j59PKP0qf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 text-sm hover:bg-green-500/20 transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Open WhatsApp
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Email */}
          <Card className="bg-zinc-900/50 border-zinc-800/50">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center shrink-0">
                  <Mail className="w-6 h-6 text-violet-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-1">Email</h3>
                  <p className="text-sm text-zinc-400 mb-3">For detailed inquiries, billing questions, or account issues.</p>
                  <div className="flex items-center gap-2 text-xs text-zinc-500 mb-4">
                    <Clock className="w-3 h-3" />
                    <span>Typical response: within 24 hours</span>
                  </div>
                  <a
                    href="mailto:info@rayallcompany.business"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-violet-500/10 border border-violet-500/30 text-violet-400 text-sm hover:bg-violet-500/20 transition-colors"
                  >
                    <Mail className="w-4 h-4" />
                    info@rayallcompany.business
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Common Issues */}
        <div className="mt-12">
          <h2 className="text-xl font-semibold text-white mb-6">Common Issues</h2>
          <div className="space-y-4 text-sm text-zinc-300">
            <div className="bg-zinc-900/30 border border-zinc-800/30 rounded-lg p-4">
              <p className="font-medium text-white mb-1">Didn't receive credentials email?</p>
              <p className="text-zinc-400">Check your spam/junk folder. If still not found, contact us with your payment confirmation and we'll resend.</p>
            </div>
            <div className="bg-zinc-900/30 border border-zinc-800/30 rounded-lg p-4">
              <p className="font-medium text-white mb-1">Channels not loading?</p>
              <p className="text-zinc-400">Try connecting to a VPN (US server recommended). Also verify your credentials are entered correctly — the URL/domain field is case-sensitive.</p>
            </div>
            <div className="bg-zinc-900/30 border border-zinc-800/30 rounded-lg p-4">
              <p className="font-medium text-white mb-1">App not installing on Firestick?</p>
              <p className="text-zinc-400">Make sure you have the "Downloader" app installed first. Enter code 250931, or visit firesticktricks.com/smarter as an alternative.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
