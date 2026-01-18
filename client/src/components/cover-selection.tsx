import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const THEMES = [
  { id: "classic-blue", name: "Classic Blue", color: "#2c3e50", primary: "215 35% 30%" },
  { id: "forest-green", name: "Forest Green", color: "#2d4036", primary: "150 30% 25%" },
  { id: "muji-red", name: "Deep Red", color: "#7b2c2c", primary: "0 40% 30%" },
  { id: "charcoal", name: "Charcoal", color: "#333333", primary: "220 10% 20%" },
  { id: "kraft", name: "Kraft", color: "#8c7b6c", primary: "30 20% 40%" },
  { id: "plum", name: "Plum", color: "#4a3b4a", primary: "280 15% 30%" }
];

export function CoverSelection() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);

  useEffect(() => {
    // Check if theme is already set
    const savedTheme = localStorage.getItem("diary-theme");
    if (!savedTheme) {
      // Small delay to allow fade in animation after app load
      setTimeout(() => setIsOpen(true), 500);
    } else {
      applyTheme(savedTheme);
    }
  }, []);

  const applyTheme = (themeId: string) => {
    const theme = THEMES.find(t => t.id === themeId);
    if (theme) {
      document.documentElement.style.setProperty("--primary", theme.primary);
      // We can adjust other variables if needed, e.g. --ring
      document.documentElement.style.setProperty("--ring", theme.primary);
    }
  };

  const handleSelect = (themeId: string) => {
    setSelectedTheme(themeId);
    applyTheme(themeId);
    localStorage.setItem("diary-theme", themeId);
    
    // Allow animation to play out
    setTimeout(() => {
      setIsOpen(false);
      // Trigger onboarding guide if needed after this
      window.dispatchEvent(new Event("check-onboarding"));
    }, 800);
  };

  if (!isOpen && !selectedTheme) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8"
        >
          <div className="max-w-5xl w-full flex flex-col items-center gap-12">
            <div className="text-center space-y-4">
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-3xl md:text-4xl font-serif font-medium tracking-tight text-foreground"
              >
                Choose your diary
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-muted-foreground text-lg max-w-md mx-auto"
              >
                Select a cover that brings you calm and focus.
              </motion.p>
            </div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 w-full place-items-center"
            >
              {THEMES.map((theme, index) => (
                <div key={theme.id} className="relative group perspective-1000">
                  <motion.button
                    onClick={() => handleSelect(theme.id)}
                    whileHover={{ scale: 1.05, rotateY: -5 }}
                    whileTap={{ scale: 0.95 }}
                    className={cn(
                      "relative w-32 h-48 md:w-36 md:h-52 rounded-r-lg shadow-xl transition-all duration-500 ease-out cursor-pointer overflow-hidden transform-style-3d",
                      "hover:shadow-2xl hover:-translate-y-2 ring-1 ring-black/5",
                      selectedTheme === theme.id ? "ring-4 ring-primary ring-offset-4 ring-offset-background scale-105" : ""
                    )}
                    style={{ 
                      backgroundColor: theme.color,
                      transformOrigin: "left center" 
                    }}
                  >
                    {/* Spine texture/shadow */}
                    <div className="absolute top-0 left-0 w-4 h-full bg-black/10 mix-blend-multiply" />
                    
                    {/* Paper texture overlay */}
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cardboard-flat.png')] opacity-10 mix-blend-overlay" />
                    
                    {/* Subtle gradient for depth */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-white/10 pointer-events-none" />

                    {/* Label Area (Muji Style) */}
                    <div className="absolute top-6 right-4 bg-white/90 backdrop-blur-[2px] w-2 h-16 shadow-sm opacity-80" />

                    {/* Selection Indicator */}
                    {selectedTheme === theme.id && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/10 backdrop-blur-[1px]">
                        <motion.div 
                          initial={{ scale: 0 }} 
                          animate={{ scale: 1 }}
                          className="bg-white text-black rounded-full p-2 shadow-lg"
                        >
                          <Check className="w-5 h-5" />
                        </motion.div>
                      </div>
                    )}
                  </motion.button>
                  <p className="mt-4 text-sm font-medium text-center text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                    {theme.name}
                  </p>
                </div>
              ))}
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
