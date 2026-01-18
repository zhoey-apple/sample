import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import confetti from "canvas-confetti";

const THEMES = [
  { id: "classic-blue", name: "Classic Blue", color: "#2c3e50", primary: "215 35% 30%" },
  { id: "forest-green", name: "Forest Green", color: "#2d4036", primary: "150 30% 25%" },
  { id: "muji-red", name: "Deep Red", color: "#7b2c2c", primary: "0 40% 30%" },
  { id: "charcoal", name: "Charcoal", color: "#333333", primary: "220 10% 20%" },
  { id: "kraft", name: "Kraft", color: "#8c7b6c", primary: "30 20% 40%" },
  { id: "plum", name: "Plum", color: "#4a3b4a", primary: "280 15% 30%" },
  { id: "mustard", name: "Mustard", color: "#d4a017", primary: "45 80% 40%" },
  { id: "slate", name: "Slate", color: "#708090", primary: "210 25% 50%" },
  { id: "olive", name: "Olive", color: "#556b2f", primary: "80 40% 30%" }
];

export function CoverSelection() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [mouseX, setMouseX] = useState(0);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const requestRef = useRef<number>(0);
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    // Check if theme is already set
    const savedTheme = localStorage.getItem("diary-theme");
    if (!savedTheme) {
      setTimeout(() => setIsOpen(true), 500);
    } else {
      applyTheme(savedTheme);
    }

    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Mouse-driven scroll loop
  useEffect(() => {
    if (!isOpen) return;

    const scrollLoop = () => {
      if (!scrollContainerRef.current) return;
      
      const container = scrollContainerRef.current;
      const threshold = windowWidth * 0.25; // 25% zone on each side
      const maxSpeed = 15; // Max scroll speed px/frame

      // Scroll Left
      if (mouseX < threshold && mouseX > 0) {
        const intensity = 1 - (mouseX / threshold);
        container.scrollLeft -= intensity * maxSpeed;
      }
      
      // Scroll Right
      if (mouseX > (windowWidth - threshold)) {
        const intensity = (mouseX - (windowWidth - threshold)) / threshold;
        container.scrollLeft += intensity * maxSpeed;
      }

      requestRef.current = requestAnimationFrame(scrollLoop);
    };

    requestRef.current = requestAnimationFrame(scrollLoop);
    return () => cancelAnimationFrame(requestRef.current);
  }, [mouseX, windowWidth, isOpen]);

  const handleMouseMove = (e: React.MouseEvent) => {
    setMouseX(e.clientX);
  };

  const applyTheme = (themeId: string) => {
    const theme = THEMES.find(t => t.id === themeId);
    if (theme) {
      document.documentElement.style.setProperty("--primary", theme.primary);
      document.documentElement.style.setProperty("--ring", theme.primary);
    }
  };

  const handleSelect = (themeId: string) => {
    if (selectedTheme) return; // Prevent double clicks
    
    setSelectedTheme(themeId);
    applyTheme(themeId);
    localStorage.setItem("diary-theme", themeId);
    
    // Celebration!
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: THEMES.find(t => t.id === themeId) ? [THEMES.find(t => t.id === themeId)!.color, '#ffffff'] : undefined
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: THEMES.find(t => t.id === themeId) ? [THEMES.find(t => t.id === themeId)!.color, '#ffffff'] : undefined
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();

    // Close after animation
    setTimeout(() => {
      setIsOpen(false);
      window.dispatchEvent(new Event("check-onboarding"));
    }, 2500);
  };

  if (!isOpen && !selectedTheme) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-zinc-100 flex flex-col overflow-hidden cursor-none" // Hiding default cursor for immersion
          onMouseMove={handleMouseMove}
        >
          {/* Custom Cursor Hint */}
          <div 
            className="pointer-events-none fixed z-50 w-8 h-8 rounded-full border border-black/20 bg-white/50 backdrop-blur shadow-sm flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 transition-transform duration-75"
            style={{ left: mouseX, top: '50%' }} // Just tracking X for the hint effectively
          >
             <div className="w-1 h-1 bg-black rounded-full" />
          </div>

          <div className="flex-1 relative flex flex-col justify-center">
            <div className="text-center mb-12 space-y-2 pointer-events-none select-none z-10">
               <motion.h2 
                 initial={{ opacity: 0, y: -20 }}
                 animate={{ opacity: 1, y: 0 }}
                 className="text-xl md:text-2xl font-serif text-zinc-500 italic"
               >
                 Choose your companion for
               </motion.h2>
               <motion.h1 
                  key={selectedTheme ? "year" : "prompt"}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={cn(
                    "text-6xl md:text-9xl font-bold font-serif tracking-tighter transition-colors duration-500",
                    selectedTheme ? "text-primary" : "text-zinc-900"
                  )}
               >
                  {selectedTheme ? currentYear : "The Journey"}
               </motion.h1>
            </div>

            {/* Notebook Carousel */}
            <div 
              ref={scrollContainerRef}
              className="flex items-center gap-16 px-[50vw] overflow-x-auto no-scrollbar py-20"
              style={{ scrollBehavior: 'auto' }} // Manual JS scroll
            >
              {THEMES.map((theme) => (
                <motion.button
                  key={theme.id}
                  onClick={() => handleSelect(theme.id)}
                  whileHover={{ 
                    scale: 1.1, 
                    rotateY: -10,
                    y: -20,
                    transition: { type: "spring", stiffness: 300 } 
                  }}
                  whileTap={{ scale: 0.95 }}
                  className={cn(
                    "relative flex-shrink-0 w-64 h-96 rounded-r-2xl shadow-2xl transform-style-3d group perspective-1000 transition-all duration-500",
                    selectedTheme === theme.id ? "ring-4 ring-offset-8 ring-primary z-20 scale-110" : "opacity-90 hover:opacity-100 hover:z-10"
                  )}
                  style={{ backgroundColor: theme.color }}
                >
                    {/* Spine */}
                    <div className="absolute top-0 left-0 w-8 h-full bg-black/20 mix-blend-multiply rounded-l-sm" />
                    
                    {/* Texture */}
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cardboard-flat.png')] opacity-10 mix-blend-overlay rounded-r-2xl" />
                    
                    {/* Lighting Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-black/10 via-transparent to-white/10 rounded-r-2xl pointer-events-none" />

                    {/* Elastic Band (Classic Moleskine/Notebook style) */}
                    <div className="absolute top-0 right-8 w-3 h-full bg-black/20 shadow-sm" />

                    {/* Label */}
                    <div className="absolute bottom-12 left-12 right-12 h-24 bg-white/90 shadow-sm flex items-center justify-center backdrop-blur-sm transform group-hover:translate-x-1 transition-transform">
                        <div className="border border-black/10 p-2 w-full h-full flex items-center justify-center">
                            <span className="font-serif text-lg text-black/80">{theme.name}</span>
                        </div>
                    </div>
                </motion.button>
              ))}
            </div>
          </div>
          
          <div className="h-20 flex items-center justify-center text-zinc-400 text-sm font-medium tracking-widest uppercase pointer-events-none">
             {selectedTheme ? "Setting up your space..." : "Scroll to explore • Click to select"}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
