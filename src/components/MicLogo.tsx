import { Mic } from "lucide-react";

interface MicLogoProps {
  size?: number;
  className?: string;
}

export function MicLogo({ size = 24, className = "" }: MicLogoProps) {
  return (
    <div className={`relative ${className}`}>
      <Mic 
        size={size} 
        className="relative z-10"
        style={{
          fill: 'url(#mic-gradient)',
          stroke: 'url(#mic-gradient)',
        }}
      />
      <svg width="0" height="0" className="absolute">
        <defs>
          <linearGradient id="mic-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(188 100% 50%)" />
            <stop offset="50%" stopColor="hsl(280 80% 60%)" />
            <stop offset="100%" stopColor="hsl(330 100% 60%)" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
