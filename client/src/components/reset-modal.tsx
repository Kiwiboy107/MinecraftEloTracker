import { useMutation } from "@tanstack/react-query";
import { AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface ResetModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ResetModal({ open, onOpenChange }: ResetModalProps) {
  const { toast } = useToast();

  const resetDataMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', '/api/reset');
    },
    onSuccess: () => {
      toast({
        title: "Data Reset Complete",
        description: "All player data and battle history has been cleared.",
      });
      onOpenChange(false);
      queryClient.invalidateQueries({ queryKey: ['/api/players'] });
      queryClient.invalidateQueries({ queryKey: ['/api/battles'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to reset data",
        variant: "destructive",
      });
    },
  });

  const handleConfirmReset = () => {
    resetDataMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gaming-card max-w-md">
        <DialogHeader>
          <div className="flex items-center space-x-3 mb-2">
            <AlertTriangle className="text-red-500 text-2xl" />
            <DialogTitle className="text-xl font-bold text-gray-100">
              Confirm Data Reset
            </DialogTitle>
          </div>
          <DialogDescription className="text-gray-300">
            Are you sure you want to reset all player data? This action cannot be undone and will remove all players, battles, and statistics.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex space-x-3">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={resetDataMutation.isPending}
            className="flex-1 bg-gray-600 hover:bg-gray-700 text-gray-200 border-gray-600"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirmReset}
            disabled={resetDataMutation.isPending}
            className="flex-1"
          >
            {resetDataMutation.isPending ? "Resetting..." : "Reset All Data"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
