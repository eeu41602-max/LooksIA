import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Upload, Sparkles, Gift, LogOut, Zap, Crown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const Index = () => {
  const navigate = useNavigate();
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [credits, setCredits] = useState({ basic_analyses: 0, pro_analyses: 0, spins: 0 });
  const [showAnalysisDialog, setShowAnalysisDialog] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string>("");

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }

      setUser(session.user);
      fetchCredits(session.user.id);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
        fetchCredits(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchCredits = async (userId: string) => {
    const { data, error } = await supabase
      .from("user_credits")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (!error && data) {
      setCredits({
        basic_analyses: data.basic_analyses,
        pro_analyses: data.pro_analyses,
        spins: data.spins,
      });
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Arquivo inválido",
        description: "Por favor, envie uma imagem (JPG, PNG ou WEBP).",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Image = reader.result as string;
      setSelectedImage(base64Image);
      setShowAnalysisDialog(true);
    };
    reader.readAsDataURL(file);
  };

  const startAnalysis = (analysisType: "basic" | "pro") => {
    const hasCredit = analysisType === "basic" 
      ? credits.basic_analyses > 0 
      : credits.pro_analyses > 0;

    if (!hasCredit) {
      toast({
        title: "Créditos insuficientes",
        description: `Você não tem análises ${analysisType === "basic" ? "básicas" : "PRO"} disponíveis.`,
        variant: "destructive",
      });
      return;
    }

    setShowAnalysisDialog(false);
    navigate("/resultado", { 
      state: { 
        image: selectedImage, 
        analysisType,
        userId: user?.id 
      } 
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileUpload(file);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-white">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full py-6 px-4 border-b border-gold/20"
      >
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Sparkles className="w-8 h-8 text-gold" />
            <h1 className="text-2xl font-bold text-gradient-gold">LooksIA</h1>
          </div>

          <div className="flex items-center gap-4">
            {/* Credits Display */}
            <div className="glass-card px-4 py-2 rounded-lg border border-gold/20 flex items-center gap-4">
              <div className="flex items-center gap-2" title="Análises Básicas">
                <Zap className="w-4 h-4 text-blue-400" />
                <span className="text-foreground text-sm font-medium">{credits.basic_analyses}</span>
              </div>
              <div className="flex items-center gap-2" title="Análises PRO">
                <Crown className="w-4 h-4 text-gold" />
                <span className="text-foreground text-sm font-medium">{credits.pro_analyses}</span>
              </div>
              <div className="flex items-center gap-2" title="Giros">
                <Gift className="w-4 h-4 text-purple-400" />
                <span className="text-foreground text-sm font-medium">{credits.spins}</span>
              </div>
            </div>

            <Button
              variant="outline"
              onClick={() => navigate("/roleta")}
              className="border-gold/50 text-foreground hover:bg-gold hover:text-black hover:border-gold"
            >
              <Gift className="w-4 h-4 mr-2" />
              Roleta
            </Button>

            <Button
              variant="outline"
              onClick={() => navigate("/loja")}
              className="border-gold/50 text-foreground hover:bg-gold hover:text-black hover:border-gold"
            >
              Loja
            </Button>

            <Button
              variant="ghost"
              onClick={handleLogout}
              className="text-foreground hover:text-gold"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-4xl w-full text-center space-y-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-6"
          >
            <h2 className="text-5xl md:text-7xl font-bold text-white leading-tight">
              Descubra seu{" "}
              <span className="text-gradient-gold">verdadeiro potencial</span> facial
            </h2>
            <p className="text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto">
              Envie uma foto e receba uma análise precisa com base em padrões de estética facial
            </p>
          </motion.div>

          {/* Upload Area */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="relative"
          >
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className={`relative glass-card border-2 border-dashed rounded-2xl p-12 transition-all duration-300 ${
                isDragging
                  ? "border-gold shadow-gold-lg scale-105"
                  : "border-gold/30 hover:border-gold/50"
              }`}
            >
              <input
                type="file"
                id="file-upload"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                disabled={isUploading}
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center gap-6"
              >
                <div className="w-24 h-24 rounded-full bg-gradient-gold flex items-center justify-center">
                  <Upload className="w-12 h-12 text-black" />
                </div>
                <div className="space-y-2">
                  <p className="text-2xl font-semibold text-white">
                    {isUploading ? "Processando..." : "Arraste sua foto aqui"}
                  </p>
                  <p className="text-gray-400">ou clique para selecionar</p>
                </div>
                <Button
                  size="lg"
                  className="mt-4 bg-gradient-gold text-black font-semibold px-8 py-6 text-lg hover:scale-105 transition-transform"
                  disabled={isUploading}
                >
                  Analisar meu rosto agora
                </Button>
              </label>
            </div>

            {/* Instructions */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-8 glass-card p-6 rounded-xl border border-gold/20"
            >
              <h3 className="text-sm font-semibold text-gold mb-3">
                📸 Dicas para melhor resultado:
              </h3>
              <ul className="text-sm text-gray-400 space-y-2 text-left max-w-md mx-auto">
                <li>• Foto frontal, olhando para a câmera</li>
                <li>• Boa iluminação, sem sombras fortes</li>
                <li>• Rosto visível e centralizado</li>
                <li>• Sem óculos escuros ou acessórios que cubram o rosto</li>
              </ul>
            </motion.div>
          </motion.div>
        </div>
      </main>

      {/* Analysis Type Dialog */}
      <Dialog open={showAnalysisDialog} onOpenChange={setShowAnalysisDialog}>
        <DialogContent className="bg-black border-gold/30">
          <DialogHeader>
            <DialogTitle className="text-white text-2xl">Escolha o tipo de análise</DialogTitle>
            <DialogDescription className="text-gray-400">
              Selecione qual análise você deseja realizar
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <Button
              onClick={() => startAnalysis("basic")}
              disabled={credits.basic_analyses === 0}
              className="h-auto flex-col gap-3 py-6 bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
            >
              <Zap className="w-8 h-8" />
              <div>
                <p className="font-bold text-lg">Análise Básica</p>
                <p className="text-sm opacity-90">
                  {credits.basic_analyses} disponíveis
                </p>
              </div>
            </Button>

            <Button
              onClick={() => startAnalysis("pro")}
              disabled={credits.pro_analyses === 0}
              className="h-auto flex-col gap-3 py-6 bg-gradient-gold hover:scale-105 transition-transform text-black"
            >
              <Crown className="w-8 h-8" />
              <div>
                <p className="font-bold text-lg">Análise PRO</p>
                <p className="text-sm opacity-90">
                  {credits.pro_analyses} disponíveis
                </p>
              </div>
            </Button>
          </div>

          {credits.basic_analyses === 0 && credits.pro_analyses === 0 && (
            <p className="text-center text-gold text-sm mt-4">
              Você não tem créditos. Gire a roleta ou visite a loja!
            </p>
          )}
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <footer className="w-full py-6 px-4 border-t border-gold/20">
        <div className="max-w-6xl mx-auto text-center space-y-4">
          <p className="text-sm text-gray-400">
            © 2025 LooksIA — Powered by Artificial Intelligence
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
