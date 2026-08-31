import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Wordmark from '../brand/Wordmark';

interface AuthShellProps {
  /** Large display headline. Keep it to two lines. */
  title: string;
  /** One short sentence under the headline. */
  intro: string;
  /** Handwritten aside in the yellow panel. Optional. */
  aside?: string;
  children: React.ReactNode;
}

/**
 * Split frame for the single-purpose auth screens: editorial yellow panel on
 * the left, the form on the right. Collapses to one column below md.
 */
export default function AuthShell({ title, intro, aside, children }: AuthShellProps) {
  return (
    <div className="min-h-[100dvh] bg-paper px-4 py-6 md:px-8 md:py-10">
      <div className="mx-auto max-w-5xl">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-bold text-ink-soft hover:text-ink"
        >
          <ArrowLeft size={16} strokeWidth={2.5} />
          Back to sign in
        </Link>

        <div className="mt-6 grid gap-4 md:grid-cols-[1fr_0.9fr] md:gap-6">
          <section className="rise rounded-panel bg-surface-yellow p-8 md:p-10">
            <Wordmark className="text-2xl" />
            <h1 className="mt-8 text-[2.5rem] leading-[0.95] md:mt-16 md:text-[3.5rem]">
              {title}
            </h1>
            <p className="mt-4 max-w-[38ch] text-[15px] leading-relaxed text-ink-soft">
              {intro}
            </p>
            {aside && <p className="note mt-8">{aside}</p>}
          </section>

          <section className="rise panel self-start md:p-8" style={{ '--i': 1 } as React.CSSProperties}>
            {children}
          </section>
        </div>
      </div>
    </div>
  );
}
