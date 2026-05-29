import { useMemo } from "react";
import { useSiteTheme } from "@/components/SiteThemeProvider";
import type { ThemeSeason } from "@/lib/menu";

const PARTICLE_COUNT: Record<ThemeSeason, number> = {
  winter: 40,
  spring: 30,
  autumn: 26,
  summer: 10,
};

const LEAF_GLYPHS = ["🍂", "🍁"];

export const SeasonalEffects = () => {
  const { season } = useSiteTheme();
  const count = PARTICLE_COUNT[season];

  const particles = useMemo(
    () =>
      Array.from({ length: count }).map(() => ({
        left: Math.random() * 100,
        top: Math.random() * 100,
        delay: Math.random() * -12,
        duration: 8 + Math.random() * 10,
        glyph: LEAF_GLYPHS[Math.floor(Math.random() * LEAF_GLYPHS.length)],
      })),
    [count, season],
  );

  return (
    <div className="snowfall-layer" aria-hidden="true">
      {particles.map((particle, idx) => {
        const baseStyle = {
          left: `${particle.left}%`,
          animationDelay: `${particle.delay}s`,
          animationDuration: `${particle.duration}s`,
        } as const;

        if (season === "spring") {
          return (
            <span key={idx} className="petal" style={baseStyle}>
              ❀
            </span>
          );
        }

        if (season === "autumn") {
          return (
            <span key={idx} className="leaf" style={baseStyle}>
              {particle.glyph}
            </span>
          );
        }

        if (season === "summer") {
          return (
            <span
              key={idx}
              className="firefly"
              style={{
                left: `${particle.left}%`,
                top: `${particle.top}%`,
                animationDelay: `${particle.delay}s`,
                animationDuration: `${4 + Math.random() * 4}s`,
              }}
            />
          );
        }

        return (
          <span key={idx} className="snowflake" style={baseStyle}>
            ✦
          </span>
        );
      })}
    </div>
  );
};

export default SeasonalEffects;
