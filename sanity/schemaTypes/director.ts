import { defineField, defineType } from "sanity";

export const director = defineType({
  name: "director",
  title: "Director",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "name", maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "order",
      title: "Order",
      type: "number",
      description: "Display order on the directors grid (editable as roster grows).",
      validation: (rule) => rule.required().integer().min(1),
    }),
    defineField({
      name: "credits",
      title: "Credits",
      type: "array",
      of: [{ type: "credit" }],
      validation: (rule) => rule.min(1),
    }),
    defineField({
      name: "reel",
      title: "Reel",
      type: "string",
      description:
        "Vimeo video ID or full Vimeo URL. Thumbnail is resolved from Vimeo — do not upload a separate image.",
    }),
  ],
  orderings: [
    {
      title: "Order",
      name: "orderAsc",
      by: [{ field: "order", direction: "asc" }],
    },
  ],
  preview: {
    select: {
      title: "name",
      order: "order",
    },
    prepare({ title, order }) {
      const padded =
        typeof order === "number" ? String(order).padStart(2, "0") : "—";
      return {
        title: title ?? "Untitled",
        subtitle: padded,
      };
    },
  },
});
