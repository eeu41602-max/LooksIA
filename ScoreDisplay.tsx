import { motion } from "framer-motion";

interface ScoreDisplayProps {
  score: number;
  label: string;
}

export const ScoreDisplay = ({ score, label }: ScoreDisplayProps) => {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", duration: 1 }}
          className="relative inline-block"
        >
          <div
            className="w-40 h-40 rounded-full flex items-center justify-center relative"
            style={{
              background: "var(--gradient-gold)",
              boxShadow: "var(--shadow-gold-lg)",
            }}
          >
            <div className="w-36 h-36 rounded-full bg-background flex items-center justify-center">
              <span className="text-6xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {score.toFixed(1)}
              </span>
            </div>
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="absolute -top-2 -right-2"
          >
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center text-2xl">
              ✨
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-2"
        >
          <h2 className="text-3xl font-bold text-foreground">{label}</h2>
          <p className="text-muted-foreground">
            Sua pontuação está baseada em análise facial por IA
          </p>
        </motion.div>
      </div>

      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 0.5, duration: 0.8 }}
        className="relative h-3 bg-muted rounded-full overflow-hidden"
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${(score / 10) * 100}%` }}
          transition={{ delay: 0.7, duration: 1 }}
          className="h-full rounded-full"
          style={{ background: "var(--gradient-gold)" }}
        />
      </motion.div>

      <div className="flex justify-between text-xs text-muted-foreground px-1">
        <span>1.0</span>
        <span>5.0</span>
        <span>10.0</span>
      </div>
    </div>
  );
};
