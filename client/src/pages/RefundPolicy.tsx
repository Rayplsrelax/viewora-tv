import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

export default function RefundPolicy() {
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

        <h1 className="text-3xl font-bold mb-2">Refund Policy</h1>
        <p className="text-sm text-zinc-500 mb-10">Last updated: {new Date().toLocaleDateString("en-GB", { month: "long", day: "numeric", year: "numeric" })}</p>

        <div className="space-y-8 text-sm text-zinc-300 leading-relaxed">
          <section className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-3">Summary</h2>
            <p className="text-base font-medium text-zinc-200">All sales are final once access credentials have been delivered or activated. No refunds will be issued after credential delivery.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">Why No Refunds?</h2>
            <p>Due to the digital nature of our service, once login credentials are generated and delivered to your email, the service has been fully rendered. Credentials are created instantly and cannot be "returned" like a physical product. This policy protects both our business and our existing customers.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">Before You Purchase</h2>
            <p className="mb-3">Please verify the following before completing your purchase:</p>
            <ul className="space-y-2 text-zinc-400">
              <li className="flex items-start gap-2">
                <span className="text-violet-400 mt-1">•</span>
                <span>Your device is compatible (see our <a href="/setup" className="text-violet-400 hover:underline">Setup Guide</a> for supported devices)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-violet-400 mt-1">•</span>
                <span>You have a stable internet connection (minimum 10 Mbps recommended for HD)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-violet-400 mt-1">•</span>
                <span>You understand how to install and use a compatible streaming app</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-violet-400 mt-1">•</span>
                <span>You have access to a VPN if required for optimal performance in your region</span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">Setup Assistance</h2>
            <p>If you are having trouble setting up or using the service, our support team is available to help you get connected. Many issues can be resolved with proper configuration. Contact us before assuming the service doesn't work.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">Exceptions</h2>
            <p>In rare cases where credentials were not delivered due to a system error (and no access was provided), we may issue a refund or re-deliver credentials at our discretion. Contact support with your payment confirmation if this occurs.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">Cancellation</h2>
            <p>You may cancel your subscription at any time to prevent future billing. Cancellation stops the next renewal but does not refund the current active period. Your access remains active until the end of your current billing cycle.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">Contact Support</h2>
            <p>If you need help or have questions about your purchase:</p>
            <div className="mt-4 flex flex-col sm:flex-row gap-3">
              <a
                href="https://t.me/+EbGpQ2NZyhhhMzYx"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400 text-sm hover:bg-blue-500/20 transition-colors"
              >
                Telegram Support
              </a>
              <a
                href="https://chat.whatsapp.com/DzL8dDYSjOTE3j59PKP0qf"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 text-sm hover:bg-green-500/20 transition-colors"
              >
                WhatsApp Support
              </a>
              <a
                href="mailto:info@rayallcompany.business"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-300 text-sm hover:bg-zinc-700 transition-colors"
              >
                Email Us
              </a>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
