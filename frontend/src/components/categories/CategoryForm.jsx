import { Form, Formik } from "formik";
import * as Yup from "yup";
import FormField from "@components/ui/FormField";
import { assetUrl } from "@services/api";

const schema = Yup.object({
  titre: Yup.string().trim().min(2, "2 caractères minimum").max(150).required("Titre requis"),
  description: Yup.string().max(500, "500 caractères maximum"),
  category_image: Yup.string().test(
    "image-url",
    "L'image doit être une URL (https://…) ou un chemin /uploads/…",
    (value) => !value || value.startsWith("/uploads/") || /^https?:\/\/\S+$/.test(value)
  ),
});

export default function CategoryForm({ initialValues, submitLabel, onSubmit, children }) {
  return (
    <Formik
      initialValues={{ titre: "", description: "", category_image: "", ...initialValues }}
      validationSchema={schema}
      onSubmit={onSubmit}
      enableReinitialize
    >
      {({ values, isSubmitting }) => (
        <Form className="space-y-5">
          <FormField label="Titre" name="titre" placeholder="Ex. Jardinage" />
          <FormField
            label="Description"
            name="description"
            as="textarea"
            rows={3}
            placeholder="Quels types de services cette catégorie regroupe-t-elle ?"
          />
          <FormField
            label="Image"
            name="category_image"
            placeholder="https://…"
            hint="Lien vers une image illustrant la catégorie (facultatif)."
          />
          {values.category_image && (
            <img
              src={assetUrl(values.category_image)}
              alt="Aperçu de la catégorie"
              className="h-40 w-full rounded-2xl object-cover"
            />
          )}
          <div className="flex flex-wrap justify-end gap-3 pt-2">
            {children}
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {submitLabel}
            </button>
          </div>
        </Form>
      )}
    </Formik>
  );
}
