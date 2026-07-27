import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Mail, Play, MessageCircle, BookOpen, Globe, CreditCard } from "lucide-react";
import { useLocation } from "wouter";
import { usePageView } from "@/hooks/useAnalytics";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function Success() {
  usePageView("success");
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center px-6">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-green-600/10 rounded-full blur-[120px]" />
      </div>

      <Card className="relative bg-zinc-900/50 border-zinc-800/50 max-w-lg w-full">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>

          <h1 className="text-2xl font-bold text-white mb-3">Payment Received!</h1>
          <p className="text-zinc-400 mb-6 leading-relaxed">
            Your access is now active. We've sent your login credentials to your email address.
          </p>

          <div className="bg-zinc-800/50 rounded-lg p-4 mb-4 border border-zinc-700/50">
            <div className="flex items-center gap-2 text-sm text-zinc-300">
              <Mail className="w-4 h-4 text-violet-400" />
              <span>Check your inbox for username, password & server URL</span>
            </div>
          </div>

          <div className="text-left bg-zinc-800/30 rounded-lg p-4 mb-6 border border-zinc-700/30">
            <h3 className="text-sm font-semibold text-white mb-3">What to do next:</h3>
            <ol className="space-y-2 text-sm text-zinc-400">
              <li className="flex items-start gap-2">
                <span className="text-violet-400 font-semibold">1.</span>
                <span>Check your email for your login credentials</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-violet-400 font-semibold">2.</span>
                <span>Follow our <a href="/setup" className="text-violet-400 hover:underline">Setup Guide</a> to get started on your device</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-violet-400 font-semibold">3.</span>
                <span>Or use the <a href="https://watch.vieworatv.live" target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:underline">Web Player</a> (username & password only, no domain needed)</span>
              </li>
            </ol>
          </div>

          <p className="text-xs text-zinc-500 mb-6">
            Didn't receive an email? Check your spam folder or contact us:
          </p>

          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <a
              href="https://t.me/+EbGpQ2NZyhhhMzYx"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400 text-sm hover:bg-blue-500/20 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              Telegram Support
            </a>
            <a
              href="https://chat.whatsapp.com/DzL8dDYSjOTE3j59PKP0qf"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 text-sm hover:bg-green-500/20 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              WhatsApp Support
            </a>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                onClick={() => navigate("/setup")}
              >
                <BookOpen className="w-4 h-4 mr-2" />
                Setup Guide
              </Button>
              <Button
                className="flex-1 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white"
                onClick={() => navigate("/")}
              >
                <Play className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </div>
            <p className="text-xs text-zinc-500 text-center mt-2">Need to manage your subscription?</p>
            <Button
              variant="outline"
              className="w-full border-zinc-700 text-zinc-400 hover:bg-zinc-800 text-xs"
              onClick={() => {
                toast.info("To manage your subscription, contact us via Telegram or WhatsApp.");
              }}
            >
              <CreditCard className="w-3 h-3 mr-1" />
              Manage Subscription
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
