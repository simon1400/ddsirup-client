import type { ProductMaintenance } from "@/types/product";

interface Props {
  maintenance: ProductMaintenance;
}

export function MaintenanceSection({ maintenance }: Props) {
  return (
    <>
      <div
        className="columns-1 md:columns-2 gap-4 md:gap-6 *:break-inside-avoid text-base md:text-lg text-foreground leading-relaxed rich-content ck-content"
        dangerouslySetInnerHTML={{ __html: maintenance.maintenance }}
      />

      {maintenance.additionalInfo && (
        <p className="mt-4 text-base md:text-lg text-muted-foreground">
          {maintenance.additionalInfo}
        </p>
      )}
    </>
  );
}
