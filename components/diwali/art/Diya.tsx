import type { CSSProperties } from "react";
import styles from "../diwali.module.css";

type Props = { idPrefix: string; lit: boolean; flickerOffset?: number };

export function Diya({ idPrefix, lit, flickerOffset = 0 }: Props) {
  return (
    <svg
      viewBox="0 0 100 90"
      aria-hidden="true"
      style={{ "--j": flickerOffset } as CSSProperties}
    >
      <defs>
        <radialGradient id={`${idPrefix}-dglow`}>
          <stop offset="0" stopColor="rgba(255,200,90,.75)" />
          <stop offset=".45" stopColor="rgba(255,160,50,.25)" />
          <stop offset="1" stopColor="rgba(255,140,40,0)" />
        </radialGradient>
        <linearGradient id={`${idPrefix}-clay`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e8853f" />
          <stop offset=".5" stopColor="#c25a26" />
          <stop offset="1" stopColor="#7a3214" />
        </linearGradient>
        <radialGradient id={`${idPrefix}-fl`} cx="50%" cy="75%" r="70%">
          <stop offset="0" stopColor="#fff6c8" />
          <stop offset=".45" stopColor="#ffc23a" />
          <stop offset="1" stopColor="#ff6a00" />
        </radialGradient>
      </defs>
      <ellipse cx="50" cy="74" rx="46" ry="10" fill="rgba(10,2,2,.55)" />
      {lit && (
        <ellipse
          className={styles.diyaGlow}
          cx="54"
          cy="34"
          rx="50"
          ry="42"
          fill={`url(#${idPrefix}-dglow)`}
        />
      )}
      {lit && (
        <path
          className={styles.flame}
          d="M58 44 C 52 34, 56 22, 62 12 C 66 24, 72 34, 64 44 Z"
          fill={`url(#${idPrefix}-fl)`}
        />
      )}
      <path
        d="M8 52 Q 50 92 92 52 Q 80 50 68 47 L 58 46 Q 30 48 8 52 Z"
        fill={`url(#${idPrefix}-clay)`}
      />
      <path d="M8 52 Q 30 46 60 46 Q 80 48 92 52 Q 50 58 8 52 Z" fill="#5a240c" />
      <path
        d="M8 52 Q 30 46 60 46 Q 80 48 92 52"
        fill="none"
        stroke="#ffcf7a"
        strokeWidth="1.6"
        opacity=".9"
      />
      <path
        d="M14 60 Q 50 82 86 60"
        fill="none"
        stroke="#f2c14e"
        strokeWidth="2"
        strokeDasharray="1 5"
        strokeLinecap="round"
      />
    </svg>
  );
}
