import illustration from "@assets/illustration-politique.svg";
import LegalPage from "./LegalPage";

const SECTIONS = [
  {
    title: "Données collectées",
    content:
      "Nous collectons les informations que vous nous fournissez lors de l'inscription (nom d'utilisateur, adresse mail, ville), celles que vous ajoutez à votre profil (photo, biographie, services proposés) ainsi que le contenu que vous publiez : services, commentaires et messages.",
  },
  {
    title: "Utilisation des informations",
    content:
      "Ces informations servent uniquement à faire fonctionner la plateforme : gérer votre compte, afficher vos services, permettre les échanges entre membres et assurer la sécurité de Mingle. Votre adresse mail n'est jamais affichée publiquement.",
  },
  {
    title: "Sécurité",
    content:
      "Les mots de passe sont chiffrés avec l'algorithme Argon2 et ne sont jamais stockés en clair. Les échanges avec la plateforme sont authentifiés par un jeton à durée limitée et vos conversations ne sont accessibles qu'à leurs participants.",
  },
  {
    title: "Partage des données",
    content:
      "Vos données personnelles ne sont ni vendues ni cédées à des tiers. Elles peuvent uniquement être communiquées aux autorités compétentes lorsque la loi l'exige.",
  },
  {
    title: "Vos droits",
    content:
      "Conformément au RGPD, vous pouvez à tout moment consulter et modifier vos informations depuis votre profil, ou supprimer définitivement votre compte et l'ensemble des données associées. Pour toute question, contactez-nous via le formulaire de contact.",
  },
];

export default function Privacy() {
  return (
    <LegalPage
      eyebrow="Informations légales"
      title="Politique de confidentialité"
      intro="Nous accordons une importance primordiale à la protection de votre vie privée. Cette politique explique quelles informations nous recueillons et comment nous les protégeons."
      updatedAt="1er juillet 2024"
      illustration={illustration}
      illustrationAlt="Illustration d'un homme tenant un téléphone, entouré de formes géométriques colorées."
      sections={SECTIONS}
      link={{ to: "/contact", label: "Nous contacter" }}
    />
  );
}
