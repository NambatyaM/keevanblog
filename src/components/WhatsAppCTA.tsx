import { SITE } from '@/lib/site-config';
import { MessageCircle, ArrowRight, Sparkles } from 'lucide-react';

/**
 * WhatsApp group invite CTA — replaces the old newsletter form.
 * Invites readers to join the weekly-updates WhatsApp group.
 */
export function WhatsAppCTA() {
  return (
    <section className="border-t bg-muted/30 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
        <div
          className="w-12 h-12 rounded-xl mx-auto mb-4 flex items-center justify-center"
          style={{ backgroundColor: '#25D36620' }}
        >
          <MessageCircle className="w-6 h-6" style={{ color: '#25D366' }} />
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">
          Join our WhatsApp group for weekly updates
        </h2>
        <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
          Get one actionable tip every week on selling digital products in East Africa.
          New post alerts, marketing strategies, and creator Q&A — direct to your phone.
        </p>
        <a
          href={SITE.whatsappGroupUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-white font-semibold px-6 py-3 rounded-lg hover:opacity-90 transition shadow-md"
          style={{ backgroundColor: '#25D366' }}
        >
          <MessageCircle className="w-5 h-5" />
          Join WhatsApp Group
          <ArrowRight className="w-4 h-4" />
        </a>
        <p className="text-xs text-muted-foreground mt-3 inline-flex items-center gap-1">
          <Sparkles className="w-3 h-3" /> Free · No spam · Leave anytime
        </p>
      </div>
    </section>
  );
}
