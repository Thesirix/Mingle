import { Link } from "react-router-dom";
import {
  FiArrowRight,
  FiCompass,
  FiFlag,
  FiHeart,
  FiShield,
  FiSmile,
  FiUsers,
} from "react-icons/fi";
import Reveal from "@components/ui/Reveal";
import handsImage from "@assets/mains.jpg";
import seniorImage from "@assets/vieux.jpeg";

const PILLARS = [
  {
    icon: FiFlag,
    title: "Notre histoire",
    text: "Mingle est né d'un constat simple : autour de nous, beaucoup de personnes ont besoin d'un coup de main, et beaucoup d'autres ont du temps et des compétences à partager. Il manquait un lieu pour les réunir.",
  },
  {
    icon: FiCompass,
    title: "Notre vision",
    text: "Un quartier où chacun peut demander de l'aide sans gêne et en proposer sans contrepartie. Une entraide de proximité, accessible à tous, quel que soit son âge ou son aisance avec le numérique.",
  },
  {
    icon: FiHeart,
    title: "Notre mission",
    text: "Offrir une plateforme simple, gratuite et bienveillante pour publier des services, échanger en toute confiance et créer des liens durables entre voisins.",
  },
];

const COMMITMENTS = [
  {
    icon: FiUsers,
    title: "Gratuité",
    text: "Aucun service n'est rémunéré : l'échange se fait dans un esprit de solidarité.",
  },
  {
    icon: FiShield,
    title: "Sécurité",
    text: "Mots de passe chiffrés, messagerie privée et données protégées.",
  },
  {
    icon: FiSmile,
    title: "Simplicité",
    text: "Une interface pensée pour être utilisée par tous, sur mobile comme sur ordinateur.",
  },
];

export default function About() {
  return (
    <div className="container-page py-12">
      <section className="grid items-center gap-12 lg:grid-cols-2">
        <Reveal>
          <p className="eyebrow mb-2">À propos</p>
          <h1 className="text-4xl font-extrabold leading-tight sm:text-5xl">
            Remettre l&apos;entraide au cœur de nos quartiers
          </h1>
          <p className="mt-6 text-lg text-dark/65">
            Chez Mingle, nous croyons fermement en la puissance de la communauté. Nos valeurs
            fondamentales sont la solidarité, la bienveillance et l&apos;inclusivité. Nous créons un
            espace où chacun peut trouver du soutien et offrir son aide, quelles que soient ses
            compétences ou ses besoins.
          </p>
        </Reveal>
        <Reveal delay={0.1} className="grid grid-cols-2 gap-4">
          <img
            src={handsImage}
            alt="Des mains réunies"
            className="aspect-[3/4] w-full rounded-3xl object-cover shadow-soft"
          />
          <img
            src={seniorImage}
            alt="Un moment de partage entre générations"
            className="mt-12 aspect-[3/4] w-full rounded-3xl object-cover shadow-soft"
          />
        </Reveal>
      </section>

      <section className="mt-24 grid gap-6 md:grid-cols-3">
        {PILLARS.map((pillar, index) => (
          <Reveal key={pillar.title} delay={index * 0.1} className="card p-8">
            <span className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-light text-xl text-primary">
              <pillar.icon />
            </span>
            <h2 className="text-xl">{pillar.title}</h2>
            <p className="mt-3 leading-relaxed text-dark/65">{pillar.text}</p>
          </Reveal>
        ))}
      </section>

      <section className="mt-24 rounded-4xl bg-dark px-6 py-14 text-white sm:px-12">
        <Reveal className="mx-auto mb-12 max-w-2xl text-center">
          <p className="eyebrow mb-2 text-secondary">Nos engagements</p>
          <h2 className="text-3xl text-white sm:text-4xl">Une plateforme digne de confiance</h2>
        </Reveal>
        <div className="grid gap-8 md:grid-cols-3">
          {COMMITMENTS.map((item, index) => (
            <Reveal key={item.title} delay={index * 0.1} className="text-center">
              <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-2xl text-secondary">
                <item.icon />
              </span>
              <h3 className="text-lg text-white">{item.title}</h3>
              <p className="mt-2 text-sm text-white/65">{item.text}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <Reveal className="mt-20 text-center">
        <h2 className="section-title">Prêt à rejoindre l&apos;aventure ?</h2>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to="/connexion" className="btn-primary px-8 py-3">
            Créer un compte <FiArrowRight />
          </Link>
          <Link to="/services" className="btn-outline px-8 py-3">
            Découvrir les services
          </Link>
        </div>
      </Reveal>
    </div>
  );
}
