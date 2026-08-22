/**
 * Minimal layout so Studio is not wrapped by site chrome styles beyond body.
 */
export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
