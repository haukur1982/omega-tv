'use client';

import Link from 'next/link';
import { OmegaMark } from '@/components/brand/OmegaMark';

const NAV_COLUMNS = [
  {
    title: 'Horfa',
    links: [
      { label: 'Bein útsending', href: '/live' },
      { label: 'Þáttasafn', href: '/sermons' },
      { label: 'Sunnudagssamkomur', href: '/sermons' },
    ],
  },
  {
    title: 'Fræðsla',
    links: [
      // { label: 'Námskeið', href: '/namskeid' }, // Hidden until courses are ready
      { label: 'Greinar', href: '/greinar' },
      { label: 'Ísrael', href: '/israel' },
      { label: 'Vitnisburdur', href: '/vitnisburdur' },
    ],
  },
  {
    title: 'Samfélag',
    links: [
      { label: 'Bænatorg', href: '/baenatorg' },
      { label: 'Fréttabréf', href: '/frettabref' },
      { label: 'Styrkja', href: '/give' },
    ],
  },
  {
    title: 'Um Omega',
    links: [
      { label: 'Um okkur', href: '/about' },
      { label: 'Framtíðin', href: '/framtid' },
      { label: 'Hafa samband', href: '/about' },
    ],
  },
];

export default function Footer() {
  return (
    <footer
      style={{
        background: 'linear-gradient(to bottom, var(--bg-deep), #05040350)',
        borderTop: '1px solid var(--border)',
      }}
    >
      <div
        style={{
          maxWidth: '80rem',
          margin: '0 auto',
          padding: 'clamp(3rem, 6vw, 5rem) var(--rail-padding) 2rem',
        }}
      >
        {/* ─── Top: Logo + Nav Columns ─── */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '2.5rem',
            marginBottom: '3rem',
          }}
        >
          {/* Brand column */}
          <div>
            <Link
              href="/"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                textDecoration: 'none',
                marginBottom: '1rem',
              }}
            >
              <span style={{ color: 'var(--accent)', display: 'inline-flex' }}>
                <OmegaMark size={36} title="Omega" />
              </span>
              <span
                style={{
                  color: 'var(--text-primary)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                }}
              >
                Omega
              </span>
            </Link>
            <p
              style={{
                color: 'var(--text-muted)',
                fontSize: '0.8rem',
                lineHeight: 1.6,
                maxWidth: '200px',
              }}
            >
              Kristin fjölmiðlastöð á Íslandi síðan 1992. Von og sannleikur
              fyrir alla.
            </p>
          </div>

          {/* Nav columns */}
          {NAV_COLUMNS.map((col) => (
            <div key={col.title}>
              <h4
                style={{
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.2em',
                  color: 'var(--text-secondary)',
                  marginBottom: '1rem',
                }}
              >
                {col.title}
              </h4>
              <ul
                style={{
                  listStyle: 'none',
                  padding: 0,
                  margin: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.6rem',
                }}
              >
                {col.links.map((link) => (
                  <li key={link.href + link.label}>
                    <Link
                      href={link.href}
                      style={{
                        color: 'var(--text-muted)',
                        fontSize: '0.8rem',
                        textDecoration: 'none',
                        transition: 'color 0.2s ease',
                      }}
                      onMouseOver={(e: any) => {
                        e.currentTarget.style.color = 'var(--text-primary)';
                      }}
                      onMouseOut={(e: any) => {
                        e.currentTarget.style.color = 'var(--text-muted)';
                      }}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* ─── Bottom bar ─── */}
        <div
          style={{
            borderTop: '1px solid var(--border)',
            paddingTop: '1.5rem',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '1rem',
          }}
        >
          <p
            style={{
              color: 'var(--text-muted)',
              fontSize: '0.7rem',
              letterSpacing: '0.05em',
            }}
          >
            © {new Date().getFullYear()} Omega Stöðin. Öll réttindi áskilin.
          </p>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <Link
              href="/about"
              style={{
                color: 'var(--text-muted)',
                fontSize: '0.7rem',
                textDecoration: 'none',
                transition: 'color 0.2s',
              }}
            >
              Persónuverndarstefna
            </Link>
            <Link
              href="/about"
              style={{
                color: 'var(--text-muted)',
                fontSize: '0.7rem',
                textDecoration: 'none',
                transition: 'color 0.2s',
              }}
            >
              Skilmálar
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
