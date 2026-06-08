import type { ProductMaintenance } from "@/types/product";

interface Props {
  maintenance: ProductMaintenance;
}

export function MaintenanceSection({ maintenance }: Props) {
  const rawText = maintenance.maintenance
    .replace(/<\/?p[^>]*>/gi, " ")
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

  const sentences: string[] = [];
  let currentSentence = "";
  let inTag = false;

  for (let i = 0; i < rawText.length; i++) {
    const char = rawText[i];
    currentSentence += char;

    if (char === "<") inTag = true;
    if (char === ">") inTag = false;

    if (!inTag && (char === "." || char === "!" || char === "?")) {
      const nextChar = rawText[i + 1];
      if (nextChar === " " || nextChar === undefined) {
        sentences.push(currentSentence.trim());
        currentSentence = "";
        if (nextChar === " ") i++;
      }
    }
  }

  if (currentSentence.trim()) {
    sentences.push(currentSentence.trim());
  }

  return (
    <>
      <div className="columns-1 md:columns-2 gap-4 md:gap-6">
        {sentences.map((sentence, index) => (
          <p
            key={index}
            className="break-inside-avoid mb-4 text-base md:text-lg text-foreground leading-relaxed"
            dangerouslySetInnerHTML={{ __html: sentence }}
          />
        ))}
      </div>

      {maintenance.additionalInfo && (
        <p className="mt-4 text-base md:text-lg text-muted-foreground">{maintenance.additionalInfo}</p>
      )}
    </>
  );
}
