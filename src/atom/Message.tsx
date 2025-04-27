import { motion, AnimatePresence } from "framer-motion";

type MessageProps = {
  message: string;
  show: boolean;
  type: "success" | "error";
};

const slideVariants = {
  hidden: { x: "100%", opacity: 0 },
  visible: { x: 0, opacity: 1 },
  exit: { x: "100%", opacity: 0 },
};

export const Message = ({ message, show, type }: MessageProps) => {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={slideVariants}
          transition={{ duration: 0.5 }}
          className={`fixed top-5 right-5  text-white px-6 py-3 rounded-lg shadow-lg z-50 ${
            type === "error" ? "bg-red-500" : "bg-green-500"
          }`}
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
