import Link from 'next/link';

interface BackButtonProps {
  href: string;
  label?: string;
}

export default function BackButton({ href, label = '← Back' }: BackButtonProps) {
  return (
    <Link href={href}>
      <button
        type="button"
        className="btn-gold"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '10px 22px',
          borderRadius: '999px',
          fontSize: '13px',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        <span>{label}</span>
      </button>
    </Link>
  );
}