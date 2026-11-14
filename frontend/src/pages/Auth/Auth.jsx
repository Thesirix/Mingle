import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Form, Formik } from "formik";
import * as Yup from "yup";
import { FiCheckCircle } from "react-icons/fi";
import { toast } from "react-toastify";
import { errorMessage } from "@services/api";
import { useAuth } from "@contexts/AuthContext";
import FormField from "@components/ui/FormField";
import { LogoMark } from "@components/ui/Logo";
import handsImage from "@assets/mains.jpg";

const SPECIAL_CHAR = /[!@#$%^&*(),.?":{}|<>]/;

const loginSchema = Yup.object({
  email: Yup.string().email("Adresse mail invalide").required("Champ obligatoire"),
  password: Yup.string().required("Champ obligatoire"),
});

const registerSchema = Yup.object({
  username: Yup.string()
    .trim()
    .min(3, "3 caractères minimum")
    .max(100)
    .required("Champ obligatoire"),
  email: Yup.string().email("Adresse mail invalide").required("Champ obligatoire"),
  localisation: Yup.string().trim().min(2, "2 caractères minimum").required("Champ obligatoire"),
  password: Yup.string()
    .min(8, "8 caractères minimum")
    .matches(SPECIAL_CHAR, "Au moins 1 caractère spécial")
    .required("Champ obligatoire"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Les mots de passe ne correspondent pas")
    .required("Champ obligatoire"),
  acceptTerms: Yup.boolean().oneOf([true], "Vous devez accepter les conditions d'utilisation"),
});

function LoginForm({ onSuccess }) {
  const { login } = useAuth();
  const [error, setError] = useState("");

  return (
    <Formik
      initialValues={{ email: "", password: "" }}
      validationSchema={loginSchema}
      onSubmit={async (values) => {
        setError("");
        try {
          await login(values.email.trim(), values.password);
          onSuccess();
        } catch (err) {
          setError(errorMessage(err));
        }
      }}
    >
      {({ isSubmitting }) => (
        <Form className="space-y-5" noValidate>
          {error && (
            <p
              role="alert"
              className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
            >
              {error}
            </p>
          )}
          <FormField label="Adresse mail" name="email" type="email" autoComplete="email" />
          <FormField
            label="Mot de passe"
            name="password"
            type="password"
            autoComplete="current-password"
          />
          <button type="submit" className="btn-primary w-full py-3" disabled={isSubmitting}>
            {isSubmitting ? "Connexion…" : "Se connecter"}
          </button>
        </Form>
      )}
    </Formik>
  );
}

function RegisterForm({ onRegistered }) {
  const { register } = useAuth();

  return (
    <Formik
      initialValues={{
        username: "",
        email: "",
        localisation: "",
        password: "",
        confirmPassword: "",
        acceptTerms: false,
      }}
      validationSchema={registerSchema}
      onSubmit={async (values, { resetForm }) => {
        try {
          await register({
            username: values.username.trim(),
            mail: values.email.trim(),
            localisation: values.localisation.trim(),
            user_pass: values.password,
          });
          resetForm();
          onRegistered(values.email.trim(), values.password);
        } catch (err) {
          toast.error(errorMessage(err, "Une erreur s'est produite lors de l'inscription"));
        }
      }}
    >
      {({ isSubmitting, values, errors, touched, setFieldValue }) => (
        <Form className="space-y-4" noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Nom d'utilisateur" name="username" autoComplete="username" />
            <FormField label="Ville" name="localisation" autoComplete="address-level2" />
          </div>
          <FormField label="Adresse mail" name="email" type="email" autoComplete="email" />
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              label="Mot de passe"
              name="password"
              type="password"
              autoComplete="new-password"
              hint="8 caractères dont 1 spécial"
            />
            <FormField
              label="Confirmation"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
            />
          </div>
          <div>
            <label className="flex items-start gap-3 text-sm">
              <input
                type="checkbox"
                className="mt-0.5 h-4 w-4 rounded accent-primary"
                checked={values.acceptTerms}
                onChange={(event) => setFieldValue("acceptTerms", event.target.checked)}
              />
              <span>
                J&apos;accepte les{" "}
                <Link
                  to="/conditions-utilisation"
                  className="font-semibold text-primary hover:underline"
                >
                  conditions d&apos;utilisation
                </Link>{" "}
                et la{" "}
                <Link
                  to="/politique-de-confidentialite"
                  className="font-semibold text-primary hover:underline"
                >
                  politique de confidentialité
                </Link>
              </span>
            </label>
            {touched.acceptTerms && errors.acceptTerms && (
              <p className="field-error">{errors.acceptTerms}</p>
            )}
          </div>
          <button type="submit" className="btn-dark w-full py-3" disabled={isSubmitting}>
            {isSubmitting ? "Création du compte…" : "Créer mon compte"}
          </button>
        </Form>
      )}
    </Formik>
  );
}

export default function Auth() {
  const { isLoggedIn, login } = useAuth();
  const [tab, setTab] = useState("login");
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from ?? "/";

  if (isLoggedIn) return <Navigate to={redirectTo} replace />;

  const handleRegistered = async (email, password) => {
    toast.success("Bienvenue sur Mingle ! Votre compte a été créé.");
    try {
      await login(email, password);
      navigate(redirectTo, { replace: true });
    } catch {
      setTab("login");
    }
  };

  return (
    <div className="container-page py-12">
      <div className="card mx-auto grid max-w-5xl overflow-hidden lg:grid-cols-2">
        <div className="relative hidden flex-col justify-end overflow-hidden bg-dark p-10 text-white lg:flex">
          <img
            src={handsImage}
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/70 to-transparent" />
          <div className="relative">
            <LogoMark className="mb-6 h-12 w-11 text-primary" />
            <h2 className="text-3xl text-white">Rejoignez une communauté solidaire</h2>
            <ul className="mt-6 space-y-3 text-sm text-white/80">
              {[
                "Proposez vos services gratuitement",
                "Échangez avec vos voisins en toute simplicité",
                "Construisez des liens humains précieux",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <FiCheckCircle className="text-secondary" /> {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="p-6 sm:p-10">
          <div className="mb-8 grid grid-cols-2 rounded-full bg-cream p-1" role="tablist">
            {[
              { id: "login", label: "Connexion" },
              { id: "register", label: "Inscription" },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={tab === item.id}
                className={`relative rounded-full py-2.5 text-sm font-bold transition ${
                  tab === item.id ? "text-white" : "text-dark/60"
                }`}
                onClick={() => setTab(item.id)}
              >
                {tab === item.id && (
                  <motion.span
                    layoutId="auth-tab"
                    className="absolute inset-0 -z-0 rounded-full bg-dark"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                )}
                <span className="relative">{item.label}</span>
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, x: tab === "login" ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: tab === "login" ? 20 : -20 }}
              transition={{ duration: 0.2 }}
            >
              <h1 className="mb-1 text-2xl">
                {tab === "login" ? "Bon retour parmi nous" : "Créer un compte"}
              </h1>
              <p className="mb-6 text-sm text-dark/55">
                {tab === "login"
                  ? "Connectez-vous pour publier et échanger des services."
                  : "Quelques informations suffisent pour commencer."}
              </p>
              {tab === "login" ? (
                <LoginForm onSuccess={() => navigate(redirectTo, { replace: true })} />
              ) : (
                <RegisterForm onRegistered={handleRegistered} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
