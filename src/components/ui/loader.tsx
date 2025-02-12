import { Loader2 } from "lucide-react";

interface LoaderProps {
  message?: string;
}

export function LoaderOverlay({ message = "Loading..." }: LoaderProps) {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4 p-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-lg font-medium text-muted-foreground">{message}</p>
      </div>
    </div>
  );
} 