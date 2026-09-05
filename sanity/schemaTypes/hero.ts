import { ImagesIcon } from "@sanity/icons/Images";
import { defineField, defineType } from "sanity";

export const hero = defineType({
  name: "hero",
  title: "Home Hero",
  type: "document",
  icon: ImagesIcon,
  fields: [
    defineField({
      name: "title",
      title: "Internal title",
      type: "string",
      initialValue: "Home Hero",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "images",
      title: "Images",
      type: "array",
      description: "Exactly 3 images for the home hero crossfade cycle.",
      of: [
        {
          type: "image",
          options: { hotspot: true },
          fields: [
            defineField({
              name: "alt",
              title: "Alt text",
              type: "string",
            }),
          ],
        },
      ],
      validation: (rule) => rule.required().length(3),
    }),
  ],
  preview: {
    select: {
      title: "title",
      media: "images.0",
    },
  },
});
