export const servicesAutorises = [
  "Aide au devoir",
  "Aide au bricolage",
  "Aide au covoiturage",
  "Aide aux repas",
  "Aide Garde d'enfants",
  "Aide médecin à domicile",
];

/** Vérifie que chaque service de la liste (séparée par des virgules) est autorisé. */
export function validerServices(value) {
  const services = value.split(",").map((service) => service.trim());
  return services.every((service) => servicesAutorises.includes(service));
}
