// US store: the promise, "what happens after you order" and the questions she asks first.
// Copy follows docs/design-rules.md (plain words, true and specific, no pressure).
import { brand, formatPrice, promise, stores } from './config';

const swap = formatPrice(promise.sizeSwapCents);
const us = stores.en;

export const PROMISE = {
  // Next to Add to cart, in the cart and on the homepage: only what's free.
  short: 'If we get it wrong, we fix it free. Misprint, damage or a lost package gets a new shirt or your money back, and you send nothing back.',
  title: 'We mess up, we pay',
  points: [
    { t: 'Our mistake? It’s free.', d: 'Misprint, damage or the wrong shirt: we send a new one or refund you, your pick. Nothing to send back.' },
    { t: 'Lost package? We chase it.', d: `If tracking hasn’t moved for ${promise.lostAfterBusinessDays} business days, we deal with the carrier and send a replacement if it’s lost.` },
    { t: 'Changed your mind? Be quick.', d: 'Cancel before it goes to print, usually within a few hours, and you get every cent back.' },
  ],
  window: `Just write to us within ${promise.problemDays} days of delivery.`,
};

// Only shown next to the size picker, where the fit worry actually happens (and in the FAQ, the promise page
// and the emails after she's bought). Not on the homepage: a price on a problem she hasn't had reads as a penalty.
export const SIZE_HELP = {
  note: `Wrong size when it arrives? We send the right one for ${swap} and you keep the first.`,
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
