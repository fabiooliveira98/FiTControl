import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function SearchForm({
  defaultValue = "",
  placeholder = "Pesquisar",
  paramName = "busca",
}: {
  defaultValue?: string;
  placeholder?: string;
  paramName?: string;
}) {
  return (
    <form className="flex gap-2" role="search">
      <div className="relative min-w-0 flex-1">
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-foreground/40"
          size={17}
        />
        <Input
          name={paramName}
          defaultValue={defaultValue}
          placeholder={placeholder}
          className="pl-11"
        />
      </div>
      <Button type="submit" variant="secondary">
        Buscar
      </Button>
    </form>
  );
}
