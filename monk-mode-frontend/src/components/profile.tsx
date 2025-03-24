import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ModeToggle } from "./mode-toggle";

export function Profile() {
  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <ModeToggle />
            <p>Toggle Theme</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
