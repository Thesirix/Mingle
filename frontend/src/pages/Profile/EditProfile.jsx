import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Form, Formik } from "formik";
import * as Yup from "yup";
import { FiArrowLeft, FiCamera } from "react-icons/fi";
import { toast } from "react-toastify";
import api, { errorMessage } from "@services/api";
import { servicesAutorises, validerServices } from "@services/servicesAutorises";
import { useAuth } from "@contexts/AuthContext";
import Avatar from "@components/ui/Avatar";
import FormField from "@components/ui/FormField";
import Loader from "@components/ui/Loader";

const SPECIAL_CHAR = /[!@#$%^&*(),.?":{}|<>]/;

const schema = Yup.object({
  username: Yup.string()
    .trim()
    .min(3, "3 caractères minimum")
    .max(100)
    .required("Champ obligatoire"),
  mail: Yup.string().email("Adresse mail invalide").required("Champ obligatoire"),
  localisation: Yup.string().trim().min(2, "2 caractères minimum").required("Champ obligatoire"),
  biographie: Yup.string().max(2000, "2000 caractères maximum"),
  service_type: Yup.string().test(
    "services-autorises",
    `Services possibles, séparés par des virgules : ${servicesAutorises.join(", ")}`,
    (value) => !value?.trim() || validerServices(value)
  ),
  user_pass: Yup.string()
    .min(8, "8 caractères minimum")
    .matches(SPECIAL_CHAR, "Au moins 1 caractère spécial"),
  confirm_pass: Yup.string().oneOf(
    [Yup.ref("user_pass"), undefined],
    "Les mots de passe ne correspondent pas"
  ),
});

function AvatarPicker({ user, file, onChange }) {
  const preview = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);

  useEffect(() => () => preview && URL.revokeObjectURL(preview), [preview]);

  return (
    <div className="flex flex-col items-center gap-3">
      <label htmlFor="avatar" className="group relative cursor-pointer">
        {preview ? (
          <img
            src={preview}
            alt="Aperçu"
            className="h-28 w-28 rounded-full object-cover ring-4 ring-white"
          />
        ) : (
          <Avatar src={user.avatar} name={user.username} size="xl" className="ring-4" />
        )}
        <span className="absolute inset-0 flex items-center justify-center rounded-full bg-dark/50 text-2xl text-white opacity-0 transition group-hover:opacity-100">
          <FiCamera />
        </span>
        <input
          id="avatar"
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          className="sr-only"
          onChange={(event) => onChange(event.currentTarget.files[0] ?? null)}
        />
      </label>
      <span className="text-xs text-dark/50">Cliquez pour changer de photo (3 Mo max)</span>
    </div>
  );
}

export default function EditProfile() {
  const { user, userId, setUser } = useAuth();
  const [avatar, setAvatar] = useState(null);
  const navigate = useNavigate();

  if (!user) return <Loader />;

  const handleSubmit = async (values) => {
    const formData = new FormData();
    ["username", "mail", "localisation", "biographie", "service_type"].forEach((field) =>
      formData.append(field, values[field].trim())
    );
    if (values.user_pass) formData.append("user_pass", values.user_pass);
    if (avatar) formData.append("avatar", avatar);

    try {
      const { data } = await api.put(`/users/${userId}`, formData);
      setUser(data);
      toast.success("Profil mis à jour");
      navigate(`/profil/${userId}`);
    } catch (error) {
      toast.error(errorMessage(error));
    }
  };

  return (
    <div className="container-page max-w-3xl py-12">
      <Link to={`/profil/${userId}`} className="btn-ghost -ml-3 mb-6">
        <FiArrowLeft /> Mon profil
      </Link>

      <Formik
        initialValues={{
          username: user.username ?? "",
          mail: user.mail ?? "",
          localisation: user.localisation ?? "",
          biographie: user.biographie ?? "",
          service_type: user.service_type ?? "",
          user_pass: "",
          confirm_pass: "",
        }}
        validationSchema={schema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => (
          <Form className="space-y-6">
            <section className="card p-6 sm:p-8">
              <h1 className="mb-8 text-2xl">Modifier mon profil</h1>
              <div className="grid gap-8 sm:grid-cols-[auto_1fr]">
                <AvatarPicker user={user} file={avatar} onChange={setAvatar} />
                <div className="space-y-5">
                  <FormField label="Nom d'utilisateur" name="username" />
                  <FormField label="Adresse mail" name="mail" type="email" />
                  <FormField label="Ville" name="localisation" />
                </div>
              </div>
            </section>

            <section className="card space-y-5 p-6 sm:p-8">
              <h2 className="text-lg">Présentation</h2>
              <FormField
                label="Biographie"
                name="biographie"
                as="textarea"
                rows={5}
                placeholder="Parlez de vous, de vos centres d'intérêt, de vos disponibilités…"
              />
              <FormField
                label="Types de services proposés"
                name="service_type"
                placeholder="Aide au devoir, Aide au bricolage"
                hint={`Au choix, séparés par des virgules : ${servicesAutorises.join(", ")}`}
              />
            </section>

            <section className="card space-y-5 p-6 sm:p-8">
              <h2 className="text-lg">Changer de mot de passe</h2>
              <p className="-mt-3 text-sm text-dark/55">
                Laissez vide pour conserver le mot de passe actuel.
              </p>
              <div className="grid gap-5 sm:grid-cols-2">
                <FormField
                  label="Nouveau mot de passe"
                  name="user_pass"
                  type="password"
                  autoComplete="new-password"
                />
                <FormField
                  label="Confirmation"
                  name="confirm_pass"
                  type="password"
                  autoComplete="new-password"
                />
              </div>
            </section>

            <div className="flex justify-end gap-3">
              <Link to={`/profil/${userId}`} className="btn-outline">
                Annuler
              </Link>
              <button type="submit" className="btn-primary px-8" disabled={isSubmitting}>
                {isSubmitting ? "Enregistrement…" : "Enregistrer"}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
}
