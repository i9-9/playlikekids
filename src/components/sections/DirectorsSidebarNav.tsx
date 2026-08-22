import {
  NumberedList,
  type NumberedListItem,
} from "@/components/ui/NumberedList";

type DirectorsSidebarNavProps = {
  items: NumberedListItem[];
  activeHref?: string;
  className?: string;
};

/**
 * Lateral / bottom numbered nav on director detail — same NumberedList primitive.
 */
export function DirectorsSidebarNav({
  items,
  activeHref,
  className = "",
}: DirectorsSidebarNavProps) {
  return (
    <aside className={className}>
      <NumberedList items={items} activeHref={activeHref} />
    </aside>
  );
}
