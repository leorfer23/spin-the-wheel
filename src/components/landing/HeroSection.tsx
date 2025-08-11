import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { FortuneWheel } from "../wheel/FortuneWheel";
import { MinimalCelebration } from "../MinimalCelebration";
import { Button } from "../ui/button";
import { Sparkles, ArrowRight, Star, ChevronDown } from "lucide-react";
import type { WheelConfig, SpinResult } from "../../types/wheel.types";

const createWheelConfig = (isMobile: boolean): WheelConfig => ({
  segments: [
    { id: "1", label: "50% OFF", value: "50OFF", color: "#FF6B6B", weight: 1 },
    { id: "2", label: "FREE GIFT", value: "GIFT", color: "#4ECDC4", weight: 1 },
    { id: "3", label: "30% OFF", value: "30OFF", color: "#FF8C42", weight: 2 },
    { id: "4", label: "20% OFF", value: "20OFF", color: "#95A99C", weight: 3 },
    {
      id: "5",
      label: "SPIN AGAIN",
      value: "AGAIN",
      color: "#FFD93D",
      textColor: "#333",
      weight: 2,
    },
    { id: "6", label: "FREE SHIP", value: "SHIP", color: "#E84855", weight: 2 },
  ],
  dimensions: {
    diameter: isMobile ? 350 : 550,
    innerRadius: isMobile ? 40 : 60,
    pegRingWidth: isMobile ? 30 : 40,
    pegSize: isMobile ? 10 : 14,
    pegCount: isMobile ? 8 : 12,
  },
  style: {
    shadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
    borderColor: "#ffffff",
    borderWidth: 12,
  },
  centerCircle: {
    text: "SPIN",
    backgroundColor: "#ffffff",
    textColor: "#666666",
    fontSize: 18,
    showButton: true,
  },
  pointer: {
    color: "#FF1744",
    size: 50,
    style: "arrow",
  },
  spinConfig: {
    duration: 5,
    easing: "ease-out",
    minRotations: 4,
    maxRotations: 6,
    allowDrag: !isMobile,
  },
});

export const HeroSection: React.FC = () => {
  const navigate = useNavigate();
  const [spinResult, setSpinResult] = useState<SpinResult | null>(null);
  const [hasSpun, setHasSpun] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [audioEnabled] = useState(true);
  const { scrollY } = useScroll();

  const wheelY = useTransform(scrollY, [0, 300], [0, isMobile ? -20 : -50]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const wheelConfig = createWheelConfig(isMobile);

  const playWheelSound = () => {
    if (audioEnabled && typeof window !== "undefined") {
      const audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.type = "square";
      oscillator.frequency.setValueAtTime(200, audioContext.currentTime);

      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(
        0.1,
        audioContext.currentTime + 0.1
      );
      gainNode.gain.linearRampToValueAtTime(0.05, audioContext.currentTime + 3);
      gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 4.5);

      oscillator.frequency.exponentialRampToValueAtTime(
        800,
        audioContext.currentTime + 1
      );
      oscillator.frequency.exponentialRampToValueAtTime(
        100,
        audioContext.currentTime + 4
      );

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 5);
    }
  };

  const handleSpinComplete = (result: SpinResult) => {
    setSpinResult(result);
    setHasSpun(true);
  };

  useEffect(() => {
    if (!hasSpun) {
      const timer = setTimeout(() => {
        playWheelSound();
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [hasSpun]);

  return (
    <motion.section className="relative flex items-start px-6 sm:px-8 lg:px-12 pt-8 pb-12 lg:pt-24 lg:pb-16">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/50" />

      <div className="max-w-7xl lg:max-w-[1200px] mx-auto grid lg:grid-cols-2 gap-8 lg:gap-12 items-center relative z-10">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center lg:text-left order-2 lg:order-1 px-4 sm:px-0"
        >
          <div className="mb-8 hidden lg:block">
            <img
              src="/rooleta_wordmark_transparent.png"
              alt="Rooleta"
              className="h-12 w-auto"
            />
          </div>

          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm lg:text-base font-medium mb-6"
          >
            <Sparkles size={16} />
            App #1 de Ruletas para Tiendanube
          </motion.div>

          <h1 className="text-3xl sm:text-4xl lg:text-6xl xl:text-7xl font-bold mb-6">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Incrementa las Ventas
            </span>
            <br />
            <span className="text-gray-800">de tu Tiendanube</span>
          </h1>

          <p className="text-base sm:text-lg lg:text-xl text-gray-600 mb-8 max-w-xl mx-auto lg:mx-0">
            Ruleta de premios y juegos interactivos para tu tienda online.
            Integración nativa con Tiendanube en 5 minutos. Aumenta conversiones
            garantizado.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 sm:px-8 py-4 sm:py-6 text-base sm:text-lg rounded-2xl shadow-lg shadow-blue-500/25 w-full sm:w-auto"
                onClick={() => navigate("/signup")}
              >
                Empieza Gratis
                <ArrowRight className="ml-2" size={20} />
              </Button>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="outline"
                size="lg"
                className="px-6 sm:px-8 py-4 sm:py-6 text-base sm:text-lg rounded-2xl border-2 w-full sm:w-auto"
                onClick={() => navigate("/signup")}
              >
                Prueba Gratis
              </Button>
            </motion.div>
          </div>

          <div className="mt-4 text-center lg:text-left">
            <p className="text-sm text-gray-600">
              ¿Ya tienes una cuenta?{" "}
              <button
                onClick={() => navigate("/login")}
                className="text-blue-600 hover:text-blue-700 font-medium underline"
              >
                Inicia sesión aquí
              </button>
            </p>
          </div>

          <div className="mt-8 sm:mt-12 flex flex-col sm:flex-row items-center gap-4 sm:gap-8 justify-center lg:justify-start">
            <div className="flex -space-x-2">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 border-2 border-white flex items-center justify-center"
                >
                  <Star size={14} className="text-white sm:w-4 sm:h-4" />
                </div>
              ))}
            </div>
            <p className="text-xs sm:text-sm text-gray-600">
              <span className="font-semibold">10,000+</span> tiendas confían en
              nosotros
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          style={{ y: wheelY }}
          className="relative order-1 lg:order-2 mb-8 lg:mb-0"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-2xl lg:blur-3xl" />
          <div className="relative flex justify-center">
            <div className="relative">
              <FortuneWheel
                config={wheelConfig}
                onSpinComplete={handleSpinComplete}
                hidePointer={!!spinResult}
                autoSpin={true}
                autoSpinDelay={800}
              />

              <MinimalCelebration
                result={spinResult}
                onClose={() => setSpinResult(null)}
              />
            </div>

            {!hasSpun && (
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{ delay: 0.5, type: "spring", stiffness: 100 }}
                className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full sm:bottom-auto sm:left-auto sm:right-0 sm:-right-16 lg:-right-24 sm:top-1/2 sm:-translate-y-1/2 sm:translate-y-0 z-20"
              >
                <motion.div
                  animate={{
                    rotate: [0, -10, 0, 10, 0],
                    x: isMobile ? 0 : [0, -10, 0, 10, 0],
                    y: isMobile ? [0, -10, 0, 10, 0] : 0,
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="relative"
                >
                  <div className="text-4xl sm:text-6xl lg:text-8xl transform -rotate-90 sm:rotate-180">
                    👉
                  </div>

                  <motion.div
                    animate={{
                      scale: [1, 1.1, 1],
                      rotate: [-5, 5, -5],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="absolute -bottom-10 left-1/2 -translate-x-1/2 sm:bottom-auto sm:-top-12 lg:-top-16 sm:left-1/2 sm:-translate-x-1/2 whitespace-nowrap"
                  >
                    <div className="bg-gradient-to-r from-red-500 to-yellow-500 text-white font-black text-lg sm:text-2xl lg:text-3xl px-3 sm:px-4 py-1 sm:py-2 rounded-full shadow-lg transform -rotate-12">
                      ¡GIRA!
                    </div>
                  </motion.div>

                  <motion.div
                    animate={{
                      opacity: [0, 1, 0],
                      scale: [0.5, 1, 0.5],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: 0.5,
                    }}
                    className="absolute -top-4 -right-4"
                  >
                    <Sparkles className="text-yellow-400 w-6 h-6" />
                  </motion.div>

                  <motion.div
                    animate={{
                      opacity: [0, 1, 0],
                      scale: [0.5, 1, 0.5],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: 1,
                    }}
                    className="absolute -bottom-4 -left-4"
                  >
                    <Sparkles className="text-purple-400 w-5 h-5" />
                  </motion.div>
                </motion.div>
              </motion.div>
            )}

            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute -top-2 -right-2 sm:-top-4 sm:-right-4 bg-white rounded-xl sm:rounded-2xl shadow-lg px-3 py-1.5 sm:px-4 sm:py-2 hidden sm:block"
            >
              <p className="text-xs sm:text-sm font-semibold text-purple-600">
                +35% Ventas
              </p>
            </motion.div>

            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 3, repeat: Infinity, delay: 1 }}
              className="absolute -bottom-2 -left-2 sm:-bottom-4 sm:-left-4 bg-white rounded-xl sm:rounded-2xl shadow-lg px-3 py-1.5 sm:px-4 sm:py-2 hidden sm:block"
            >
              <p className="text-xs sm:text-sm font-semibold text-purple-600">
                2M+ Giros
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>

      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <ChevronDown size={32} className="text-gray-400" />
      </motion.div>
    </motion.section>
  );
};
