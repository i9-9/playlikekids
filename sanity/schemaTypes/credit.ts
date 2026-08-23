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
    defineField({
      name: "vimeoId",
      title: "Vimeo ID",
      type: "string",
      description: "Numeric video ID, e.g. 1216249852.",
    }),
    defineField({
      name: "vimeoHash",
      title: "Vimeo privacy hash",
      type: "string",
      description:
        "Only for unlisted videos. From the share URL after the ID (vimeo.com/ID/HASH).",
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
