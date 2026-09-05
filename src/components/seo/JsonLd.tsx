import type { JsonLd } from "@/lib/json-ld";

type JsonLdProps = {
  data: JsonLd | readonly JsonLd[];
};

/** Server-only JSON-LD. Escapes `<` so the payload cannot break out of the script tag. */
export function JsonLd({ data }: JsonLdProps) {
  const payloads = Array.isArray(data) ? data : [data];

  return (
    <>
      {payloads.map((payload, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(payload).replace(/</g, "\\u003c"),
          }}
        />
      ))}
    </>
  );
}
