import { Leaf } from "lucide-react";
import type { ProductMaintenance } from "@/types/product";

interface Props {
  maintenance: ProductMaintenance;
}

export function MaintenanceSection({ maintenance }: Props) {
  return (
    <>
      <div
        className="columns-1 md:columns-2 gap-8 md:gap-10 *:break-inside-avoid text-base md:text-lg text-foreground/85 leading-relaxed rich-content ck-content"
        dangerouslySetInnerHTML={{ __html: maintenance.maintenance }}
      />

      {maintenance.additionalInfo && (
        <div className="mt-6 flex items-start gap-3 rounded-2xl bg-green-soft/12 border border-green-soft/25 px-5 py-4">
          <Leaf className="h-5 w-5 shrink-0 mt-0.5 text-green-text" aria-hidden />
          <p className="text-base md:text-lg text-green-text font-medium leading-relaxed">
            {maintenance.additionalInfo}
          </p>
        </div>
      )}
    </>
  );
}
