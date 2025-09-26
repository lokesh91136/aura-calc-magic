import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="bg-gradient-card border-border/20 shadow-2xl max-w-md w-full">
        <CardContent className="p-8 text-center space-y-4">
          <div className="text-6xl font-bold bg-gradient-clear bg-clip-text text-transparent">
            404
          </div>
          <h1 className="text-2xl font-bold text-foreground">Page Not Found</h1>
          <p className="text-muted-foreground">
            Oops! The calculator you're looking for doesn't exist.
          </p>
          <Button 
            onClick={() => window.location.href = "/"}
            className="bg-gradient-primary hover:shadow-aura transition-all duration-200"
          >
            Return to AuraCalc
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotFound;
