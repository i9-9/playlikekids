import { PlayIcon } from "@sanity/icons/Play";
import { defineField, defineType } from "sanity";

export const credit = defineType({
  name: "credit",
  title: "Credit",
  type: "object",
  icon: PlayIcon,
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
    defineField({
      name: "festival",
      title: "Festival",
      type: "object",
      description: "Optional laurel — shown on the director profile (e.g. Sundance).",
      fields: [
        defineField({
          name: "name",
          title: "Festival name",
          type: "string",
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: "year",
          title: "Year",
          type: "string",
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: "selection",
          title: "Selection",
          type: "string",
          initialValue: "Official Selection",
        }),
      ],
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
