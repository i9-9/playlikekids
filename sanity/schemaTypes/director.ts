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
      name: "previewImage",
      title: "Preview image",
      type: "image",
      description:
        "Still shown on /directors. Leave empty to use the local roster photo.",
      options: { hotspot: true },
      fields: [
        defineField({
          name: "alt",
          title: "Alt text",
          type: "string",
        }),
      ],
    }),
    defineField({
      name: "credits",
      title: "Credits",
      type: "array",
      description:
        "Films in on-site order. Each credit can carry its own Vimeo ID.",
      of: [{ type: "credit" }],
      validation: (rule) => rule.min(1),
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
      media: "previewImage",
    },
    prepare({ title, order, media }) {
      const padded =
        typeof order === "number" ? String(order).padStart(2, "0") : "—";
      return {
        title: title ?? "Untitled",
        subtitle: padded,
        media,
      };
    },
  },
});
