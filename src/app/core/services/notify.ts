import { Injectable, isDevMode } from '@angular/core';
import { environment } from '../../../environments/environment';
import { ReservationRequest, SLOTS } from '../models/reservation';

type ClientEvent = 'received' | 'accepted' | 'declined';
type Lang = 'it' | 'en' | 'fr';

/** Client email texts per language */
const TEXTS: Record<Lang, Record<ClientEvent, { subject: string; title: string; intro: string }> & { closing: string; noteLabel: string }> = {
  it: {
    received: { subject: 'Richiesta ricevuta – {{boat}}', title: 'Abbiamo ricevuto la tua richiesta', intro: 'Grazie! La tua richiesta è in attesa di conferma. Ti risponderemo il prima possibile.' },
    accepted: { subject: 'Prenotazione confermata – {{boat}}', title: 'Prenotazione confermata ✅', intro: 'Ottime notizie: la tua prenotazione è confermata. Ti aspettiamo al porto di Cannigione.' },
    declined: { subject: 'Richiesta non disponibile – {{boat}}', title: 'Richiesta non disponibile', intro: 'Ci dispiace, non possiamo confermare questa data. Scrivici per trovare un\'alternativa.' },
    closing: 'A presto,\nGreen Boat Rent – +39 379 186 9281',
    noteLabel: 'Nota'
  },
  en: {
    received: { subject: 'Request received – {{boat}}', title: 'We received your request', intro: 'Thank you! Your request is pending confirmation. We will reply as soon as possible.' },
    accepted: { subject: 'Booking confirmed – {{boat}}', title: 'Booking confirmed ✅', intro: 'Great news: your booking is confirmed. See you at Cannigione harbour.' },
    declined: { subject: 'Request not available – {{boat}}', title: 'Request not available', intro: 'Sorry, we cannot confirm this date. Contact us to find an alternative.' },
    closing: 'See you soon,\nGreen Boat Rent – +39 379 186 9281',
    noteLabel: 'Note'
  },
  fr: {
    received: { subject: 'Demande reçue – {{boat}}', title: 'Nous avons reçu votre demande', intro: 'Merci ! Votre demande est en attente de confirmation. Nous vous répondons au plus vite.' },
    accepted: { subject: 'Réservation confirmée – {{boat}}', title: 'Réservation confirmée ✅', intro: 'Bonne nouvelle : votre réservation est confirmée. Rendez-vous au port de Cannigione.' },
    declined: { subject: 'Demande non disponible – {{boat}}', title: 'Demande non disponible', intro: 'Désolés, nous ne pouvons pas confirmer cette date. Contactez-nous pour trouver une alternative.' },
    closing: 'À bientôt,\nGreen Boat Rent – +39 379 186 9281',
    noteLabel: 'Note'
  }
};

const LOCALES: Record<Lang, string> = { it: 'it-IT', en: 'en-GB', fr: 'fr-FR' };

/**
 * Emails (EmailJS, free 200/month) + owner WhatsApp (CallMeBot).
 * Fire-and-forget: a failure never blocks the booking flow.
 */
@Injectable({ providedIn: 'root' })
export class NotifyService {
  private cfg = environment.notify;

  // ================= OWNER =================
  newReservation(id: string, r: ReservationRequest): void {
    const link = `${location.origin}/admin?r=${id}`;
    const date = this.dateLabel(r.date, 'it');
    const hours = this.hours(r.slot);

    this.send(this.cfg.emailjs.templateId, {
      boat: r.boatName, date, hours, pax: String(r.pax),
      name: r.name, email: r.email, phone: r.phone,
      license: r.licenseNumber ?? '—', message: r.message ?? '—', link
    });

    this.whatsapp(
      `🚤 Nuova richiesta – Green Boat Rent\n` +
      `${r.boatName}\n📅 ${date} · ${hours}\n👥 ${r.pax} persone\n` +
      `👤 ${r.name} · ${r.phone}\n\n` +
      `Accetta o rifiuta: ${link}`
    );
  }

  // ================= CLIENT =================
  client(event: ClientEvent, r: ReservationRequest, note = ''): void {
    const lang: Lang = (['it', 'en', 'fr'] as const).includes(r.lang as Lang) ? r.lang as Lang : 'it';
    const t = TEXTS[lang];
    this.send(this.cfg.emailjs.clientTemplateId, {
      to_email: r.email,
      to_name: r.name,
      subject: t[event].subject.replace('{{boat}}', r.boatName),
      title: t[event].title,
      intro: t[event].intro,
      boat: r.boatName,
      date: this.dateLabel(r.date, lang),
      hours: this.hours(r.slot),
      pax: String(r.pax),
      note: note ? `${t.noteLabel}: ${note}` : '',
      closing: t.closing
    });
  }

  // ================= helpers =================
  private dateLabel(iso: string, lang: Lang) {
    return new Date(iso + 'T00:00').toLocaleDateString(LOCALES[lang], { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  }

  private hours(slot: string) {
    const s = SLOTS.find(x => x.id === slot);
    return s ? s.hours : slot;
  }

  private send(templateId: string, params: Record<string, string>): void {
    const { serviceId, publicKey } = this.cfg.emailjs;
    if (!serviceId || !templateId || !publicKey) {
      if (isDevMode()) console.warn('[notify] email disabled: missing EmailJS ids in .env');
      return;
    }
    fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ service_id: serviceId, template_id: templateId, user_id: publicKey, template_params: params })
    })
      .then(res => { if (isDevMode()) res.text().then(t => (res.ok ? console.log : console.error)('[notify] email:', res.status, t)); })
      .catch(e => isDevMode() && console.error('[notify] email:', e));
  }

  private whatsapp(text: string): void {
    const { phone, apiKey } = this.cfg.callmebot;
    if (!phone || !apiKey) return;
    const url = `https://api.callmebot.com/whatsapp.php?phone=${encodeURIComponent(phone)}&apikey=${encodeURIComponent(apiKey)}&text=${encodeURIComponent(text)}`;
    fetch(url, { mode: 'no-cors' }).catch(e => isDevMode() && console.error('[notify] whatsapp:', e));
  }
}
