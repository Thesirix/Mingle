// Jeu de données de la démo statique (reprend backend/database.sql).
// Les dates sont calculées par rapport à aujourd'hui pour que la démo reste fraîche.

const ago = (days, hours = 0, minutes = 0) =>
  new Date(Date.now() - ((days * 24 + hours) * 60 + minutes) * 60 * 1000).toISOString();

export default function createSeed() {
  const users = [
    {
      id: 1,
      username: "Admin Mingle",
      mail: "admin@mingle.fr",
      user_pass: "Admin123!",
      localisation: "Paris",
      avatar: null,
      biographie: "Compte d'administration de la plateforme Mingle.",
      service_type: null,
      is_admin: true,
      created_at: ago(200),
    },
    {
      id: 2,
      username: "Claire Martin",
      mail: "claire.martin@example.com",
      user_pass: "Mingle123!",
      localisation: "Lyon",
      avatar: null,
      biographie:
        "Professeure des écoles à la retraite, j'adore transmettre et rendre service à mes voisins.",
      service_type: "Aide au devoir, Aide aux repas",
      is_admin: false,
      created_at: ago(188),
    },
    {
      id: 3,
      username: "Karim Benali",
      mail: "karim.benali@example.com",
      user_pass: "Mingle123!",
      localisation: "Marseille",
      avatar: null,
      biographie:
        "Bricoleur du dimanche devenu expert en petites réparations. Toujours partant pour un coup de main !",
      service_type: "Aide au bricolage, Aide au covoiturage",
      is_admin: false,
      created_at: ago(181),
    },
    {
      id: 4,
      username: "Sophie Durand",
      mail: "sophie.durand@example.com",
      user_pass: "Mingle123!",
      localisation: "Nantes",
      avatar: null,
      biographie:
        "Développeuse web, je peux vous aider avec votre ordinateur, votre smartphone ou vos démarches en ligne.",
      service_type: "Aide au devoir",
      is_admin: false,
      created_at: ago(174),
    },
    {
      id: 5,
      username: "Lucas Petit",
      mail: "lucas.petit@example.com",
      user_pass: "Mingle123!",
      localisation: "Lille",
      avatar: null,
      biographie:
        "Étudiant, disponible le week-end pour accompagner les personnes âgées ou garder des enfants.",
      service_type: "Aide Garde d'enfants",
      is_admin: false,
      created_at: ago(170),
    },
  ];

  const categories = [
    {
      id: 1,
      titre: "Ménage & entretien",
      description: "Coup de main pour le ménage, le repassage ou l'entretien du jardin.",
      category_image: "/uploads/categories/menage.png",
    },
    {
      id: 2,
      titre: "Aide aux personnes âgées",
      description: "Compagnie, courses, accompagnement aux rendez-vous médicaux.",
      category_image: "/uploads/categories/personnes-agees.webp",
    },
    {
      id: 3,
      titre: "Numérique & téléphonie",
      description: "Installation, dépannage et initiation aux outils numériques.",
      category_image: "/uploads/categories/numerique.png",
    },
    {
      id: 4,
      titre: "Bricolage & réparations",
      description: "Petits travaux, montage de meubles, réparations du quotidien.",
      category_image: "/uploads/categories/bricolage.jpg",
    },
  ];

  const service = (id, titre, description, userId, categoryId, status, createdAt, image) => ({
    id,
    titre,
    description,
    user_id: userId,
    category_id: categoryId,
    status,
    created_at: createdAt,
    illustration: image ? `/uploads/services/${image}` : null,
  });

  const services = [
    service(
      1,
      "Aide au grand ménage de printemps",
      "Je vous aide à faire le grand ménage : vitres, placards, tri et rangement. Disponible les samedis matin sur Lyon et ses environs.",
      2,
      1,
      true,
      ago(30, 4),
      null
    ),
    service(
      2,
      "Repassage à domicile",
      "Une pile de linge qui déborde ? Je passe chez vous une à deux heures en semaine pour vous aider avec le repassage.",
      2,
      1,
      true,
      ago(4, 2),
      "repassage.webp"
    ),
    service(
      3,
      "Courses et compagnie pour nos aînés",
      "Je propose de faire les courses et de passer un moment convivial avec une personne âgée isolée, le week-end.",
      5,
      2,
      true,
      ago(22, 6),
      "courses-compagnie.webp"
    ),
    service(
      4,
      "Accompagnement aux rendez-vous médicaux",
      "Je peux accompagner une personne âgée à ses rendez-vous médicaux en transports en commun dans Lille.",
      5,
      2,
      false,
      ago(6, 1),
      null
    ),
    service(
      5,
      "Initiation au smartphone",
      "Apprenez à utiliser votre smartphone : appels vidéo, photos, messagerie, applications utiles. Séances d'une heure, à votre rythme.",
      4,
      3,
      true,
      ago(26, 3),
      "initiation-smartphone.webp"
    ),
    service(
      6,
      "Dépannage ordinateur",
      "Ordinateur lent, virus, imprimante qui ne fonctionne plus ? Je regarde ça avec vous, à distance ou chez vous à Nantes.",
      4,
      3,
      true,
      ago(9, 5),
      "depannage-ordinateur.webp"
    ),
    service(
      7,
      "Montage de meubles",
      "Je monte vos meubles en kit (armoires, lits, étagères). J'apporte mes outils.",
      3,
      4,
      true,
      ago(15, 8),
      "montage-meubles.webp"
    ),
    service(
      8,
      "Petites réparations du quotidien",
      "Fuite de robinet, prise électrique, porte qui grince : je vous aide à réparer les petits tracas de la maison.",
      3,
      4,
      true,
      ago(2, 3),
      "petites-reparations.webp"
    ),
  ];

  const comments = [
    {
      id: 1,
      service_id: 1,
      user_id: 3,
      content:
        "Claire a été d'une aide précieuse, l'appartement n'a jamais été aussi propre. Merci !",
      created_at: ago(20),
    },
    {
      id: 2,
      service_id: 5,
      user_id: 2,
      content:
        "Séance très pédagogique, je fais maintenant des appels vidéo avec mes petits-enfants.",
      created_at: ago(18, 7),
    },
    {
      id: 3,
      service_id: 7,
      user_id: 4,
      content: "Armoire montée en un temps record, Karim est très sympathique.",
      created_at: ago(10, 2),
    },
    {
      id: 4,
      service_id: 3,
      user_id: 2,
      content: "Une belle initiative, ma voisine était ravie de la visite.",
      created_at: ago(7, 9),
    },
  ];

  const faq = [
    [
      "Qu'est-ce que Mingle ?",
      "Mingle est une plateforme d'entraide qui met en relation des particuliers souhaitant échanger des services gratuitement : ménage, bricolage, aide numérique, accompagnement des personnes âgées et bien plus encore.",
    ],
    [
      "L'inscription est-elle gratuite ?",
      "Oui. L'inscription et l'utilisation de Mingle sont entièrement gratuites. Les services échangés sur la plateforme ne donnent lieu à aucune rémunération.",
    ],
    [
      "Comment proposer un service ?",
      "Connectez-vous puis cliquez sur « Publier un service ». Renseignez un titre, une description, une catégorie et, si vous le souhaitez, une image. Votre service est visible immédiatement.",
    ],
    [
      "Comment contacter un membre ?",
      "Depuis la page d'un service, cliquez sur « Contacter ». Une conversation s'ouvre dans la messagerie, accessible à tout moment via la bulle en bas à droite de l'écran.",
    ],
    [
      "Puis-je désactiver temporairement un service ?",
      "Oui. Depuis votre tableau de bord, modifiez le service et passez son statut à « Désactivé ». Il ne sera plus visible des autres membres jusqu'à ce que vous le réactiviez.",
    ],
    [
      "Comment supprimer mon compte ?",
      "Rendez-vous sur votre profil et cliquez sur « Supprimer mon compte ». Toutes vos données (services, commentaires, messages) seront définitivement supprimées.",
    ],
  ].map(([title, content], index) => ({ id: index + 1, title, content }));

  const friends = [
    [2, 3],
    [2, 4],
    [3, 2],
    [4, 2],
    [5, 2],
  ].map(([userId, friendId]) => ({ user_id: userId, friend_id: friendId }));

  const conversations = [
    {
      id: 1,
      user_one_id: 2,
      user_two_id: 3,
      last_message: "Parfait, à samedi alors !",
      last_message_time: ago(1, 2, 35),
      created_at: ago(1, 3),
    },
  ];

  const messages = [
    {
      id: 1,
      conversation_id: 1,
      sender_id: 2,
      content:
        "Bonjour Karim, j'aurais besoin d'aide pour monter une bibliothèque. Seriez-vous disponible ?",
      sent_at: ago(1, 3),
    },
    {
      id: 2,
      conversation_id: 1,
      sender_id: 3,
      content: "Bonjour Claire, avec plaisir ! Samedi matin vous conviendrait ?",
      sent_at: ago(1, 2, 48),
    },
    {
      id: 3,
      conversation_id: 1,
      sender_id: 2,
      content: "Parfait, à samedi alors !",
      sent_at: ago(1, 2, 35),
    },
  ];

  return {
    users,
    categories,
    services,
    comments,
    faq,
    friends,
    conversations,
    messages,
    contact: [],
  };
}
