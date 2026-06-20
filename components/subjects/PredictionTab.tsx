import { EmptyState } from "@/components/shared/EmptyState";
import { TrendingUp } from "lucide-react";

export function PredictionTab() {
  return (
    <div className="p-6">
      <EmptyState 
        icon={TrendingUp}
        title="Grade Prediction Coming Soon"
        description="Advanced grade predictors and 'What-If' simulators will be available in Phase 5."
      />
    </div>
  );
}
