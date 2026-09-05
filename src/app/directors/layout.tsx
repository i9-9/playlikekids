import type { ReactNode } from "react";
import { DirectorsRoster } from "@/components/sections/DirectorsRoster";
import { directorsToListItems } from "@/components/ui/NumberedList";
import { getAllDirectors } from "@/lib/sanity/queries";

export default async function DirectorsLayout({
  children,
}: {
  children: ReactNode;
}) {
  const directors = await getAllDirectors();

  return (
    <DirectorsRoster items={directorsToListItems(directors)}>
      {children}
    </DirectorsRoster>
  );
}
