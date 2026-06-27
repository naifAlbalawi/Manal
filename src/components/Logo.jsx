export default function Logo({ size = 120, animated = false }) {
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg"
      style={animated ? { animation: "float 4s ease-in-out infinite" } : {}}>
      <defs>
        <linearGradient id="logoSky" x1="0" y1="0" x2="200" y2="200">
          <stop offset="0%" stopColor="#22d3ee" />
          <stop offset="50%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
        <linearGradient id="logoSun" x1="60" y1="40" x2="140" y2="120">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
        <linearGradient id="logoRoad" x1="100" y1="140" x2="100" y2="200">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#22d3ee" />
        </linearGradient>
        <filter id="logoGlow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Background circle */}
      <circle cx="100" cy="100" r="88" fill="#0a0a0f" stroke="url(#logoSky)" strokeWidth="2.5" opacity="0.9" />

      {/* Horizon line */}
      <path d="M25 135 Q60 125 100 135 T175 135" stroke="url(#logoSky)" strokeWidth="1.5" fill="none" opacity="0.4" />

      {/* Road */}
      <path d="M85 135 L100 188 L115 135" fill="none" stroke="url(#logoRoad)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M92 150 L100 170 L108 150" fill="none" stroke="url(#logoRoad)" strokeWidth="1.5" opacity="0.5" />

      {/* Sun / Hope */}
      <circle cx="100" cy="72" r="22" fill="url(#logoSun)" filter="url(#logoGlow)" opacity="0.95" />
      <circle cx="100" cy="72" r="28" fill="url(#logoSun)" opacity="0.15" />

      {/* Rays */}
      <line x1="100" y1="35" x2="100" y2="42" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
      <line x1="100" y1="102" x2="100" y2="108" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
      <line x1="63" y1="72" x2="70" y2="72" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
      <line x1="130" y1="72" x2="137" y2="72" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
      <line x1="74" y1="46" x2="79" y2="51" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
      <line x1="121" y1="93" x2="126" y2="98" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
      <line x1="126" y1="46" x2="121" y2="51" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
      <line x1="79" y1="93" x2="74" y2="98" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />

      {/* Growth arrow / Planning */}
      <path d="M55 115 L70 100 L85 108" stroke="#10b981" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.8" />

      {/* Text */}
      <text x="100" y="182" textAnchor="middle" fill="#f0f0f5" fontSize="13" fontWeight="800" 
        fontFamily="Cairo, Inter, sans-serif" letterSpacing="3" opacity="0.9">AMAL</text>
    </svg>
  );
}
