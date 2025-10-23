import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface SpinWheelProps {
  spinsAvailable: number;
  onSpinComplete: () => void;
}

const SpinWheel = ({ spinsAvailable, onSpinComplete }: SpinWheelProps) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const { toast } = useToast();

  const prizes = [
    { type: "basic", label: "Análise Básica", color: "from-blue-500 to-blue-600", chance: 0.9 },
    { type: "pro", label: "Análise PRO", color: "from-gold to-gold-light", chance: 0.1 },
  ];

  const handleSpin = async () => {
    if (spinsAvailable <= 0 || isSpinning) return;

    setIsSpinning(true);

    try {
      // Determine prize (90% basic, 10% pro)
      const random = Math.random();
      const wonPro = random < 0.1;
      const prizeType = wonPro ? "pro" : "basic";

      // Calculate rotation (multiple full spins + final position)
      const baseRotation = 360 * 5; // 5 full spins
      const prizeAngle = wonPro ? 90 : 270; // Pro at top, Basic at bottom
      const finalRotation = rotation + baseRotation + prizeAngle;
      
      setRotation(finalRotation);

      // Wait for animation
      await new Promise(resolve => setTimeout(resolve, 4000));

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
    <div className="flex flex-col items-center gap-6">
      <div className="relative w-80 h-80">
        {/* Wheel Container */}
        <motion.div
          className="w-full h-full rounded-full relative overflow-hidden border-4 border-gold shadow-gold-lg"
          animate={{ rotate: rotation }}
          transition={{ duration: 4, ease: "easeInOut" }}
        >
          {/* Top Half - PRO (10% chance) */}
          <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-gold to-gold-light flex items-center justify-center">
            <div className="text-center">
              <Sparkles className="w-8 h-8 text-black mx-auto mb-2" />
              <p className="text-black font-bold text-lg">Análise PRO</p>
            </div>
          </div>

          {/* Bottom Half - BASIC (90% chance) */}
          <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-b from-blue-500 to-blue-600 flex items-center justify-center">
            <div className="text-center">
              <Sparkles className="w-8 h-8 text-white mx-auto mb-2" />
              <p className="text-white font-bold text-lg">Análise Básica</p>
            </div>
          </div>
        </motion.div>

        {/* Pointer */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 z-10">
          <div className="w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-gold drop-shadow-xl" />
        </div>
      </div>

      <div className="text-center space-y-4">
        <p className="text-white text-lg">
          Giros disponíveis: <span className="text-gold font-bold">{spinsAvailable}</span>
        </p>

        <Button
          onClick={handleSpin}
          disabled={spinsAvailable <= 0 || isSpinning}
          className="bg-gradient-gold text-black font-semibold px-8 py-6 text-lg hover:scale-105 transition-transform disabled:opacity-50"
        >
          {isSpinning ? "Girando..." : "GIRAR ROLETA"}
        </Button>
      </div>
    </div>
  );
};

export default SpinWheel;
