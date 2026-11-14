import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import Reveal from "@components/ui/Reveal";

/**
 * Mise en page commune aux pages légales.
 * @param {{ title: string, intro: string, illustration: string, sections: {title: string, content: string}[], link: {to: string, label: string} }} props
 */
export default function LegalPage({
  eyebrow,
  title,
  intro,
  illustration,
  illustrationAlt,
  sections,
  link,
  updatedAt,
}) {
  return (
    <div className="container-page py-12">
      <div className="grid gap-12 lg:grid-cols-[1fr_380px]">
        <div>
          <p className="eyebrow mb-2">{eyebrow}</p>
          <h1 className="section-title">{title}</h1>
          <p className="mt-4 text-dark/65">{intro}</p>
          <p className="mt-2 text-xs text-dark/45">Dernière mise à jour : {updatedAt}</p>

          <div className="mt-10 space-y-5">
            {sections.map((section, index) => (
              <Reveal key={section.title} delay={index * 0.05} className="card p-6 sm:p-8">
                <h2 className="mb-3 flex items-center gap-3 text-lg">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-light text-sm font-extrabold text-primary">
                    {index + 1}
                  </span>
                  {section.title}
                </h2>
                <p className="leading-relaxed text-dark/70">{section.content}</p>
              </Reveal>
            ))}
          </div>

          {link && (
            <Link to={link.to} className="btn-outline mt-8">
              {link.label} <FiArrowRight />
            </Link>
          )}
        </div>
        <aside className="hidden lg:block">
          <img src={illustration} alt={illustrationAlt} className="sticky top-28 w-full" />
        </aside>
      </div>
    </div>
  );
}
