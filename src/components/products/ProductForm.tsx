"use client";

import { FormEvent, useEffect, useState } from "react";
import { getCategories } from "@/lib/api/categories";
import { isCancelledError } from "@/lib/api/errors";
import type { ApiError } from "@/types/api";
import type { Category, Product, ProductFormValues } from "@/types/product";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";

interface ProductFormProps {
  initialValues?: Partial<Product>;
  submitLabel: string;
  onSubmit: (values: {
    title: string;
    description: string;
    price: number;
    category: string;
    stock: number;
    rating: number;
    brand: string;
    thumbnail: string;
    images: string[];
  }) => Promise<void>;
  onCancel: () => void;
}

function toFormValues(product?: Partial<Product>): ProductFormValues {
  return {
    title: product?.title ?? "",
    description: product?.description ?? "",
    price: product?.price !== undefined ? String(product.price) : "",
    category: product?.category ?? "",
    stock: product?.stock !== undefined ? String(product.stock) : "",
    rating: product?.rating !== undefined ? String(product.rating) : "",
    brand: product?.brand ?? "",
    thumbnail: product?.thumbnail ?? "",
  };
}

export function ProductForm({
  initialValues,
  submitLabel,
  onSubmit,
  onCancel,
}: ProductFormProps) {
  const [values, setValues] = useState<ProductFormValues>(
    toFormValues(initialValues)
  );
  const [errors, setErrors] = useState<Partial<Record<keyof ProductFormValues, string>>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);

  useEffect(() => {
    setValues(toFormValues(initialValues));
  }, [initialValues]);

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        const data = await getCategories({ signal: controller.signal });
        setCategories(data);
      } catch (error) {
        if (!isCancelledError(error)) {
          setCategoriesError((error as ApiError).message);
        }
      }
    }
    void load();
    return () => controller.abort();
  }, []);

  function updateField<K extends keyof ProductFormValues>(
    key: K,
    value: ProductFormValues[K]
  ) {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function validate(): boolean {
    const next: Partial<Record<keyof ProductFormValues, string>> = {};

    if (!values.title.trim()) next.title = "Title is required.";
    if (!values.description.trim()) next.description = "Description is required.";
    if (!values.category) next.category = "Category is required.";

    const price = Number(values.price);
    if (values.price.trim() === "" || Number.isNaN(price)) {
      next.price = "Enter a valid price.";
    } else if (price < 0) {
      next.price = "Price must be zero or greater.";
    }

    const stock = Number(values.stock);
    if (values.stock.trim() === "" || Number.isNaN(stock) || !Number.isInteger(stock)) {
      next.stock = "Enter a whole number for stock.";
    } else if (stock < 0) {
      next.stock = "Stock must be zero or greater.";
    }

    const rating = Number(values.rating);
    if (values.rating.trim() === "" || Number.isNaN(rating)) {
      next.rating = "Enter a valid rating.";
    } else if (rating < 0 || rating > 5) {
      next.rating = "Rating must be between 0 and 5.";
    }

    if (values.thumbnail && !/^https?:\/\//i.test(values.thumbnail.trim())) {
      next.thumbnail = "Thumbnail must be a valid URL.";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (isSaving) return;
    setFormError(null);
    if (!validate()) return;

    setIsSaving(true);
    try {
      const thumbnail = values.thumbnail.trim();
      await onSubmit({
        title: values.title.trim(),
        description: values.description.trim(),
        price: Number(values.price),
        category: values.category,
        stock: Number(values.stock),
        rating: Number(values.rating),
        brand: values.brand.trim(),
        thumbnail,
        images: thumbnail ? [thumbnail] : [],
      });
    } catch (error) {
      setFormError((error as ApiError).message || "Unable to save product.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
      noValidate
    >
      <div className="grid gap-4 md:grid-cols-2">
        <Input
          label="Title"
          name="title"
          value={values.title}
          onChange={(e) => updateField("title", e.target.value)}
          error={errors.title}
          required
          disabled={isSaving}
        />
        <Select
          label="Category"
          name="category"
          value={values.category}
          onChange={(e) => updateField("category", e.target.value)}
          error={errors.category || categoriesError || undefined}
          required
          disabled={isSaving}
          options={[
            { value: "", label: "Select a category" },
            ...categories.map((c) => ({ value: c.slug, label: c.name })),
          ]}
        />
        <Input
          label="Price"
          name="price"
          type="number"
          min="0"
          step="0.01"
          value={values.price}
          onChange={(e) => updateField("price", e.target.value)}
          error={errors.price}
          required
          disabled={isSaving}
        />
        <Input
          label="Stock"
          name="stock"
          type="number"
          min="0"
          step="1"
          value={values.stock}
          onChange={(e) => updateField("stock", e.target.value)}
          error={errors.stock}
          required
          disabled={isSaving}
        />
        <Input
          label="Rating"
          name="rating"
          type="number"
          min="0"
          max="5"
          step="0.01"
          value={values.rating}
          onChange={(e) => updateField("rating", e.target.value)}
          error={errors.rating}
          required
          disabled={isSaving}
        />
        <Input
          label="Brand"
          name="brand"
          value={values.brand}
          onChange={(e) => updateField("brand", e.target.value)}
          disabled={isSaving}
        />
      </div>

      <Textarea
        label="Description"
        name="description"
        value={values.description}
        onChange={(e) => updateField("description", e.target.value)}
        error={errors.description}
        required
        disabled={isSaving}
      />

      <Input
        label="Image URL"
        name="thumbnail"
        value={values.thumbnail}
        onChange={(e) => updateField("thumbnail", e.target.value)}
        error={errors.thumbnail}
        hint="Optional. Use a full https:// image URL."
        disabled={isSaving}
      />

      {formError ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {formError}
        </p>
      ) : null}

      <div className="flex flex-wrap justify-end gap-3 pt-2">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={isSaving}
        >
          Cancel
        </Button>
        <Button type="submit" loading={isSaving} disabled={isSaving}>
          {isSaving ? "Saving…" : submitLabel}
        </Button>
      </div>
    </form>
  );
}
