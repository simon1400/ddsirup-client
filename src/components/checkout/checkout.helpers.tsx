export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-destructive mt-1">{message}</p>;
}

export function CountryField() {
  return (
    <div className="flex h-10 w-full items-center rounded-full border border-input bg-muted px-4 text-sm text-muted-foreground">
      Česká republika
    </div>
  );
}
