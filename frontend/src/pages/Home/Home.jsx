import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FiArrowRight,
  FiEdit3,
  FiHeart,
  FiMessageCircle,
  FiSearch,
  FiShield,
  FiUsers,
} from "react-icons/fi";
import api from "@services/api";
import { useAuth } from "@contexts/AuthContext";
import ServiceGrid from "@components/services/ServiceGrid";
import CategoryCard from "@components/categories/CategoryCard";
import Reveal from "@components/ui/Reveal";
import Loader from "@components/ui/Loader";
import handsImage from "@assets/mains.jpg";
import seniorImage from "@assets/vieux.jpeg";

const STEPS = [
  {
    icon: FiEdit3,
    title: "Publiez votre service",
    text: "Décrivez ce que vous savez faire en quelques lignes : ménage, bricolage, aide numérique…",
  },
  {
    icon: FiMessageCircle,
    title: "Échangez en direct",
    text: "Les membres intéressés vous contactent via la messagerie intégrée pour s'organiser.",
  },
  {
    icon: FiHeart,
    title: "Rendez service",
    text: "Retrouvez-vous, entraidez-vous et laissez un commentaire pour remercier la communauté.",
  },
];

const VALUES = [
  { icon: FiUsers, title: "Solidarité", text: "Chacun a quelque chose à offrir et à recevoir." },
  { icon: FiHeart, title: "Bienveillance", text: "Le respect mutuel est au cœur de nos échanges." },
  { icon: FiShield, title: "Confiance", text: "Profils, commentaires et messagerie sécurisée." },
];

function Hero() {
  const { user, isLoggedIn } = useAuth();
  const [query, setQuery] = useState("");
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get("/categories")
      .then(({ data }) => setCategories(data))
      .catch(() => {});
  }, []);

  const handleSearch = (event) => {
    event.preventDefault();
    const term = query.trim();
    navigate(term ? `/services?q=${encodeURIComponent(term)}` : "/services");
  };

  return (
    <section className="container-page grid grid-cols-1 items-center gap-14 pb-20 pt-10 lg:grid-cols-2 lg:pt-16">
      <div>
        <motion.p
          className="badge mb-6 bg-white text-dark shadow-card"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <span className="h-2 w-2 rounded-full bg-primary" />
          {isLoggedIn && user ? `Bon retour, ${user.username} !` : "100 % gratuit, 100 % entraide"}
        </motion.p>

        <motion.h1
          className="text-4xl font-extrabold leading-[1.1] sm:text-5xl lg:text-6xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05, duration: 0.6 }}
        >
          L&apos;entraide entre voisins, <span className="text-primary">tout simplement.</span>
        </motion.h1>

        <motion.p
          className="mt-6 max-w-xl text-lg text-dark/65"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12, duration: 0.6 }}
        >
          Proposez vos talents, trouvez un coup de main près de chez vous et créez des liens humains
          précieux. Sur Mingle, les services s&apos;échangent gratuitement.
        </motion.p>

        <motion.form
          onSubmit={handleSearch}
          role="search"
          className="mt-8 flex max-w-xl items-center gap-2 rounded-full border border-dark/10 bg-white p-2 shadow-soft"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <FiSearch className="ml-4 shrink-0 text-xl text-dark/40" />
          <label htmlFor="home-search" className="sr-only">
            Rechercher un service
          </label>
          <input
            id="home-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Ménage, bricolage, smartphone…"
            className="min-w-0 flex-1 bg-transparent py-2 text-base placeholder:text-dark/40 focus:outline-none"
          />
          <button type="submit" className="btn-primary px-4 sm:px-6">
            Rechercher
          </button>
        </motion.form>

        {categories.length > 0 && (
          <motion.div
            className="mt-6 flex flex-wrap items-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
          >
            <span className="mr-1 text-sm font-semibold text-dark/50">Populaires :</span>
            {categories.slice(0, 4).map((category) => (
              <Link
                key={category.id}
                to={`/services?categorie=${category.id}`}
                className="rounded-full border border-dark/10 bg-white/70 px-4 py-1.5 text-sm font-medium transition hover:border-primary hover:text-primary"
              >
                {category.titre}
              </Link>
            ))}
          </motion.div>
        )}
      </div>

      <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
        <motion.div
          className="overflow-hidden rounded-4xl shadow-soft"
          initial={{ opacity: 0, scale: 0.94, rotate: -2 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <img
            src={handsImage}
            alt="Des mains réunies en signe d'entraide"
            className="aspect-[4/3.4] w-full object-cover"
          />
        </motion.div>

        <motion.div
          className="card absolute -bottom-8 -left-4 flex items-center gap-3 p-4 sm:-left-10"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0, y: [0, -8, 0] }}
          transition={{
            opacity: { delay: 0.5 },
            x: { delay: 0.5 },
            y: { repeat: Infinity, duration: 5, ease: "easeInOut" },
          }}
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-light text-xl text-primary">
            <FiHeart />
          </span>
          <div>
            <p className="text-sm font-bold">Service rendu !</p>
            <p className="text-xs text-dark/55">Montage d&apos;une bibliothèque</p>
          </div>
        </motion.div>

        <motion.div
          className="card absolute -right-2 -top-6 hidden w-44 overflow-hidden sm:block"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: [0, 8, 0] }}
          transition={{
            opacity: { delay: 0.7 },
            y: { repeat: Infinity, duration: 6, ease: "easeInOut" },
          }}
        >
          <img src={seniorImage} alt="" className="h-28 w-full object-cover" />
          <p className="px-3 py-2 text-xs font-semibold">Courses et compagnie pour nos aînés</p>
        </motion.div>
      </div>
    </section>
  );
}

export default function Home() {
  const [services, setServices] = useState(null);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    api
      .get("/services")
      .then(({ data }) => setServices(data))
      .catch(() => setServices([]));
    api
      .get("/categories")
      .then(({ data }) => setCategories(data))
      .catch(() => {});
  }, []);

  return (
    <>
      <Hero />

      {/* Comment ça marche */}
      <section className="container-page py-16">
        <Reveal className="mx-auto mb-12 max-w-2xl text-center">
          <p className="eyebrow mb-2">Comment ça marche</p>
          <h2 className="section-title">Trois étapes pour s&apos;entraider</h2>
        </Reveal>
        <div className="grid gap-6 md:grid-cols-3">
          {STEPS.map((step, index) => (
            <Reveal key={step.title} delay={index * 0.1} className="card relative p-8">
              <span className="absolute right-6 top-6 text-5xl font-extrabold text-light">
                {index + 1}
              </span>
              <span className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-xl text-white shadow-md shadow-primary/30">
                <step.icon />
              </span>
              <h3 className="text-xl">{step.title}</h3>
              <p className="mt-2 text-dark/60">{step.text}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Derniers services */}
      <section className="container-page py-16">
        <Reveal className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="eyebrow mb-2">À la une</p>
            <h2 className="section-title">Les derniers services publiés</h2>
          </div>
          <Link to="/services" className="btn-outline w-fit">
            Voir tous les services <FiArrowRight />
          </Link>
        </Reveal>
        {services === null ? <Loader /> : <ServiceGrid services={services.slice(0, 6)} />}
      </section>

      {/* Catégories */}
      {categories.length > 0 && (
        <section className="container-page py-16">
          <Reveal className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="eyebrow mb-2">Catégories</p>
              <h2 className="section-title">Trouvez l&apos;aide qu&apos;il vous faut</h2>
            </div>
            <Link to="/categories" className="btn-outline w-fit">
              Toutes les catégories <FiArrowRight />
            </Link>
          </Reveal>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {categories.slice(0, 4).map((category, index) => (
              <Reveal key={category.id} delay={index * 0.08}>
                <CategoryCard category={category} />
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* Valeurs */}
      <section className="container-page py-16">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <img
              src={seniorImage}
              alt="Une personne âgée accompagnée par un bénévole"
              className="aspect-[4/3] w-full rounded-4xl object-cover shadow-soft"
            />
          </Reveal>
          <Reveal delay={0.1}>
            <p className="eyebrow mb-2">Nos valeurs</p>
            <h2 className="section-title">Bien plus qu&apos;une plateforme d&apos;échange</h2>
            <p className="mt-5 text-dark/65">
              Dans un monde souvent centré sur l&apos;individualisme, Mingle remet l&apos;entraide
              et le partage au centre. Nous sommes convaincus que chacun a quelque chose à offrir et
              que le partage de nos compétences et de notre temps peut transformer des vies.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {VALUES.map((value) => (
                <div key={value.title} className="rounded-2xl bg-white p-4 shadow-card">
                  <value.icon className="mb-3 text-xl text-primary" />
                  <p className="font-bold">{value.title}</p>
                  <p className="mt-1 text-xs text-dark/60">{value.text}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Appel à l'action */}
      <section className="container-page pt-16">
        <Reveal className="relative overflow-hidden rounded-4xl bg-dark px-8 py-14 text-center sm:px-16">
          <div
            aria-hidden="true"
            className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/30 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-secondary/20 blur-3xl"
          />
          <h2 className="relative text-3xl text-white sm:text-4xl">
            Vous avez un talent à partager ?
          </h2>
          <p className="relative mx-auto mt-4 max-w-xl text-white/70">
            Rejoignez la communauté Mingle et proposez votre premier service en moins de deux
            minutes.
          </p>
          <Link to="/publier" className="btn-primary relative mt-8 px-8 py-3 text-base">
            Publier un service <FiArrowRight />
          </Link>
        </Reveal>
      </section>
    </>
  );
}
