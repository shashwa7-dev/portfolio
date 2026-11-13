import s from "./StarterPack.module.css";

/**
 * The barcode ticket. The stripes are decoration; the QR code holds the link,
 * and the whole ticket is a real link for anyone who cannot scan their own
 * screen. Pressing it never starts a card drag (see useStarterPackSim).
 */
export default function Ticket({
  url,
  qr,
  tag,
  digits,
}: {
  url: string;
  qr: string;
  tag: string;
  digits: string;
}) {
  return (
    <a
      className={`${s.z} ${s.ticket}`}
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Scan or open: a song on YouTube"
      data-ticket
    >
      <span className={s.bars} aria-hidden>
        <i />
        <b>{digits}</b>
      </span>
      {/* eslint-disable-next-line @next/next/no-img-element -- QR SVG must stay pixel-exact */}
      <img className={s.qr} src={qr} alt="" width={62} height={62} draggable={false} loading="lazy" decoding="async" />
      <em className={`${s.tag} ${s.label}`} aria-hidden>
        {tag}
      </em>
    </a>
  );
}
