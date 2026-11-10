import type { Metadata } from 'next';
import Link from 'next/link';
import Policy, { businessName } from '@/components/Policy';
import { brand } from '@/lib/config';

export const metadata: Metadata = { title: 'Privacy policy', description: 'What we collect, why, who we share it with and your choices.' };

export default function Privacy() {
  const us = businessName(brand.name);
  return (
    <Policy title="Privacy policy" intro={`This page explains what ${us} (“we”) collects when you visit or order, and what you can do about it.`}>
      <h2>What we collect</h2>
      <ul>
        <li>Order details: your name, email, shipping address, phone number if you give one, what you bought and any personalization you typed.</li>
        <li>Payment: handled entirely by Stripe. We see the payment status and the last digits of your card, never the full card number.</li>
        <li>Browsing: your cart and your privacy choice are stored in your browser. If you haven’t opted out, the Meta Pixel, Google Analytics and Microsoft Clarity record how you use the shop (pages you view, how far you scroll, what you click, how long you stay, where you leave, and purchases) so we can measure our ads and improve the site. Clarity can record your visit as a replay; it masks what you type into form fields.</li>
      </ul>
      <h2>Why we use it</h2>
      <ul>
        <li>To make, ship and support your order, including confirmation and tracking emails.</li>
        <li>To prevent fraud and keep records required for taxes and accounting.</li>
        <li>To measure our advertising on Facebook and Instagram and to find and fix problems on the site, unless you opt out.</li>
      </ul>
      <h2>Who we share it with</h2>
      <p>Only the companies that help us run the shop, each for its own job:</p>
      <ul>
        <li>Stripe (payments)</li>
        <li>Printful (printing and shipping; they receive your name, address and order)</li>
        <li>Resend (sending order emails)</li>
        <li>Vercel (website hosting)</li>
        <li>Meta Platforms (ad measurement through the Meta Pixel and Conversions API, unless you opt out; contact details are sent hashed)</li>
        <li>Google (Google Analytics, site statistics, unless you opt out)</li>
        <li>Microsoft (Clarity, session replays and heatmaps, unless you opt out)</li>
      </ul>
      <p>We don’t sell your personal information for money. Sharing browsing and purchase data with Meta for advertising may count as “sharing” or “targeted advertising” under some state privacy laws, and you can opt out of it below.</p>
      <h2>Your choices</h2>
      <ul>
        <li>
          Opt out of ad tracking on <Link href="/privacy-choices/">Your privacy choices</Link>. We also honor the Global Privacy Control signal from your browser.
        </li>
        <li>
          Ask to see, correct or delete your information by writing to <a href={`mailto:${brand.email}`}>{brand.email}</a>. We’ll reply within 30 days. We keep order records as long as tax law requires.
        </li>
      </ul>
      <h2>How long we keep it</h2>
      <p>Order records are kept for up to 7 years for tax and accounting. Your cart and privacy choice stay in your browser until you clear them.</p>
      <h2>Children</h2>
      <p>The shop isn’t intended for children under 13, and we don’t knowingly collect their information.</p>
      <h2>Changes</h2>
      <p>If we change this policy, we’ll update the date below.</p>
    </Policy>
  );
}
