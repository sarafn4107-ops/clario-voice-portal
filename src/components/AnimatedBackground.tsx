import { motion } from "framer-motion";

export function AnimatedBackground() {
  const waves = Array.from({ length: 5 }, (_, i) => i);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-10">
      {/* Animated sound waves */}
      <div className="absolute left-0 bottom-0 w-full h-32 flex items-end justify-around gap-2 px-8">
        {waves.map((i) => (
          <motion.div
            key={i}
            className="w-2 bg-primary rounded-t-full"
            animate={{
              height: ["20%", "80%", "20%"],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.2,
            }}
          />
        ))}
      </div>

      {/* Floating mic silhouettes */}
      <motion.svg
        className="absolute top-20 right-20 w-24 h-24 text-secondary"
        animate={{
          y: [0, -20, 0],
          rotate: [0, 5, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
      >
        <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
        <line x1="12" x2="12" y1="19" y2="22" />
      </motion.svg>

      <motion.svg
        className="absolute bottom-40 left-32 w-16 h-16 text-accent"
        animate={{
          y: [0, 15, 0],
          rotate: [0, -5, 0],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
      >
        <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
        <line x1="12" x2="12" y1="19" y2="22" />
      </motion.svg>
    </div>
  );
}
