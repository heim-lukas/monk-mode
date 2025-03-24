import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function Tasks() {
  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Your tasks will appear here</p>
        </CardContent>
      </Card>
    </div>
  );
}
