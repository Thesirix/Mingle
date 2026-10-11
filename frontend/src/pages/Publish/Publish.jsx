import { useNavigate } from "react-router-dom";
import { FiCheckCircle } from "react-icons/fi";
import { toast } from "react-toastify";
import api, { errorMessage } from "@services/api";
import PageHeader from "@components/ui/PageHeader";
import ServiceForm, { toServiceFormData } from "@components/services/ServiceForm";

const TIPS = [
  "Un titre court et précis attire plus de membres.",
  "Indiquez vos disponibilités et la zone où vous pouvez vous déplacer.",
  "Une photo rend votre annonce plus chaleureuse.",
  "Les services sont toujours gratuits : l'entraide avant tout !",
];

export default function Publish() {
  const navigate = useNavigate();

  const handleSubmit = async (values) => {
    try {
      const { data } = await api.post("/services", toServiceFormData(values));
      toast.success("Votre service est en ligne !");
      navigate(`/services/${data.id}`);
    } catch (error) {
      toast.error(errorMessage(error, "Échec de la publication, veuillez réessayer."));
    }
  };

  return (
    <div className="container-page py-12">
      <PageHeader eyebrow="Publier" title="Proposer un service">
        Partagez vos compétences avec la communauté en quelques instants.
      </PageHeader>

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="card p-6 sm:p-8">
          <ServiceForm submitLabel="Publier le service" onSubmit={handleSubmit} />
        </div>
        <aside className="h-fit rounded-3xl bg-dark p-6 text-white">
          <h2 className="mb-4 text-lg text-white">Conseils pour une bonne annonce</h2>
          <ul className="space-y-4">
            {TIPS.map((tip) => (
              <li key={tip} className="flex gap-3 text-sm text-white/80">
                <FiCheckCircle className="mt-0.5 shrink-0 text-secondary" /> {tip}
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </div>
  );
}
