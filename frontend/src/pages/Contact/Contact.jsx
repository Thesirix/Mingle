import { useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Form, Formik } from "formik";
import * as Yup from "yup";
import { FiCheckCircle, FiHelpCircle, FiMail, FiSend } from "react-icons/fi";
import { toast } from "react-toastify";
import api, { errorMessage } from "@services/api";
import { useAuth } from "@contexts/AuthContext";
import PageHeader from "@components/ui/PageHeader";
import FormField from "@components/ui/FormField";

const schema = Yup.object({
  email: Yup.string().email("Adresse mail invalide").required("Saisissez votre adresse mail"),
  subject: Yup.string()
    .trim()
    .min(3, "3 caractères minimum")
    .max(150)
    .required("Saisissez l'objet de votre message"),
  message: Yup.string()
    .trim()
    .min(10, "10 caractères minimum")
    .required("Que pouvons-nous faire pour vous ?"),
});

export default function Contact() {
  const { user } = useAuth();
  const [sent, setSent] = useState(false);

  const handleSubmit = async (values, { resetForm }) => {
    try {
      await api.post("/contact", values);
      resetForm();
      setSent(true);
    } catch (error) {
      toast.error(errorMessage(error));
    }
  };

  return (
    <div className="container-page py-12">
      <PageHeader eyebrow="Contact" title="Une question ? Écrivez-nous">
        Une suggestion, un problème ou simplement envie de nous dire bonjour : nous lisons tous vos
        messages.
      </PageHeader>

      <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
        <div className="card p-6 sm:p-8">
          <AnimatePresence mode="wait">
            {sent ? (
              <motion.div
                key="sent"
                className="flex flex-col items-center py-12 text-center"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <span className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-50 text-3xl text-green-600">
                  <FiCheckCircle />
                </span>
                <h2 className="text-2xl">Message envoyé !</h2>
                <p className="mt-2 text-dark/60">
                  Merci, nous vous répondrons dans les meilleurs délais.
                </p>
                <button type="button" className="btn-outline mt-6" onClick={() => setSent(false)}>
                  Envoyer un autre message
                </button>
              </motion.div>
            ) : (
              <motion.div key="form" exit={{ opacity: 0 }}>
                <Formik
                  initialValues={{ email: user?.mail ?? "", subject: "", message: "" }}
                  validationSchema={schema}
                  onSubmit={handleSubmit}
                  enableReinitialize
                >
                  {({ isSubmitting }) => (
                    <Form className="space-y-5">
                      <div className="grid gap-5 sm:grid-cols-2">
                        <FormField
                          label="Adresse mail"
                          name="email"
                          type="email"
                          autoComplete="email"
                        />
                        <FormField label="Objet" name="subject" />
                      </div>
                      <FormField label="Message" name="message" as="textarea" rows={7} />
                      <div className="flex justify-end">
                        <button type="submit" className="btn-primary px-8" disabled={isSubmitting}>
                          <FiSend /> {isSubmitting ? "Envoi…" : "Envoyer"}
                        </button>
                      </div>
                    </Form>
                  )}
                </Formik>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <aside className="space-y-4">
          <div className="card p-6">
            <FiMail className="mb-3 text-2xl text-primary" />
            <h2 className="text-lg">Par e-mail</h2>
            <p className="mt-1 text-sm text-dark/60">contact@mingle.fr</p>
          </div>
          <div className="card p-6">
            <FiHelpCircle className="mb-3 text-2xl text-primary" />
            <h2 className="text-lg">Questions fréquentes</h2>
            <p className="mt-1 text-sm text-dark/60">
              La réponse à votre question s&apos;y trouve peut-être déjà.
            </p>
            <Link
              to="/faq"
              className="mt-3 inline-block text-sm font-bold text-primary hover:underline"
            >
              Consulter la FAQ →
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
