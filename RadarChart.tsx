import { motion } from "framer-motion";

interface RadarChartProps {
  data: {
    symmetry: number;
    proportions: number;
    jawline: number;
    eyes: number;
    skin: number;
    harmony: number;
  };
}

export const RadarChart = ({ data }: RadarChartProps) => {
  const attributes = [
    { key: "symmetry", label: "Simetria", value: data.symmetry },
    { key: "proportions", label: "Proporções", value: data.proportions },
    { key: "jawline", label: "Mandíbula", value: data.jawline },
    { key: "eyes", label: "Olhos", value: data.eyes },
    { key: "skin", label: "Pele", value: data.skin },
    { key: "harmony", label: "Harmonia", value: data.harmony },
  ];

  return (
    <div className="bg-card rounded-2xl p-8 border border-border">
      <h3 className="text-2xl font-bold text-foreground mb-8 text-center">
        Pontuação por Atributo
      </h3>
      <div className="space-y-6">
        {attributes.map((attr, index) => (
          <motion.div
            key={attr.key}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="space-y-2"
          >
            <div className="flex justify-between items-center">
              <span className="text-foreground font-medium">{attr.label}</span>
              <span className="text-primary font-bold">{attr.value}/10</span>
            </div>
            <div className="relative h-3 bg-muted rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(attr.value / 10) * 100}%` }}
                transition={{ delay: 0.5 + index * 0.1, duration: 0.8 }}
                className="h-full rounded-full"
                style={{
                  background: "var(--gradient-gold)",
                  boxShadow: "0 0 10px hsla(43, 100%, 50%, 0.5)",
                }}
              />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
