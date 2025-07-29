export const themeDesigns = {
  classic: {
    name: "Classic Casino",
    wheel: {
      background: "radial-gradient(circle at 30% 30%, #ffd700 0%, #daa520 25%, #b8860b 50%, #996515 75%, #704214 100%)",
      borderColor: "#5c3317",
      borderWidth: 8,
      shadow: "0 0 60px rgba(255, 215, 0, 0.6), 0 20px 40px rgba(0, 0, 0, 0.4), inset 0 -5px 10px rgba(0, 0, 0, 0.3)",
      pointerColor: "#ff0000",
      centerBg: "radial-gradient(circle, #5c3317 0%, #3e2312 100%)",
      centerShadow: "inset 0 2px 10px rgba(0, 0, 0, 0.5), 0 5px 20px rgba(0, 0, 0, 0.3)",
      lightColor: "#fff5e1",
      lightGlow: "0 0 15px rgba(255, 245, 225, 0.9)",
      segmentStroke: "#5c3317",
      segmentStrokeWidth: 3,
      textBg: "rgba(92, 51, 23, 0.85)",
      textShadow: "2px 2px 4px rgba(0, 0, 0, 0.8)",
      font: "'Playfair Display', Georgia, serif",
      decorations: {
        outerRing: true,
        studs: true,
        studColor: "#ffd700",
        studShadow: "inset -2px -2px 4px rgba(0, 0, 0, 0.3), 0 2px 4px rgba(255, 215, 0, 0.6)",
      }
    },
    segmentBox: {
      background: "linear-gradient(135deg, #faf0e6 0%, #f5e6d3 100%)",
      border: "3px solid #b8860b",
      shadow: "0 4px 15px rgba(184, 134, 11, 0.3), inset 0 1px 3px rgba(255, 255, 255, 0.5)",
      hoverShadow: "0 6px 20px rgba(184, 134, 11, 0.5), inset 0 1px 3px rgba(255, 255, 255, 0.7)",
      textColor: "#5c3317",
      decorativeCorners: true,
      cornerStyle: "url(#classic-corner)",
    }
  },
  modern: {
    name: "Modern Minimalist",
    wheel: {
      background: "linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 100%)",
      borderColor: "transparent",
      borderWidth: 0,
      shadow: "0 30px 60px rgba(0, 0, 0, 0.5), 0 0 100px rgba(255, 255, 255, 0.05)",
      pointerColor: "#00ff88",
      centerBg: "linear-gradient(135deg, #00ff88 0%, #00cc6a 100%)",
      centerShadow: "0 10px 30px rgba(0, 255, 136, 0.4)",
      lightColor: "#00ff88",
      lightGlow: "0 0 20px rgba(0, 255, 136, 0.8)",
      segmentStroke: "rgba(255, 255, 255, 0.1)",
      segmentStrokeWidth: 1,
      textBg: "rgba(0, 0, 0, 0.7)",
      textShadow: "0 2px 10px rgba(0, 255, 136, 0.5)",
      font: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      decorations: {
        outerRing: false,
        digitalGrid: true,
        gridColor: "rgba(0, 255, 136, 0.1)",
        pulseAnimation: true,
      }
    },
    segmentBox: {
      background: "linear-gradient(135deg, rgba(26, 26, 26, 0.9) 0%, rgba(13, 13, 13, 0.9) 100%)",
      border: "1px solid rgba(0, 255, 136, 0.3)",
      shadow: "0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)",
      hoverShadow: "0 12px 40px rgba(0, 255, 136, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
      textColor: "#ffffff",
      glowEffect: true,
      glowColor: "rgba(0, 255, 136, 0.2)",
    }
  },
  retro: {
    name: "Retro Arcade",
    wheel: {
      background: "conic-gradient(from 0deg at 50% 50%, #ff006e 0deg, #fb5607 72deg, #ffbe0b 144deg, #8338ec 216deg, #3a86ff 288deg, #ff006e 360deg)",
      borderColor: "#ff00ff",
      borderWidth: 6,
      shadow: "0 0 80px rgba(255, 0, 255, 0.6), 0 0 120px rgba(0, 255, 255, 0.4), 0 20px 40px rgba(0, 0, 0, 0.5)",
      pointerColor: "#00ffff",
      centerBg: "radial-gradient(circle, #ff00ff 0%, #00ffff 50%, #ff00ff 100%)",
      centerShadow: "0 0 40px rgba(255, 0, 255, 0.8), inset 0 0 20px rgba(0, 255, 255, 0.6)",
      lightColor: "#ffff00",
      lightGlow: "0 0 25px rgba(255, 255, 0, 0.9), 0 0 40px rgba(255, 0, 255, 0.6)",
      segmentStroke: "#000000",
      segmentStrokeWidth: 4,
      textBg: "rgba(0, 0, 0, 0.9)",
      textShadow: "0 0 10px currentColor, 2px 2px 0 #000",
      font: "'Press Start 2P', 'Courier New', monospace",
      decorations: {
        outerRing: true,
        neonTubes: true,
        tubeColors: ["#ff00ff", "#00ffff", "#ffff00"],
        scanlines: true,
        starfield: true,
      }
    },
    segmentBox: {
      background: "linear-gradient(135deg, #1a0033 0%, #330066 50%, #1a0033 100%)",
      border: "4px solid",
      borderImage: "linear-gradient(45deg, #ff00ff, #00ffff, #ffff00, #ff00ff) 1",
      shadow: "0 0 20px rgba(255, 0, 255, 0.5), 0 0 40px rgba(0, 255, 255, 0.3), inset 0 0 20px rgba(255, 255, 0, 0.1)",
      hoverShadow: "0 0 30px rgba(255, 0, 255, 0.7), 0 0 50px rgba(0, 255, 255, 0.5), inset 0 0 30px rgba(255, 255, 0, 0.2)",
      textColor: "#00ffff",
      textGlow: "0 0 10px currentColor",
      pixelatedCorners: true,
      animatedBorder: true,
    }
  }
};

export const getWheelStyles = (theme: keyof typeof themeDesigns) => {
  return themeDesigns[theme].wheel;
};

export const getSegmentBoxStyles = (theme: keyof typeof themeDesigns) => {
  return themeDesigns[theme].segmentBox;
};