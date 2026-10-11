import { useEffect, useMemo, useState } from "react";
import { Form, Formik } from "formik";
import * as Yup from "yup";
import { FiImage, FiUploadCloud, FiX } from "react-icons/fi";
import api, { assetUrl } from "@services/api";
import FormField from "@components/ui/FormField";

const MAX_SIZE = 3 * 1024 * 1024;
const FORMATS = ["image/jpeg", "image/png", "image/gif", "image/webp"];

const schema = Yup.object({
  titre: Yup.string()
    .trim()
    .min(3, "3 caractères minimum")
    .max(100, "100 caractères maximum")
    .required("Titre requis"),
  description: Yup.string()
    .trim()
    .min(10, "10 caractères minimum")
    .max(1000, "1000 caractères maximum")
    .required("Description requise"),
  category_id: Yup.string().required("Choisissez une catégorie"),
  image: Yup.mixed()
    .nullable()
    .test(
      "format",
      "Formats acceptés : jpeg, png, gif, webp",
      (file) => !file || FORMATS.includes(file.type)
    )
    .test("size", "L'image ne doit pas dépasser 3 Mo", (file) => !file || file.size <= MAX_SIZE),
});

function ImagePicker({ file, currentUrl, onChange, error }) {
  const preview = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);
  const [dragging, setDragging] = useState(false);

  useEffect(() => () => preview && URL.revokeObjectURL(preview), [preview]);

  const image = preview ?? assetUrl(currentUrl);

  return (
    <div>
      <span className="label">Image (facultative)</span>
      <label
        htmlFor="service-image"
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          onChange(event.dataTransfer.files[0] ?? null);
        }}
        className={`relative flex aspect-[16/7] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed transition ${
          dragging
            ? "border-primary bg-light/60"
            : "border-dark/15 bg-cream hover:border-primary/60"
        } ${error ? "border-red-400" : ""}`}
      >
        {image ? (
          <img src={image} alt="Aperçu" className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <>
            <FiUploadCloud className="mb-2 text-3xl text-primary" />
            <span className="text-sm font-semibold">
              Glissez une image ou cliquez pour parcourir
            </span>
            <span className="mt-1 text-xs text-dark/50">JPEG, PNG, GIF ou WEBP, 3 Mo maximum</span>
          </>
        )}
        <input
          id="service-image"
          type="file"
          accept={FORMATS.join(",")}
          className="sr-only"
          onChange={(event) => onChange(event.currentTarget.files[0] ?? null)}
        />
      </label>
      <div className="mt-2 flex items-center justify-between">
        <span className="flex items-center gap-1 truncate text-xs text-dark/50">
          <FiImage /> {file ? file.name : "Aucun nouveau fichier"}
        </span>
        {file && (
          <button
            type="button"
            className="flex items-center gap-1 text-xs font-semibold text-red-600"
            onClick={() => onChange(null)}
          >
            <FiX /> Retirer
          </button>
        )}
      </div>
      {error && <p className="field-error">{error}</p>}
    </div>
  );
}

/** Construit le FormData attendu par l'API (multipart pour l'image). */
export const toServiceFormData = (values) => {
  const formData = new FormData();
  formData.append("titre", values.titre.trim());
  formData.append("description", values.description.trim());
  formData.append("category_id", values.category_id);
  if (values.status !== undefined) formData.append("status", String(values.status));
  if (values.image) formData.append("image", values.image);
  return formData;
};

export default function ServiceForm({
  initialValues,
  currentImage,
  submitLabel,
  onSubmit,
  onCancel,
  showStatus = false,
}) {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    api
      .get("/categories")
      .then(({ data }) => setCategories(data))
      .catch(() => {});
  }, []);

  return (
    <Formik
      initialValues={{ titre: "", description: "", category_id: "", image: null, ...initialValues }}
      validationSchema={schema}
      onSubmit={onSubmit}
    >
      {({ values, errors, touched, setFieldValue, setFieldTouched, isSubmitting }) => (
        <Form className="space-y-5">
          <FormField label="Titre" name="titre" placeholder="Ex. Initiation au smartphone" />
          <FormField
            label="Description"
            name="description"
            as="textarea"
            rows={5}
            placeholder="Décrivez le service, vos disponibilités, la zone géographique…"
            hint={`${values.description.length}/1000 caractères`}
          />
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField label="Catégorie" name="category_id" as="select">
              <option value="">Choisissez une catégorie</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.titre}
                </option>
              ))}
            </FormField>
            {showStatus && (
              <div>
                <span className="label">Statut</span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={values.status}
                  onClick={() => setFieldValue("status", !values.status)}
                  className="flex h-[42px] w-full items-center justify-between rounded-xl border border-dark/15 bg-white px-4 text-sm"
                >
                  <span className="font-medium">
                    {values.status ? "Visible par tous" : "Désactivé"}
                  </span>
                  <span
                    className={`relative h-6 w-11 rounded-full transition ${
                      values.status ? "bg-primary" : "bg-dark/20"
                    }`}
                  >
                    <span
                      className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-all ${
                        values.status ? "left-6" : "left-1"
                      }`}
                    />
                  </span>
                </button>
              </div>
            )}
          </div>
          <ImagePicker
            file={values.image}
            currentUrl={currentImage}
            error={touched.image && errors.image}
            onChange={(file) => {
              setFieldValue("image", file);
              setFieldTouched("image", true, false);
            }}
          />
          <div className="flex justify-end gap-3 pt-2">
            {onCancel && (
              <button type="button" className="btn-outline" onClick={onCancel}>
                Annuler
              </button>
            )}
            <button type="submit" className="btn-primary px-6" disabled={isSubmitting}>
              {isSubmitting ? "Enregistrement…" : submitLabel}
            </button>
          </div>
        </Form>
      )}
    </Formik>
  );
}
