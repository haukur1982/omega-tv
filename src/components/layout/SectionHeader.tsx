import Link from 'next/link';

interface SectionHeaderProps {
  title: string;
  href?: string;
  linkLabel?: string;
  /** When true, the title uses display serif (larger, lighter) instead of Yfirskrift. */
  serif?: boolean;
  /** Legacy prop — kept for compatibility, no longer used. */
  accentLink?: boolean;
}

/**
 * Rail / section header.
 *
 * Editorial treatment: title in serif, optional "sjá allt" link on the right
 * as a quiet Merki-caps line in muted cream — no cold-blue accent, no hard
 * divider rule beneath. The section's own padding does the separation work.
 */
export default function SectionHeader({
  title,
  href,
  linkLabel = 'Sjá allt',
  serif = false,
}: SectionHeaderProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'baseline',
        justifyContent: 'space-between',
        gap: '1rem',
        marginBottom: 'clamp(1rem, 1.6vw, 1.5rem)',
      }}
    >
      <h2
        className={serif ? 'type-kveda' : 'type-yfirskrift'}
        style={{
          color: 'var(--ljos)',
          margin: 0,
          fontSize: serif ? 'clamp(1.75rem, 3.2vw, 2.4rem)' : 'clamp(1.25rem, 2vw, 1.5rem)',
          fontWeight: serif ? 400 : 700,
          letterSpacing: serif ? '-0.025em' : '-0.01em',
          lineHeight: serif ? 1 : 1.2,
        }}
      >
        {title}
      </h2>
      {href && (
        <Link
          href={href}
          className="type-merki muted-link"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            textDecoration: 'none',
            letterSpacing: '0.18em',
            fontSize: '0.7rem',
            whiteSpace: 'nowrap',
          }}
        >
          {linkLabel}
          <span aria-hidden="true" style={{ fontSize: '0.9em' }}>→</span>
        </Link>
      )}
    </div>
  );
}
