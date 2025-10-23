import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Sparkles, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface SlotMachineWheelProps {
  spinsAvailable: number;
  onSpinComplete: () => void;
}

const SlotMachineWheel = ({ spinsAvailable, onSpinComplete }: SlotMachineWheelProps) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<"basic" | "pro" | null>(null);
  const { toast } = useToast();

  const prizes = [
    { type: "basic" as const, label: "Análise Básica", icon: Zap, color: "from-blue-500 to-blue-600" },
    { type: "pro" as const, label: "Análise PRO", icon: Sparkles, color: "from-gold to-gold-light" },
  ];

  const handleSpin = async () => {
    if (spinsAvailable <= 0 || isSpinning) return;

    setIsSpinning(true);
    setResult(null);

    try {
      // Determine prize (90% basic, 10% pro)
      const random = Math.random();
      const wonPro = random < 0.1;
      const prizeType = wonPro ? "pro" : "basic";

      // Wait for animation
      await new Promise(resolve => setTimeout(resolve, 3000));

      setResult(prizeType);

      // Save spin to database
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      // Insert spin history
      const { error: spinError } = await supabase
        .from("spin_history")
        .insert({ user_id: user.id, prize_type: prizeType });

      if (spinError) throw spinError;

      // Update credits - fetch current values first
      const { data: currentCredits } = await supabase
        .from("user_credits")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (!currentCredits) throw new Error("Créditos não encontrados");

      const { error: creditError } = await supabase
        .from("user_credits")
        .update({
          spins: spinsAvailable - 1,
          basic_analyses: wonPro ? currentCredits.basic_analyses : currentCredits.basic_analyses + 1,
          pro_analyses: wonPro ? currentCredits.pro_analyses + 1 : currentCredits.pro_analyses,
        })
        .eq("user_id", user.id);

      if (creditError) throw creditError;

      toast({
        title: wonPro ? "🎉 PARABÉNS! Análise PRO!" : "✨ Análise Básica!",
        description: wonPro
          ? "Você ganhou uma Análise PRO completa!"
          : "Você ganhou uma Análise Básica!",
      });

      await new Promise(resolve => setTimeout(resolve, 2000));
      onSpinComplete();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSpinning(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-8">
      {/* Slot Machine Container */}
      <div className="relative">
        <div className="w-80 h-96 glass-card rounded-2xl border-4 border-gold overflow-hidden relative shadow-gold-lg">
          {/* Viewing Window */}
          <div className="absolute inset-0 flex flex-col justify-center items-center pointer-events-none z-10">
            <div className="w-full h-32 border-y-4 border-gold bg-gold/10"></div>
          </div>

          {/* Slot Items */}
          <div className="relative h-full overflow-hidden">
            <AnimatePresence mode="wait">
              {isSpinning ? (
                <motion.div
                  key="spinning"
                  className="absolute inset-0 flex flex-col"
                  initial={{ y: 0 }}
                  animate={{ 
                    y: [0, -800, -1600, -2400, -3200],
                  }}
                  transition={{ 
                    duration: 3, 
                    ease: [0.33, 1, 0.68, 1],
                  }}
                >
                  {[...Array(20)].map((_, i) => {
                    const prize = prizes[i % 2];
                    const Icon = prize.icon;
                    return (
                      <div
                        key={i}
                        className={`h-32 flex items-center justify-center bg-gradient-to-b ${prize.color}`}
                      >
                        <div className="text-center">
                          <Icon className="w-12 h-12 mx-auto mb-2 text-white" />
                          <p className="text-white font-bold text-xl">{prize.label}</p>
                        </div>
                      </div>
                    );
                  })}
                </motion.div>
              ) : result ? (
                <motion.div
                  key="result"
                  className="absolute inset-0 flex items-center justify-center"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                >
                  {(() => {
                    const prize = prizes.find(p => p.type === result)!;
                    const Icon = prize.icon;
                    return (
                      <div className={`w-full h-32 flex items-center justify-center bg-gradient-to-b ${prize.color}`}>
                        <div className="text-center">
                          <Icon className="w-16 h-16 mx-auto mb-3 text-white animate-pulse" />
                          <p className="text-white font-bold text-2xl">{prize.label}</p>
                        </div>
                      </div>
                    );
                  })()}
                </motion.div>
              ) : (
                <motion.div
                  key="idle"
                  className="absolute inset-0 flex flex-col justify-center"
                >
                  {prizes.map((prize, i) => {
                    const Icon = prize.icon;
                    return (
                      <div
                        key={i}
                        className={`h-48 flex items-center justify-center bg-gradient-to-b ${prize.color}`}
                      >
                        <div className="text-center">
                          <Icon className="w-12 h-12 mx-auto mb-2 text-white" />
                          <p className="text-white font-bold text-xl">{prize.label}</p>
                        </div>
                      </div>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Pointer Indicator */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 z-20 -ml-4">
            <div className="w-0 h-0 border-t-[20px] border-b-[20px] border-l-[16px] border-t-transparent border-b-transparent border-l-gold drop-shadow-2xl"></div>
          </div>
        </div>
      </div>

      <div className="text-center space-y-4">
        <p className="text-foreground text-lg">
          Giros disponíveis: <span className="text-gold font-bold text-2xl">{spinsAvailable}</span>
        </p>

        <Button
          onClick={handleSpin}
          disabled={spinsAvailable <= 0 || isSpinning}
          size="lg"
          className="bg-gradient-gold text-black font-semibold px-12 py-6 text-xl hover:scale-105 transition-transform disabled:opacity-50"
        >
          {isSpinning ? "GIRANDO..." : "GIRAR"}
        </Button>
      </div>
    </div>
  );
};

export default SlotMachineWheel;
