import { useState } from "react";
import { motion } from "framer-motion";
import { CalcBot } from "./CalcBot";

export function FloatingChatBot() {
  const [isChatBotOpen, setIsChatBotOpen] = useState(false);

  return (
    <>
      <motion.button
        onClick={() => setIsChatBotOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full flex items-center justify-center shadow-2xl cursor-pointer group"
        style={{
          background: "linear-gradient(135deg, #FF00FF 0%, #9B5DE5 100%)",
          boxShadow: "0 0 30px rgba(255, 0, 255, 0.4), 0 0 60px rgba(155, 93, 229, 0.3)",
        }}
        whileHover={{
          scale: 1.1,
          boxShadow: "0 0 40px rgba(255, 0, 255, 0.6), 0 0 80px rgba(155, 93, 229, 0.5)",
        }}
        whileTap={{ scale: 0.95 }}
        animate={{
          y: [0, -8, 0],
          boxShadow: [
            "0 0 30px rgba(255, 0, 255, 0.4), 0 0 60px rgba(155, 93, 229, 0.3)",
            "0 0 35px rgba(255, 0, 255, 0.5), 0 0 70px rgba(155, 93, 229, 0.4)",
            "0 0 30px rgba(255, 0, 255, 0.4), 0 0 60px rgba(155, 93, 229, 0.3)",
          ],
        }}
        transition={{
          y: {
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut",
          },
          boxShadow: {
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut",
          },
        }}
      >
        {/* Robot Face */}
        <div className="relative w-full h-full flex items-center justify-center">
          {/* Face Circle */}
          <div className="absolute inset-2 rounded-full bg-white/10 backdrop-blur-sm" />
          
          {/* Eyes */}
          <div className="absolute top-5 left-4 w-2 h-2 rounded-full bg-white animate-pulse" />
          <div className="absolute top-5 right-4 w-2 h-2 rounded-full bg-white animate-pulse" />
          
          {/* Smile */}
          <svg
            className="absolute bottom-4"
            width="24"
            height="12"
            viewBox="0 0 24 12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M2 2C2 2 7 10 12 10C17 10 22 2 22 2"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </motion.button>

      <CalcBot isOpen={isChatBotOpen} onOpenChange={setIsChatBotOpen} />
    </>
  );
}
