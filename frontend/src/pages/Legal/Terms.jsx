import illustration from "@assets/illustration-conditions.svg";
import LegalPage from "./LegalPage";

const SECTIONS = [
  {
    title: "Responsabilités de l'utilisateur",
    content:
      "En utilisant notre plateforme, vous acceptez de fournir des informations exactes et à jour lors de l'inscription. Vous vous engagez également à maintenir la confidentialité de votre identifiant et mot de passe, et à nous informer immédiatement en cas d'utilisation non autorisée de votre compte ou de toute autre violation de sécurité. Vous vous engagez enfin à utiliser la plateforme de manière légale et conforme aux présentes conditions, en respectant les droits de propriété intellectuelle et la vie privée des autres utilisateurs.",
  },
  {
    title: "Gratuité des services",
    content:
      "Mingle est une plateforme d'entraide : les services proposés sont rendus bénévolement et ne peuvent donner lieu à aucune rémunération, directe ou indirecte. Toute annonce à caractère commercial pourra être supprimée sans préavis.",
  },
  {
    title: "Politiques de la plateforme",
    content:
      "Notre plateforme s'engage à fournir un service fiable et sécurisé, en protégeant vos données personnelles conformément à notre politique de confidentialité. Nous mettons régulièrement à jour la plateforme pour améliorer ses fonctionnalités et sa sécurité, et nous nous engageons à répondre rapidement aux préoccupations des utilisateurs, dans le respect des lois et réglementations en vigueur.",
  },
  {
    title: "Activités interdites",
    content:
      "Il est strictement interdit d'utiliser la plateforme pour des activités illégales, frauduleuses ou nuisibles. Vous ne devez pas publier de contenu diffamatoire, obscène, offensant ou incitant à la haine. Le harcèlement, les menaces ou les abus envers d'autres utilisateurs sont interdits, de même que toute tentative de contourner les mesures de sécurité ou d'accéder à la plateforme par des moyens automatisés.",
  },
  {
    title: "Droits et responsabilités",
    content:
      "Nous nous réservons le droit de modifier ces conditions à tout moment pour refléter des changements juridiques, opérationnels ou réglementaires. En cas de violation des présentes conditions, nous pouvons suspendre ou résilier votre compte. Vous avez le droit d'accéder à la plateforme conformément aux présentes conditions, d'être informé de leurs modifications et de nous soumettre vos suggestions.",
  },
];

export default function Terms() {
  return (
    <LegalPage
      eyebrow="Informations légales"
      title="Conditions d'utilisation"
      intro="Ces conditions encadrent l'utilisation de Mingle. Merci de les lire attentivement avant de créer votre compte."
      updatedAt="1er juillet 2024"
      illustration={illustration}
      illustrationAlt="Illustration d'une femme tenant un téléphone, entourée de formes géométriques colorées."
      sections={SECTIONS}
      link={{ to: "/politique-de-confidentialite", label: "Politique de confidentialité" }}
    />
  );
}
