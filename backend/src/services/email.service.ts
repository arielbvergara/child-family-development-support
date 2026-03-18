import { Resend } from 'resend';
import type { ValidatedContactPayload } from '../types/contact.types';
import type { ValidatedAppointmentPayload } from '../types/appointment.types';
import { BUSINESS_TIMEZONE } from '../constants/appointment.constants';

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Generates a conditional HTML table row. Returns an empty string when value is falsy.
 */
function htmlTableRow(label: string, value: string): string {
  return value ? `<tr><td><strong>${label}:</strong></td><td>${value}</td></tr>` : '';
}

/**
 * Strips CR, LF, and other ASCII control characters from a string to prevent
 * email header injection when the value is used in a header field (e.g. subject).
 */
function sanitizeForHeader(str: string): string {
  // eslint-disable-next-line no-control-regex -- intentional: strips ASCII control chars to prevent header injection
  return str.replace(/[\r\n\x00-\x1f\x7f]/g, '');
}

export function createEmailService(
  apiKey: string,
  fromEmail: string,
  ownerEmail: string,
  sheetsUrl?: string,
) {
  async function sendOwnerNotification(
    resend: Resend,
    payload: ValidatedContactPayload,
  ): Promise<void> {
    const safeName = escapeHtml(payload.name);
    const safeEmail = escapeHtml(payload.email);
    const safePhone = payload.phone ? escapeHtml(payload.phone) : '';
    const safeService = payload.service ? escapeHtml(payload.service) : '';
    const safeMessage = escapeHtml(payload.message);

    const phoneLine = htmlTableRow('Phone', safePhone);
    const serviceLine = htmlTableRow('Service', safeService);
    const sheetsLinkSection = sheetsUrl
      ? `
        <p style="margin-top:24px;">
          <a href="${escapeHtml(sheetsUrl)}"
             style="background:#1a73e8;color:#ffffff;padding:10px 20px;border-radius:4px;text-decoration:none;font-weight:bold;">
            View all submissions in Google Sheets
          </a>
        </p>`
      : '';

    await resend.emails.send({
      from: fromEmail,
      to: [ownerEmail],
      subject: `New contact request from ${sanitizeForHeader(payload.name)}`,
      html: `
        <h2>You have received a new contact request</h2>
        <table cellpadding="8">
          <tr><td><strong>Name:</strong></td><td>${safeName}</td></tr>
          <tr><td><strong>Email:</strong></td><td>${safeEmail}</td></tr>
          ${phoneLine}
          ${serviceLine}
          <tr><td><strong>Message:</strong></td><td>${safeMessage}</td></tr>
        </table>
        ${sheetsLinkSection}
      `,
    });
  }

  // TODO: Re-enable auto-reply once a custom sender domain is verified in Resend.
  // The Resend free plan restricts delivery to verified addresses only, which means
  // auto-replies to arbitrary visitor emails will fail until a domain is configured.
  // See: https://resend.com/docs/dashboard/domains/introduction

  async function sendAppointmentOwnerNotification(
    resend: Resend,
    payload: ValidatedAppointmentPayload,
  ): Promise<void> {
    const safeName = escapeHtml(payload.name);
    const safeEmail = escapeHtml(payload.email);
    const safePhone = payload.phone ? escapeHtml(payload.phone) : '';
    const safeService = payload.service ? escapeHtml(payload.service) : '';
    const safeNotes = payload.notes ? escapeHtml(payload.notes) : '';
    const safeDateTime = escapeHtml(new Date(payload.datetime).toLocaleString('nl-NL', {
      dateStyle: 'full',
      timeStyle: 'short',
      timeZone: BUSINESS_TIMEZONE,
    }));

    const phoneLine = htmlTableRow('Phone', safePhone);
    const serviceLine = htmlTableRow('Service', safeService);
    const notesLine = htmlTableRow('Notes', safeNotes);

    await resend.emails.send({
      from: fromEmail,
      to: [ownerEmail],
      subject: `New appointment from ${sanitizeForHeader(payload.name)}`,
      html: `
        <h2>You have a new appointment booking</h2>
        <table cellpadding="8">
          <tr><td><strong>Date &amp; Time:</strong></td><td>${safeDateTime}</td></tr>
          <tr><td><strong>Name:</strong></td><td>${safeName}</td></tr>
          <tr><td><strong>Email:</strong></td><td>${safeEmail}</td></tr>
          ${phoneLine}
          ${serviceLine}
          ${notesLine}
        </table>
      `,
    });
  }

  async function sendAppointmentConfirmation(
    resend: Resend,
    payload: ValidatedAppointmentPayload,
  ): Promise<void> {
    const safeName = escapeHtml(payload.name);
    const safeDateTime = escapeHtml(new Date(payload.datetime).toLocaleString('nl-NL', {
      dateStyle: 'full',
      timeStyle: 'short',
      timeZone: BUSINESS_TIMEZONE,
    }));

    await resend.emails.send({
      from: fromEmail,
      to: [payload.email],
      subject: `Appointment confirmed – ${sanitizeForHeader(safeDateTime)}`,
      html: `
        <h2>Your appointment is confirmed</h2>
        <p>Dear ${safeName},</p>
        <p>Your appointment has been successfully booked for <strong>${safeDateTime}</strong>.</p>
        <p>If you need to cancel or reschedule, please contact us at least 24 hours in advance.</p>
        <p>We look forward to seeing you!</p>
      `,
    });
  }

  async function sendContactEmails(payload: ValidatedContactPayload): Promise<void> {
    const resend = new Resend(apiKey);
    await sendOwnerNotification(resend, payload);
  }

  async function sendAppointmentEmails(payload: ValidatedAppointmentPayload): Promise<void> {
    const resend = new Resend(apiKey);
    await Promise.allSettled([
      sendAppointmentOwnerNotification(resend, payload),
      sendAppointmentConfirmation(resend, payload),
    ]).then((results) => {
      if (results[0].status === 'rejected') {
        console.error('Failed to send appointment owner notification', {
          err: results[0].reason instanceof Error ? results[0].reason.message : String(results[0].reason),
        });
      }
      if (results[1].status === 'rejected') {
        console.error('Failed to send appointment confirmation to visitor', {
          err: results[1].reason instanceof Error ? results[1].reason.message : String(results[1].reason),
        });
      }
    });
  }

  return { sendContactEmails, sendAppointmentEmails };
}

export type EmailService = ReturnType<typeof createEmailService>;
