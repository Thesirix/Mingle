import { format, formatDistanceToNowStrict, isToday, parseISO } from "date-fns";
import { fr } from "date-fns/locale";

const toDate = (value) => (value instanceof Date ? value : parseISO(String(value)));

export const formatDate = (value, pattern = "d MMMM yyyy") =>
  value ? format(toDate(value), pattern, { locale: fr }) : "";

export const timeAgo = (value) =>
  value ? `il y a ${formatDistanceToNowStrict(toDate(value), { locale: fr })}` : "";

/** Heure pour un message du jour, date courte sinon. */
export const shortDateTime = (value) => {
  if (!value) return "";
  const date = toDate(value);
  return isToday(date)
    ? format(date, "HH:mm", { locale: fr })
    : format(date, "dd/MM/yy", { locale: fr });
};
