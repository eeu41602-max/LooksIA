import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Sparkles, Zap, Crown } from "lucide-react";

const Store = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        navigate("/auth");
      } else {
        setUser(user);
      }
    });
  }, [navigate]);

  const products = {
    spins: [
      { quantity: 3, price: 2.99, popular: false },
      { quantity: 5, price: 4.99, popular: true },
      { quantity: 10, price: 8.99, popular: false },
    ],
    analyses: [
      { quantity: 1, price: 9.99, popular: false },
      { quantity: 3, price: 16.99, popular: true },
      { quantity: 5, price: 19.99, popular: false },
    ],
  };

  const handlePurchase = async (type: "spins" | "pro_analyses", quantity: number, price: number) => {
    if (!user) {
      navigate("/auth");
      return;
    }

    setLoading(true);

    try {
      // Create transaction record
      const { error: transactionError } = await supabase
        .from("transactions")
        .insert({
          user_id: user.id,
          product_type: type,
          quantity,
          amount_brl: price,
          status: "completed", // In production, this would be 'pending' until payment confirms
        });

      if (transactionError) throw transactionError;

      // Update user credits (simulated purchase - in production this would happen after payment)
      // Fetch current credits first
      const { data: currentCredits } = await supabase
        .from("user_credits")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (!currentCredits) throw new Error("Créditos não encontrados");

      const { error: creditError } = await supabase
        .from("user_credits")
        .update({
          [type]: currentCredits[type] + quantity,
        })
        .eq("user_id", user.id);

      if (creditError) throw creditError;

      toast({
        title: "Compra realizada!",
        description: `Você comprou ${quantity} ${type === "spins" ? "giros" : "análises PRO"}!`,
      });

      // In production, integrate with Stripe here
    } catch (error: any) {
      toast({
        title: "Erro na compra",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-6 text-gold hover:text-gold-light"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Loja <span className="text-gradient-gold">LooksIA</span>
          </h1>
          <p className="text-gray-400">
            Compre giros para a roleta ou análises PRO diretas
          </p>
        </motion.div>

        {/* Spins Section */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <Zap className="w-8 h-8 text-gold" />
            <h2 className="text-3xl font-bold text-white">Giros da Roleta</h2>
          </div>
          <p className="text-gray-400 mb-6">
            Gire a roleta e tente ganhar análises básicas ou PRO!
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            {products.spins.map((product) => (
              <Card
                key={product.quantity}
                className={`glass-card p-6 border ${
                  product.popular ? "border-gold shadow-gold-lg" : "border-gold/20"
                } relative`}
              >
                {product.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-gold text-black px-4 py-1 rounded-full text-sm font-bold">
                    POPULAR
                  </div>
                )}
                <div className="text-center mb-6">
                  <p className="text-5xl font-bold text-gold mb-2">{product.quantity}</p>
                  <p className="text-white text-lg">Giros</p>
                </div>
                <div className="text-center mb-6">
                  <p className="text-3xl font-bold text-white">
                    R$ {product.price.toFixed(2)}
                  </p>
                </div>
                <Button
                  onClick={() => handlePurchase("spins", product.quantity, product.price)}
                  disabled={loading}
                  className="w-full bg-gradient-gold text-black font-semibold hover:scale-105 transition-transform"
                >
                  Comprar
                </Button>
              </Card>
            ))}
          </div>
        </div>

        {/* PRO Analyses Section */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <Crown className="w-8 h-8 text-gold" />
            <h2 className="text-3xl font-bold text-white">Análises PRO</h2>
          </div>
          <p className="text-gray-400 mb-6">
            Compre análises PRO diretas sem depender da sorte!
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            {products.analyses.map((product) => (
              <Card
                key={product.quantity}
                className={`glass-card p-6 border ${
                  product.popular ? "border-gold shadow-gold-lg" : "border-gold/20"
                } relative`}
              >
                {product.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-gold text-black px-4 py-1 rounded-full text-sm font-bold">
                    MELHOR OFERTA
                  </div>
                )}
                <div className="text-center mb-6">
                  <Sparkles className="w-12 h-12 text-gold mx-auto mb-2" />
                  <p className="text-5xl font-bold text-gold mb-2">{product.quantity}</p>
                  <p className="text-white text-lg">Análises PRO</p>
                </div>
                <div className="text-center mb-6">
                  <p className="text-3xl font-bold text-white">
                    R$ {product.price.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    R$ {(product.price / product.quantity).toFixed(2)} cada
                  </p>
                </div>
                <Button
                  onClick={() => handlePurchase("pro_analyses", product.quantity, product.price)}
                  disabled={loading}
                  className="w-full bg-gradient-gold text-black font-semibold hover:scale-105 transition-transform"
                >
                  Comprar
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Store;
