import { motion } from "framer-motion";
import { Lightbulb } from "lucide-react";

interface RecommendationCardProps {
  recommendation: string;
  index: number;
}

export const RecommendationCard = ({
  recommendation,
  index,
}: RecommendationCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 + index * 0.1 }}
      className="bg-card rounded-xl p-6 border border-border hover:border-primary/50 transition-colors"
    >
      <div className="flex gap-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
          <Lightbulb className="w-6 h-6 text-primary-foreground" />
        </div>
        <div className="flex-1">
          <p className="text-foreground leading-relaxed">{recommendation}</p>
        </div>
      </div>
    </motion.div>
  );
};
