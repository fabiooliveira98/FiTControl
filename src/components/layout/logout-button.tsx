import { LogOut } from "lucide-react";

import { fazerLogout } from "@/app/(painel)/sair/action";
import { Button } from "@/components/ui/button";

export function LogoutButton() {
  return (
    <form action={fazerLogout}>
      <Button type="submit" variant="ghost" size="sm">
        <LogOut className="size-4" />
        Sair
      </Button>
    </form>
  );
}
