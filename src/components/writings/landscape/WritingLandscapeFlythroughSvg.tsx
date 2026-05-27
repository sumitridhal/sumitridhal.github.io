import type { RefObject } from 'react'

export type WritingLandscapeFlythroughSvgProps = {
  className?: string
  svgRef?: RefObject<SVGSVGElement | null>
}

/**
 * Inline layered landscape for GSAP depth scaling.
 * Replace group contents after exporting from Figma/Illustrator — keep the five ids.
 */
export function WritingLandscapeFlythroughSvg({
  className = '',
  svgRef,
}: WritingLandscapeFlythroughSvgProps) {
  return (
    <svg
      ref={svgRef}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1200 800"
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label="Layered flat vector landscape with sky, mountains, hills, trees, and foreground grass"
    >
      <g id="layer-sky">
        <rect width="1200" height="800" fill="#a7d8f0" />
        <ellipse cx="220" cy="118" rx="118" ry="42" fill="#fff" />
        <ellipse cx="168" cy="128" rx="72" ry="32" fill="#fff" />
        <ellipse cx="920" cy="96" rx="96" ry="36" fill="#fff" />
        <ellipse cx="1040" cy="108" rx="64" ry="28" fill="#fff" />
      </g>

      <g id="layer-mountains">
        <path
          fill="#4a90b2"
          d="M0 420 L0 800 L1200 800 L1200 420 L1080 300 L980 380 L860 260 L720 360 L600 220 L460 340 L320 240 L180 360 L60 280 Z"
        />
        <path
          fill="#1e5d7b"
          d="M0 480 L0 800 L1200 800 L1200 480 L1100 400 L980 460 L840 360 L700 440 L560 320 L420 420 L280 340 L140 440 L0 400 Z"
        />
      </g>

      <g id="layer-ground">
        <path fill="#5cb3d1" d="M0 520 L1200 520 L1200 580 L0 580 Z" />
        <path
          fill="#1e5d7b"
          d="M0 560 L1200 560 L1200 600 L0 600 Z M40 572 L80 568 L120 574 L160 566 L200 572 L240 568 L280 574 L320 566 L360 572 L400 568 L440 574 L480 566 L520 572 L560 568 L600 574 L640 566 L680 572 L720 568 L760 574 L800 566 L840 572 L880 568 L920 574 L960 566 L1000 572 L1040 568 L1080 574 L1120 566 L1160 572 L1200 568 L1200 600 L0 600 Z"
        />
        <path
          fill="#4caf50"
          d="M0 600 L1200 600 L1200 800 L0 800 Z M0 640 Q300 560 600 620 T1200 640 L1200 800 L0 800 Z"
        />
        <path fill="#43a047" d="M0 680 Q400 620 800 660 T1200 700 L1200 800 L0 800 Z" />
      </g>

      <g id="layer-trees">
        <path fill="#2e7d32" d="M120 640 L150 560 L180 640 Z M150 560 L150 640 L120 640 Z" />
        <path fill="#2e7d32" d="M1020 650 L1050 570 L1080 650 Z M1050 570 L1050 650 L1020 650 Z" />
        <ellipse cx="420" cy="620" rx="48" ry="56" fill="#66bb6a" />
        <rect x="408" y="620" width="24" height="80" fill="#388e3c" />
        <ellipse cx="780" cy="630" rx="52" ry="60" fill="#66bb6a" />
        <rect x="768" y="630" width="24" height="76" fill="#388e3c" />
        <ellipse cx="600" cy="640" rx="36" ry="44" fill="#81c784" />
        <rect x="592" y="640" width="16" height="56" fill="#388e3c" />
      </g>

      <g id="layer-foreground">
        <path
          fill="#0d2818"
          d="M0 720 L0 800 L1200 800 L1200 720 L1180 760 L1160 700 L1140 780 L1120 710 L1100 790 L1080 720 L1060 800 L1040 730 L1020 800 L1000 740 L980 800 L960 720 L940 800 L920 750 L900 800 L880 710 L860 800 L840 735 L820 800 L800 720 L780 800 L760 745 L740 800 L720 715 L700 800 L680 740 L660 800 L640 725 L620 800 L600 730 L580 800 L560 720 L540 800 L520 755 L500 800 L480 710 L460 800 L440 738 L420 800 L400 722 L380 800 L360 748 L340 800 L320 718 L300 800 L280 742 L260 800 L240 728 L220 800 L200 712 L180 800 L160 736 L140 800 L120 724 L100 800 L80 748 L60 800 L40 720 L20 800 L0 800 Z"
        />
        <path
          fill="#1b4332"
          opacity="0.85"
          d="M0 760 L40 720 L80 780 L120 740 L160 790 L200 750 L240 800 L280 760 L320 800 L360 755 L400 800 L440 765 L480 800 L520 770 L560 800 L600 758 L640 800 L680 772 L720 800 L760 762 L800 800 L840 768 L880 800 L920 774 L960 800 L1000 760 L1040 800 L1080 772 L1120 800 L1160 758 L1200 800 L1200 800 L0 800 Z"
        />
      </g>
    </svg>
  )
}
