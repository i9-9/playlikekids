import { defineField, defineType } from "sanity";

export const credit = defineType({
  name: "credit",
  title: "Credit",
  type: "object",
  fields: [
    defineField({
      name: "brand",
      title: "Brand",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "project",
      title: "Project",
      type: "string",
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: {
      brand: "brand",
      project: "project",
    },
    prepare({ brand, project }) {
      return {
        title: [brand, project].filter(Boolean).join(" — "),
      };
    },
  },
});
