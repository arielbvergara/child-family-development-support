import { Router, type IRouter } from 'express';
import type { Request, Response } from 'express';
import { createCalendarService, generateAllWorkingSlots } from '../services/calendar.service';
import { createEmailService } from '../services/email.service';
import {
  BOOKING_WINDOW_MONTHS,
  APPOINTMENT_VALIDATION,
} from '../constants/appointment.constants';
import { CONTACT_VALIDATION, HTTP_STATUS } from '../constants/contact.constants';
import type {
  AppointmentRequestBody,
  ValidatedAppointmentPayload,
} from '../types/appointment.types';
import type { ValidationError } from '../types/contact.types';

function validateAppointmentBody(body: AppointmentRequestBody): {
  payload: ValidatedAppointmentPayload | null;
  errors: ValidationError[];
} {
  const errors: ValidationError[] = [];

  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim() : '';
  const phone = typeof body.phone === 'string' ? body.phone.trim() : '';
  const service = typeof body.service === 'string' ? body.service.trim() : '';
  const notes = typeof body.notes === 'string' ? body.notes.trim() : '';
  const datetime = typeof body.datetime === 'string' ? body.datetime.trim() : '';

  if (!name) {
    errors.push({ field: 'name', message: 'Name is required' });
  } else if (name.length > CONTACT_VALIDATION.NAME_MAX_LENGTH) {
    errors.push({ field: 'name', message: `Name must not exceed ${CONTACT_VALIDATION.NAME_MAX_LENGTH} characters` });
  }

  if (!email) {
    errors.push({ field: 'email', message: 'Email is required' });
  } else if (email.length > CONTACT_VALIDATION.EMAIL_MAX_LENGTH) {
    errors.push({ field: 'email', message: 'Email address is too long' });
  } else if (!CONTACT_VALIDATION.EMAIL_REGEX.test(email)) {
    errors.push({ field: 'email', message: 'Email must be a valid email address' });
  }

  if (phone && phone.length > CONTACT_VALIDATION.PHONE_MAX_LENGTH) {
    errors.push({ field: 'phone', message: `Phone number must not exceed ${CONTACT_VALIDATION.PHONE_MAX_LENGTH} characters` });
  }

  if (service && service.length > CONTACT_VALIDATION.SERVICE_MAX_LENGTH) {
    errors.push({ field: 'service', message: `Service selection must not exceed ${CONTACT_VALIDATION.SERVICE_MAX_LENGTH} characters` });
  }

  if (notes && notes.length > APPOINTMENT_VALIDATION.NOTES_MAX_LENGTH) {
    errors.push({ field: 'notes', message: `Notes must not exceed ${APPOINTMENT_VALIDATION.NOTES_MAX_LENGTH} characters` });
  }

  if (!datetime) {
    errors.push({ field: 'datetime', message: 'Appointment date and time is required' });
  } else {
    const parsed = new Date(datetime);
    if (isNaN(parsed.getTime())) {
      errors.push({ field: 'datetime', message: 'Appointment date and time must be a valid ISO 8601 date' });
    } else if (parsed <= new Date()) {
      errors.push({ field: 'datetime', message: 'Appointment must be scheduled in the future' });
    }
  }

  if (errors.length > 0) {
    return { payload: null, errors };
  }

  return { payload: { name, email, phone, service, notes, datetime }, errors: [] };
}

export function createAppointmentRouter(): IRouter {
  const router = Router();

  const calendarService =
    process.env.GOOGLE_CALENDAR_ID &&
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL &&
    process.env.GOOGLE_PRIVATE_KEY
      ? createCalendarService(
          process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
          process.env.GOOGLE_PRIVATE_KEY,
          process.env.GOOGLE_CALENDAR_ID,
        )
      : null;

  const emailService = createEmailService(
    process.env.RESEND_API_KEY ?? '',
    process.env.RESEND_FROM_EMAIL ?? '',
    process.env.CONTACT_OWNER_EMAIL ?? '',
  );

  router.get('/availability', async (_req: Request, res: Response) => {
    const from = new Date();
    const to = new Date();
    to.setMonth(to.getMonth() + BOOKING_WINDOW_MONTHS);

    if (!calendarService) {
      const slots = generateAllWorkingSlots(from, to);
      res.status(HTTP_STATUS.OK).json({ slots });
      return;
    }

    try {
      const slots = await calendarService.getAvailableSlots(from, to);
      res.status(HTTP_STATUS.OK).json({ slots });
    } catch (err) {
      console.error('Failed to fetch available slots', {
        err: err instanceof Error ? err.message : String(err),
      });
      // Fallback: return all working-hour slots without conflict checks
      const slots = generateAllWorkingSlots(from, to);
      res.status(HTTP_STATUS.OK).json({ slots });
    }
  });

  router.post(
    '/',
    async (req: Request<object, object, AppointmentRequestBody>, res: Response) => {
      const { payload, errors } = validateAppointmentBody(req.body as AppointmentRequestBody);

      if (errors.length > 0) {
        res.status(HTTP_STATUS.UNPROCESSABLE_ENTITY).json({ errors });
        return;
      }

      // Re-check slot availability to guard against race conditions
      if (calendarService) {
        const available = await calendarService.isSlotAvailable(payload!.datetime).catch((err) => {
          console.error('Availability re-check failed', {
            err: err instanceof Error ? err.message : String(err),
          });
          return true; // Allow booking if availability check itself fails
        });

        if (!available) {
          res.status(HTTP_STATUS.UNPROCESSABLE_ENTITY).json({
            errors: [{ field: 'datetime', message: 'This time slot is no longer available' }],
          });
          return;
        }
      }

      // Create calendar event (critical — failure blocks the booking)
      if (calendarService) {
        try {
          await calendarService.createCalendarEvent(payload!);
        } catch (err) {
          console.error('Failed to create calendar event', {
            err: err instanceof Error ? err.message : String(err),
          });
          res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            error: 'Failed to create appointment. Please try again.',
          });
          return;
        }
      }

      // Send emails (non-critical — logged but does not fail the request)
      await emailService.sendAppointmentEmails(payload!);

      res.status(HTTP_STATUS.OK).json({ success: true });
    },
  );

  return router;
}
