// US store: the promise, "what happens after you order" and the questions she asks first.
// Copy follows docs/design-rules.md (plain words, true and specific, no pressure).
import { brand, formatPrice, promise, stores } from './config';

const swap = formatPrice(promise.sizeSwapCents);
const us = stores.en;

export const PROMISE = {
  short: `If we get it wrong, we fix it free. Wrong size? We'll send the right one for ${swap}, and you keep the first.`,
  title: 'We’ll make it right',
  points: [
    { t: 'Our mistake? It’s free.', d: 'Misprint, damage or the wrong shirt: we send a new one or refund you, whichever you prefer. Nothing to send back.' },
    { t: 'Wrong size? Keep it.', d: `We print the right size for a flat ${swap} and you keep the first one. Pass it to a friend or a sister. No trip to the post office.` },
    { t: 'Lost package? We chase it.', d: `If tracking hasn’t moved for ${promise.lostAfterBusinessDays} business days, we sort it out with the carrier and send a replacement if it’s lost.` },
  ],
  window: `Just write to us within ${promise.problemDays} days of delivery.`,
};

export const ORDER_STEPS = [
  { t: 'You order', d: 'Pay safely with card, Apple Pay or Google Pay. You get a confirmation email straight away.' },
  { t: 'We print yours', d: 'Your shirt is printed just for you in the US, usually within 2–5 business days.' },
  { t: 'Tracking email', d: 'The day it ships, we email you a tracking link so you can follow it.' },
  { t: 'At your door', d: `Most orders arrive ${us.deliveryMinDays}–${us.deliveryMaxDays} business days after you order.` },
  { t: 'Not right? We fix it', d: 'Wrong size, misprint or a lost package: write to us and a real person sorts it out.' },
];

export const CONTACT = {
  line: 'A real person reads every message and usually replies within a day.',
  email: brand.email,
  messenger: brand.messengerUrl,
  signOff: brand.signOff,
};
