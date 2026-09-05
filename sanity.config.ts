"use client";

import { visionTool } from "@sanity/vision";
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { StudioIcon } from "./sanity/branding/StudioIcon";
import { schemaTypes } from "./sanity/schemaTypes";
import { structure } from "./sanity/structure";
import { studioTheme } from "./sanity/theme";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "";
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";

export default defineConfig({
  name: "playlikekids",
  title: "Play Like Kids",
  subtitle: "Directors & hero",
  icon: StudioIcon,
  projectId,
  dataset,
  basePath: "/studio",
  theme: studioTheme,
  plugins: [structureTool({ structure }), visionTool()],
  schema: {
    types: schemaTypes,
  },
});
