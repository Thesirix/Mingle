import { motion } from "framer-motion";

/** Fait apparaître son contenu en fondu lorsqu'il entre dans l'écran. */
export default function Reveal({ children, delay = 0, y = 24, className = "", as = "div" }) {
  const Component = motion[as];

  return (
    <Component
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </Component>
  );
}
