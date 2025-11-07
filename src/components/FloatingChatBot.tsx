import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CalcBot } from "./CalcBot";

export function FloatingChatBot() {
  const [isChatBotOpen, setIsChatBotOpen] = useState(false);
  const [showGreeting, setShowGreeting] = useState(false);
  const [isBlinking, setIsBlinking] = useState(false);

  useEffect(() => {
    // Show greeting after initial pop-in animation
    const greetingTimer = setTimeout(() => {
      setShowGreeting(true);
    }, 1500);

    // Hide greeting after 3-4 seconds
    const hideGreetingTimer = setTimeout(() => {
      setShowGreeting(false);
    }, 5500);

    // Start periodic blinking
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 200);
    }, 4000);

    return () => {
      clearTimeout(greetingTimer);
      clearTimeout(hideGreetingTimer);
      clearInterval(blinkInterval);
    };
  }, []);

  return (
    <>
      {/* Speech Bubble */}
      <AnimatePresence>
        {showGreeting && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.8 }}
            transition={{ duration: 0.5 }}
            className="fixed bottom-28 right-6 z-50 bg-gradient-to-br from-purple-600 to-pink-600 text-white px-4 py-3 rounded-2xl shadow-2xl max-w-xs"
            style={{
              boxShadow: "0 10px 40px rgba(160, 32, 240, 0.4)",
            }}
          >
            <p className="text-sm font-medium">
              👋 Hi, I'm CalcBot! Need help calculating?
            </p>
            {/* Speech bubble tail */}
            <div
              className="absolute -bottom-2 right-8 w-4 h-4 bg-gradient-to-br from-purple-600 to-pink-600 transform rotate-45"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3D Robot Head */}
      <motion.button
        onClick={() => setIsChatBotOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-20 h-20 cursor-pointer group"
        initial={{ scale: 0, rotate: -180 }}
        animate={{
          scale: 1,
          rotate: 0,
          y: [0, -10, 0],
        }}
        transition={{
          scale: { duration: 0.6, type: "spring", bounce: 0.5 },
          rotate: { duration: 0.6 },
          y: {
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          },
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        {/* Purple Glow Ring */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: "linear-gradient(135deg, #A020F0 0%, #FF00FF 100%)",
            filter: "blur(15px)",
            opacity: 0.6,
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.6, 0.8, 0.6],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Robot Head Container with 3D effect */}
        <div
          className="relative w-full h-full rounded-full flex items-center justify-center"
          style={{
            background: "linear-gradient(135deg, #ffffff 0%, #e0e0e0 100%)",
            boxShadow: `
              0 4px 15px rgba(0, 0, 0, 0.3),
              inset 0 2px 5px rgba(255, 255, 255, 0.8),
              inset 0 -2px 5px rgba(0, 0, 0, 0.1)
            `,
            transform: "perspective(500px) rotateX(5deg)",
          }}
        >
          {/* Inner Face Circle */}
          <div
            className="absolute inset-2 rounded-full"
            style={{
              background: "linear-gradient(145deg, #f5f5f5, #d5d5d5)",
              boxShadow: "inset 0 2px 8px rgba(0, 0, 0, 0.15)",
            }}
          />

          {/* Eyes Container */}
          <div className="relative z-10 flex gap-3">
            {/* Left Eye */}
            <motion.div
              className="relative w-4 h-4"
              animate={{
                scaleY: isBlinking ? 0.1 : 1,
              }}
              transition={{ duration: 0.1 }}
            >
              <div
                className="w-full h-full rounded-full"
                style={{
                  background: "radial-gradient(circle at 30% 30%, #60a5fa, #1e40af)",
                  boxShadow: `
                    0 0 10px rgba(96, 165, 250, 0.8),
                    inset 0 1px 2px rgba(255, 255, 255, 0.5)
                  `,
                }}
              />
              {/* Eye Shine */}
              <div
                className="absolute top-0.5 left-0.5 w-1.5 h-1.5 rounded-full bg-white opacity-80"
              />
            </motion.div>

            {/* Right Eye */}
            <motion.div
              className="relative w-4 h-4"
              animate={{
                scaleY: isBlinking ? 0.1 : 1,
              }}
              transition={{ duration: 0.1 }}
            >
              <div
                className="w-full h-full rounded-full"
                style={{
                  background: "radial-gradient(circle at 30% 30%, #60a5fa, #1e40af)",
                  boxShadow: `
                    0 0 10px rgba(96, 165, 250, 0.8),
                    inset 0 1px 2px rgba(255, 255, 255, 0.5)
                  `,
                }}
              />
              {/* Eye Shine */}
              <div
                className="absolute top-0.5 left-0.5 w-1.5 h-1.5 rounded-full bg-white opacity-80"
              />
            </motion.div>
          </div>

          {/* Smile */}
          <svg
            className="absolute bottom-3 z-10"
            width="28"
            height="14"
            viewBox="0 0 28 14"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M3 3C3 3 8 11 14 11C20 11 25 3 25 3"
              stroke="url(#smileGradient)"
              strokeWidth="2.5"
              strokeLinecap="round"
              style={{
                filter: "drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2))",
              }}
            />
            <defs>
              <linearGradient id="smileGradient" x1="3" y1="3" x2="25" y2="11">
                <stop offset="0%" stopColor="#A020F0" />
                <stop offset="100%" stopColor="#FF00FF" />
              </linearGradient>
            </defs>
          </svg>

          {/* Antenna */}
          <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-1 h-3 bg-gradient-to-b from-gray-400 to-gray-300 rounded-full">
            <div
              className="absolute -top-1.5 left-1/2 transform -translate-x-1/2 w-2 h-2 rounded-full"
              style={{
                background: "radial-gradient(circle at 30% 30%, #FF00FF, #A020F0)",
                boxShadow: "0 0 8px rgba(255, 0, 255, 0.8)",
              }}
            />
          </div>
        </div>

        {/* Bottom Shadow */}
        <div
          className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-16 h-3 rounded-full bg-black opacity-20"
          style={{
            filter: "blur(6px)",
          }}
        />
      </motion.button>

      <CalcBot isOpen={isChatBotOpen} onOpenChange={setIsChatBotOpen} />
    </>
  );
}
