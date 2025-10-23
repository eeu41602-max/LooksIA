import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Share2, Sparkles, AlertTriangle } from "lucide-react";
import { RadarChart } from "@/components/RadarChart";
import { ScoreDisplay } from "@/components/ScoreDisplay";
import { RecommendationCard } from "@/components/RecommendationCard";

interface AnalysisResult {
  score: number;
  label: string;
  symmetry: number;
  proportions: number;
  jawline: number;
  eyes: number;
  skin: number;
  harmony: number;
  insights: string[];
  weaknesses: string[];
  recommendations: string[];
}

const Resultado = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const image = location.state?.image;
  const analysisType = location.state?.analysisType || "basic";
  const userId = location.state?.userId;

  useEffect(() => {
    if (!image || !userId) {
      navigate("/");
      return;
    }

    analyzeImage();
  }, [image, userId]);

  const analyzeImage = async () => {
    try {
      // Call AI analysis
      const { data, error } = await supabase.functions.invoke("analyze-face", {
        body: { image },
      });

      if (error) throw error;

      // Simulate loading for better UX
      setTimeout(async () => {
        setResult(data);
        setIsAnalyzing(false);

        // Deduct credit
        await deductCredit();

        // Save to history
        await saveAnalysisHistory(data);
      }, 2000);
    } catch (error) {
      console.error("Error analyzing image:", error);
      toast({
        title: "Erro na análise",
        description: "Não foi possível analisar sua imagem. Tente novamente.",
        variant: "destructive",
      });
      navigate("/");
    }
  };

  const deductCredit = async () => {
    try {
      // Fetch current credits
      const { data: currentCredits } = await supabase
        .from("user_credits")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (!currentCredits) return;

      // Deduct the appropriate credit
      const field = analysisType === "basic" ? "basic_analyses" : "pro_analyses";
      await supabase
        .from("user_credits")
        .update({ [field]: currentCredits[field] - 1 })
        .eq("user_id", userId);
    } catch (error) {
      console.error("Error deducting credit:", error);
    }
  };

  const saveAnalysisHistory = async (analysisData: AnalysisResult) => {
    try {
      await supabase.from("analysis_history").insert({
        user_id: userId,
        analysis_type: analysisType,
        score: analysisData.score,
        result_data: analysisData as any,
      });
    } catch (error) {
      console.error("Error saving analysis history:", error);
    }
  };

  const handleShare = () => {
    toast({
      title: "Compartilhar resultado",
      description: "Funcionalidade em desenvolvimento!",
    });
  };

  if (isAnalyzing) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-6"
        >
          <div className="relative">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-24 h-24 mx-auto rounded-full border-4 border-gold/30 border-t-gold"
            />
            <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 text-gold" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white">Analisando seu rosto...</h2>
            <p className="text-gray-400">Nossa IA está processando sua imagem</p>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!result) return null;

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="w-full py-6 px-4 border-b border-gold/20">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="gap-2 text-gold hover:text-gold-light"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Button>
          <div className="flex items-center gap-2">
            <Sparkles className="w-8 h-8 text-gold" />
            <h1 className="text-2xl font-bold text-gradient-gold">LooksIA</h1>
          </div>
          <Button onClick={handleShare} className="gap-2 bg-gradient-gold text-black hover:scale-105 transition-transform">
            <Share2 className="w-4 h-4" />
            Compartilhar
          </Button>
        </div>
      </header>

      {/* Results */}
      <main className="max-w-6xl mx-auto px-4 py-12 space-y-12">
        {/* Image and Score */}
        <div className="grid md:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="relative"
          >
            <div className="relative rounded-2xl overflow-hidden border-2 border-gold/30">
              <img
                src={image}
                alt="Análise facial"
                className="w-full h-auto object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col justify-center space-y-6"
          >
            <ScoreDisplay score={result.score} label={result.label} />
            {analysisType === "pro" && (
              <div className="glass-card px-4 py-2 rounded-lg border border-gold/30 inline-flex items-center gap-2 w-fit">
                <Sparkles className="w-4 h-4 text-gold" />
                <span className="text-gold font-semibold">Análise PRO</span>
              </div>
            )}
          </motion.div>
        </div>

        {/* Radar Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <RadarChart
            data={{
              symmetry: result.symmetry,
              proportions: result.proportions,
              jawline: result.jawline,
              eyes: result.eyes,
              skin: result.skin,
              harmony: result.harmony,
            }}
          />
        </motion.div>

        {/* Insights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card rounded-2xl p-8 border border-gold/20"
        >
          <h3 className="text-2xl font-bold text-white mb-6">
            📊 Pontos Fortes
          </h3>
          <div className="space-y-4">
            {result.insights.map((insight, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="flex items-start gap-3 p-4 bg-black/50 rounded-lg border border-gold/10"
              >
                <div className="w-2 h-2 rounded-full bg-gold mt-2" />
                <p className="text-white flex-1">{insight}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Weaknesses (if any) */}
        {result.weaknesses && result.weaknesses.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-card rounded-2xl p-8 border border-orange-500/30"
          >
            <div className="flex items-center gap-3 mb-6">
              <AlertTriangle className="w-6 h-6 text-orange-500" />
              <h3 className="text-2xl font-bold text-white">
                Áreas para Melhoria
              </h3>
            </div>
            <div className="space-y-4">
              {result.weaknesses.map((weakness, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="flex items-start gap-3 p-4 bg-black/50 rounded-lg border border-orange-500/20"
                >
                  <div className="w-2 h-2 rounded-full bg-orange-500 mt-2" />
                  <p className="text-white flex-1">{weakness}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Recommendations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h3 className="text-2xl font-bold text-white mb-6">
            💡 Recomendações Personalizadas
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            {result.recommendations.map((rec, index) => (
              <RecommendationCard key={index} recommendation={rec} index={index} />
            ))}
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="w-full py-6 px-4 border-t border-gold/20 mt-12">
        <div className="max-w-6xl mx-auto text-center space-y-4">
          <p className="text-sm text-gray-400">
            © 2025 LooksIA — Powered by Artificial Intelligence
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Resultado;
