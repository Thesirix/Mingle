-- ---------------------------------------------------------------------------
-- Mingle : schéma de la base de données et jeu de données de démonstration
-- Exécuté par `npm run migrate` (la base est recréée à chaque exécution).
-- ---------------------------------------------------------------------------

CREATE TABLE users (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL,
  mail VARCHAR(255) NOT NULL UNIQUE,
  user_pass VARCHAR(255) NOT NULL,
  localisation VARCHAR(255) NOT NULL,
  avatar VARCHAR(255) NULL,
  biographie TEXT NULL,
  service_type VARCHAR(255) NULL,
  is_admin BOOLEAN NOT NULL DEFAULT FALSE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE categories (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  titre VARCHAR(150) NOT NULL,
  description VARCHAR(500) NULL,
  category_image VARCHAR(255) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE services (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  titre VARCHAR(100) NOT NULL,
  description VARCHAR(1000) NOT NULL,
  illustration VARCHAR(255) NULL,
  status BOOLEAN NOT NULL DEFAULT TRUE,
  user_id INT UNSIGNED NOT NULL,
  category_id INT UNSIGNED NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_services_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_services_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE comments (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  service_id INT UNSIGNED NOT NULL,
  user_id INT UNSIGNED NOT NULL,
  content VARCHAR(1000) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_comments_service FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE,
  CONSTRAINT fk_comments_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE faq (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(150) NOT NULL,
  content TEXT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Relation « suivre / ajouter en ami » (orientée : user_id a ajouté friend_id)
CREATE TABLE friends (
  user_id INT UNSIGNED NOT NULL,
  friend_id INT UNSIGNED NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, friend_id),
  CONSTRAINT fk_friends_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_friends_friend FOREIGN KEY (friend_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Conversation entre deux utilisateurs (user_one_id < user_two_id)
CREATE TABLE conversations (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_one_id INT UNSIGNED NOT NULL,
  user_two_id INT UNSIGNED NOT NULL,
  last_message VARCHAR(1000) NULL,
  last_message_time DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_conversation_pair (user_one_id, user_two_id),
  CONSTRAINT fk_conversations_one FOREIGN KEY (user_one_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_conversations_two FOREIGN KEY (user_two_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE messages (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  conversation_id INT UNSIGNED NOT NULL,
  sender_id INT UNSIGNED NOT NULL,
  content VARCHAR(1000) NOT NULL,
  sent_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_messages_conversation FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
  CONSTRAINT fk_messages_sender FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE contact_messages (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  subject VARCHAR(150) NOT NULL,
  message TEXT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- Données de démonstration
-- Mots de passe : admin@mingle.fr -> Admin123! ; autres comptes -> Mingle123!
-- ---------------------------------------------------------------------------

INSERT INTO users (username, mail, user_pass, localisation, biographie, service_type, is_admin, created_at) VALUES
('Admin Mingle', 'admin@mingle.fr', '$argon2id$v=19$m=65536,t=3,p=4$tL1uw5/QFhIKQ8gR9inR/g$1Iar1PWfe3TnSmQpo25GeASrlJnWkgaL51Hb2VT8Ew8', 'Paris', 'Compte d''administration de la plateforme Mingle.', NULL, TRUE, '2024-05-02 09:00:00'),
('Claire Martin', 'claire.martin@example.com', '$argon2id$v=19$m=65536,t=3,p=4$83BigpnFNSsK9KcfTQ6AWw$mcpTrDPppGQXZtGAdemi5FAJYbJwIau25MmfWSkzi3s', 'Lyon', 'Professeure des écoles à la retraite, j''adore transmettre et rendre service à mes voisins.', 'Aide au devoir, Aide aux repas', FALSE, '2024-05-14 18:20:00'),
('Karim Benali', 'karim.benali@example.com', '$argon2id$v=19$m=65536,t=3,p=4$83BigpnFNSsK9KcfTQ6AWw$mcpTrDPppGQXZtGAdemi5FAJYbJwIau25MmfWSkzi3s', 'Marseille', 'Bricoleur du dimanche devenu expert en petites réparations. Toujours partant pour un coup de main !', 'Aide au bricolage, Aide au covoiturage', FALSE, '2024-05-21 11:05:00'),
('Sophie Durand', 'sophie.durand@example.com', '$argon2id$v=19$m=65536,t=3,p=4$83BigpnFNSsK9KcfTQ6AWw$mcpTrDPppGQXZtGAdemi5FAJYbJwIau25MmfWSkzi3s', 'Nantes', 'Développeuse web, je peux vous aider avec votre ordinateur, votre smartphone ou vos démarches en ligne.', 'Aide au devoir', FALSE, '2024-05-28 20:45:00'),
('Lucas Petit', 'lucas.petit@example.com', '$argon2id$v=19$m=65536,t=3,p=4$83BigpnFNSsK9KcfTQ6AWw$mcpTrDPppGQXZtGAdemi5FAJYbJwIau25MmfWSkzi3s', 'Lille', 'Étudiant, disponible le week-end pour accompagner les personnes âgées ou garder des enfants.', 'Aide Garde d''enfants', FALSE, '2024-06-01 16:30:00');

INSERT INTO categories (titre, description, category_image) VALUES
('Ménage & entretien', 'Coup de main pour le ménage, le repassage ou l''entretien du jardin.', '/uploads/categories/menage.png'),
('Aide aux personnes âgées', 'Compagnie, courses, accompagnement aux rendez-vous médicaux.', '/uploads/categories/personnes-agees.webp'),
('Numérique & téléphonie', 'Installation, dépannage et initiation aux outils numériques.', '/uploads/categories/numerique.png'),
('Bricolage & réparations', 'Petits travaux, montage de meubles, réparations du quotidien.', '/uploads/categories/bricolage.jpg');

INSERT INTO services (titre, description, user_id, category_id, status, created_at, illustration) VALUES
('Aide au grand ménage de printemps', 'Je vous aide à faire le grand ménage : vitres, placards, tri et rangement. Disponible les samedis matin sur Lyon et ses environs.', 2, 1, TRUE, '2024-06-03 10:00:00', '/uploads/services/menage-1.webp'),
('Repassage à domicile', 'Une pile de linge qui déborde ? Je passe chez vous une à deux heures en semaine pour vous aider avec le repassage.', 2, 1, TRUE, '2024-06-10 14:30:00', '/uploads/services/menage-2.webp'),
('Courses et compagnie pour nos aînés', 'Je propose de faire les courses et de passer un moment convivial avec une personne âgée isolée, le week-end.', 5, 2, TRUE, '2024-06-05 09:15:00', '/uploads/services/aines-1.webp'),
('Accompagnement aux rendez-vous médicaux', 'Je peux accompagner une personne âgée à ses rendez-vous médicaux en transports en commun dans Lille.', 5, 2, FALSE, '2024-06-12 16:00:00', '/uploads/services/aines-2.webp'),
('Initiation au smartphone', 'Apprenez à utiliser votre smartphone : appels vidéo, photos, messagerie, applications utiles. Séances d''une heure, à votre rythme.', 4, 3, TRUE, '2024-06-04 18:00:00', '/uploads/services/numerique-1.webp'),
('Dépannage ordinateur', 'Ordinateur lent, virus, imprimante qui ne fonctionne plus ? Je regarde ça avec vous, à distance ou chez vous à Nantes.', 4, 3, TRUE, '2024-06-08 11:45:00', '/uploads/services/numerique-2.webp'),
('Montage de meubles', 'Je monte vos meubles en kit (armoires, lits, étagères). J''apporte mes outils.', 3, 4, TRUE, '2024-06-06 08:30:00', '/uploads/services/bricolage-1.webp'),
('Petites réparations du quotidien', 'Fuite de robinet, prise électrique, porte qui grince : je vous aide à réparer les petits tracas de la maison.', 3, 4, TRUE, '2024-06-15 13:20:00', '/uploads/services/bricolage-2.webp');

INSERT INTO comments (service_id, user_id, content, created_at) VALUES
(1, 3, 'Claire a été d''une aide précieuse, l''appartement n''a jamais été aussi propre. Merci !', '2024-06-20 18:00:00'),
(5, 2, 'Séance très pédagogique, je fais maintenant des appels vidéo avec mes petits-enfants.', '2024-06-21 10:30:00'),
(7, 4, 'Armoire montée en un temps record, Karim est très sympathique.', '2024-06-22 15:10:00'),
(3, 2, 'Une belle initiative, ma voisine était ravie de la visite.', '2024-06-23 12:00:00');

INSERT INTO faq (title, content) VALUES
('Qu''est-ce que Mingle ?', 'Mingle est une plateforme d''entraide qui met en relation des particuliers souhaitant échanger des services gratuitement : ménage, bricolage, aide numérique, accompagnement des personnes âgées et bien plus encore.'),
('L''inscription est-elle gratuite ?', 'Oui. L''inscription et l''utilisation de Mingle sont entièrement gratuites. Les services échangés sur la plateforme ne donnent lieu à aucune rémunération.'),
('Comment proposer un service ?', 'Connectez-vous puis cliquez sur « Publier un service ». Renseignez un titre, une description, une catégorie et, si vous le souhaitez, une image. Votre service est visible immédiatement.'),
('Comment contacter un membre ?', 'Depuis la page d''un service, cliquez sur « Contacter ». Une conversation s''ouvre dans la messagerie, accessible à tout moment via la bulle en bas à droite de l''écran.'),
('Puis-je désactiver temporairement un service ?', 'Oui. Depuis votre tableau de bord, modifiez le service et passez son statut à « Désactivé ». Il ne sera plus visible des autres membres jusqu''à ce que vous le réactiviez.'),
('Comment supprimer mon compte ?', 'Rendez-vous sur votre profil et cliquez sur « Supprimer mon compte ». Toutes vos données (services, commentaires, messages) seront définitivement supprimées.');

INSERT INTO friends (user_id, friend_id) VALUES
(2, 3), (2, 4), (3, 2), (4, 2), (5, 2);

INSERT INTO conversations (user_one_id, user_two_id, last_message, last_message_time, created_at) VALUES
(2, 3, 'Parfait, à samedi alors !', '2024-06-25 19:05:00', '2024-06-25 18:40:00');

INSERT INTO messages (conversation_id, sender_id, content, sent_at) VALUES
(1, 2, 'Bonjour Karim, j''aurais besoin d''aide pour monter une bibliothèque. Seriez-vous disponible ?', '2024-06-25 18:40:00'),
(1, 3, 'Bonjour Claire, avec plaisir ! Samedi matin vous conviendrait ?', '2024-06-25 18:52:00'),
(1, 2, 'Parfait, à samedi alors !', '2024-06-25 19:05:00');
