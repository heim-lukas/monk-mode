import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

export function NotFound() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const handleNavigation = () => {
    if (token) {
      navigate("/dashboard");
    } else {
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle className="text-4xl font-bold text-center">404</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-muted-foreground">
            Oops! The page you're looking for doesn't exist.
          </p>
          <Button className="w-full" onClick={handleNavigation}>
            {token ? "Return to Dashboard" : "Return to Login"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
