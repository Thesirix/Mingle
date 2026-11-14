import { AnimatePresence } from "framer-motion";
import ServiceCard from "./ServiceCard";

export default function ServiceGrid({ services }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <AnimatePresence mode="popLayout">
        {services.map((service) => (
          <ServiceCard key={service.id} service={service} />
        ))}
      </AnimatePresence>
    </div>
  );
}
