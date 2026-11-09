// Server-side environment. See .env.example for what each value is.
import 'server-only';

function opt(name: string) {
  const v = process.env[name];
  return v && v.trim() ? v.trim() : undefined;
}

export const env = {
  stripeSecretKey: opt('STRIPE_SECRET_KEY'),
  stripeWebhookSecret: opt('STRIPE_WEBHOOK_SECRET'),
  stripeAutomaticTax: opt('STRIPE_AUTOMATIC_TAX') === 'true',
  stripeRequireTerms: opt('STRIPE_REQUIRE_TERMS') === 'true',

  printfulToken: opt('PRINTFUL_API_TOKEN'),
  printfulStoreId: opt('PRINTFUL_STORE_ID'),
  printfulAutoConfirm: opt('PRINTFUL_AUTO_CONFIRM') === 'true',
  printfulWebhookSecret: opt('PRINTFUL_WEBHOOK_SECRET'),

  printFileSecret: opt('PRINT_FILE_SECRET'),

  resendApiKey: opt('RESEND_API_KEY'),
  emailFrom: opt('EMAIL_FROM'),
  ownerEmail: opt('OWNER_EMAIL'),

  metaPixelId: opt('NEXT_PUBLIC_META_PIXEL_ID'),
  metaCapiToken: opt('META_CAPI_TOKEN'),
  metaGraphVersion: opt('META_GRAPH_VERSION') ?? 'v24.0',
};

export function requireEnv<K extends keyof typeof env>(key: K): NonNullable<(typeof env)[K]> {
  const v = env[key];
  if (v === undefined || v === null || v === '') throw new Error(`Missing environment variable for ${key}`);
  return v as NonNullable<(typeof env)[K]>;
}
