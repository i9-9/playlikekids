import { ImagesIcon } from "@sanity/icons/Images";
import { UsersIcon } from "@sanity/icons/Users";
import type { StructureResolver } from "sanity/structure";

export const structure: StructureResolver = (S) =>
  S.list()
    .title("Play Like Kids")
    .items([
      S.listItem()
        .title("Home Hero")
        .icon(ImagesIcon)
        .schemaType("hero")
        .child(S.documentTypeList("hero").title("Home Hero")),
      S.divider(),
      S.listItem()
        .title("Directors")
        .icon(UsersIcon)
        .schemaType("director")
        .child(
          S.documentTypeList("director")
            .title("Directors")
            .defaultOrdering([{ field: "order", direction: "asc" }]),
        ),
    ]);
