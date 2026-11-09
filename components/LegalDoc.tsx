/** A German legal page: title + the text from lib/legal-de.ts (static, written by us). */
export default function LegalDoc({ title, intro, html, children }: { title: string; intro?: string; html: string; children?: React.ReactNode }) {
  return (
    <div className="wrap pt-10 sm:pt-14">
      <h1 className="text-[2.6rem] sm:text-[3.2rem]">{title}</h1>
      {intro && <p className="mt-3 max-w-2xl text-[1.15rem]">{intro}</p>}
      {children}
      <div className="prose-s mt-8" dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}
