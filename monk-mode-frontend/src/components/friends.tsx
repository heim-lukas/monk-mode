import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function Friends() {
  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Friends</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Here you can see your friends</p>
        </CardContent>
      </Card>
    </div>
  );
}
