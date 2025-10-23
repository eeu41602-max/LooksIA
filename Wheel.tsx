import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, ShoppingCart } from "lucide-react";
import SlotMachineWheel from "@/components/SlotMachineWheel";

const Wheel = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [credits, setCredits] = useState({ spins: 0, basic_analyses: 0, pro_analyses: 0 });
  const [loading, setLoading] = useState(true);

  const fetchCredits = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      setUser(user);

      const { data, error } = await supabase
        .from("user_credits")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error) throw error;
      if (data) {
        setCredits({
          spins: data.spins,
          basic_analyses: data.basic_analyses,
          pro_analyses: data.pro_analyses,
        });
      }
    } catch (error) {
      console.error("Error fetching credits:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCredits();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-white">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="text-foreground hover:text-gold"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>

          <Button
            variant="outline"
            onClick={() => navigate("/loja")}
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Comprar Giros
          </Button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Roleta da <span className="text-gradient-gold">Sorte</span>
          </h1>
          <p className="text-muted-foreground mb-6">
            Gire a roleta e ganhe análises básicas ou PRO!
          </p>

          <div className="glass-card inline-block px-6 py-3 rounded-lg border border-gold/20 mb-8">
            <p className="text-foreground">
              Análises Básicas: <span className="text-gold font-bold">{credits.basic_analyses}</span>
              {" | "}
              Análises PRO: <span className="text-gold font-bold">{credits.pro_analyses}</span>
            </p>
          </div>
        </motion.div>

        <div className="flex justify-center">
          <SlotMachineWheel spinsAvailable={credits.spins} onSpinComplete={fetchCredits} />
        </div>

        {credits.spins === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-8 text-center space-y-4"
          >
            <div className="glass-card p-6 rounded-xl border border-gold/30 max-w-md mx-auto">
              <p className="text-muted-foreground mb-4 text-lg">Você não tem giros disponíveis 😔</p>
              <p className="text-sm text-muted-foreground mb-6">
                Compre mais giros e continue tentando ganhar análises PRO!
              </p>
              <Button
                onClick={() => navigate("/loja")}
                size="lg"
                className="bg-gradient-gold text-black font-semibold hover:scale-105 transition-transform"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Comprar Mais Giros
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Wheel;
