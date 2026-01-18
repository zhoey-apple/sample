import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import confetti from "canvas-confetti";
import { useI18n } from "@/lib/i18n";

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
  const [isHoveringItem, setIsHoveringItem] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [mouseX, setMouseX] = useState(0);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const requestRef = useRef<number>(0);
  const currentYear = new Date().getFullYear();
  const { t } = useI18n();

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
      const maxSpeed = 12; // Adjusted speed for smoother feel

      // Scroll Left
      if (mouseX < threshold && mouseX > 0) {
        const intensity = Math.pow(1 - (mouseX / threshold), 2); // Quadratic easing for more natural acceleration
        container.scrollLeft -= intensity * maxSpeed;
      }
      
      // Scroll Right
      if (mouseX > (windowWidth - threshold)) {
        const intensity = Math.pow((mouseX - (windowWidth - threshold)) / threshold, 2);
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
    const duration = 3500;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 8,
        angle: 60,
        spread: 70,
        origin: { x: 0.1, y: 0.8 },
        colors: THEMES.find(t => t.id === themeId) ? [THEMES.find(t => t.id === themeId)!.color, '#ffffff', '#ffd700'] : undefined,
        scalar: 1.2
      });
      confetti({
        particleCount: 8,
        angle: 120,
        spread: 70,
        origin: { x: 0.9, y: 0.8 },
        colors: THEMES.find(t => t.id === themeId) ? [THEMES.find(t => t.id === themeId)!.color, '#ffffff', '#ffd700'] : undefined,
        scalar: 1.2
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
    }, 3000);
  };

  if (!isOpen && !selectedTheme) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.5, filter: "blur(10px)" }} // Fade-through animation
          transition={{ duration: 1.5, ease: "easeInOut" }}
          className="fixed inset-0 z-[100] bg-zinc-50 flex flex-col overflow-hidden cursor-none"
          onMouseMove={handleMouseMove}
        >
          {/* Custom Cursor */}
          <motion.div 
            className="pointer-events-none fixed z-50 flex items-center justify-center mix-blend-difference"
            style={{ left: mouseX, top: '50%' }}
            animate={{ 
              scale: isHoveringItem ? 2.5 : 1,
              opacity: selectedTheme ? 0 : 1
            }}
            transition={{ type: "spring", stiffness: 500, damping: 28 }}
          >
             <div className="w-4 h-4 bg-white rounded-full shadow-sm" />
             {isHoveringItem && (
               <motion.span 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute text-[6px] font-bold text-black uppercase tracking-widest pt-[1px]"
               >
                 {t("select")}
               </motion.span>
             )}
          </motion.div>

          <div className="flex-1 relative flex flex-col justify-center">
            {/* Header Text */}
            <div className="text-center mb-16 space-y-4 pointer-events-none select-none z-10 px-4">
               <motion.h2 
                 initial={{ opacity: 0, y: -20 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0 }}
                 transition={{ delay: 0.2 }}
                 className="text-xl md:text-2xl font-serif text-zinc-400 italic"
               >
                 {selectedTheme ? t("your_companion") : t("choose_companion")}
               </motion.h2>
               <motion.div
                  className="relative h-24 md:h-32 flex items-center justify-center"
               >
                 {/* Year Transition */}
                 <AnimatePresence mode="wait">
                   {!selectedTheme ? (
                      <motion.h1 
                        key="title"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="text-6xl md:text-8xl font-bold font-serif tracking-tighter text-zinc-900"
                      >
                        {t("the_journey")}
                      </motion.h1>
                   ) : (
                      <motion.h1 
                        key="year"
                        initial={{ opacity: 0, scale: 0.5, rotateX: -90 }}
                        animate={{ opacity: 1, scale: 1, rotateX: 0 }}
                        exit={{ opacity: 0, scale: 1.5 }}
                        transition={{ type: "spring", bounce: 0.5 }}
                        className="text-7xl md:text-9xl font-bold font-serif tracking-tighter text-primary"
                      >
                        {currentYear}
                      </motion.h1>
                   )}
                 </AnimatePresence>
               </motion.div>
            </div>

            {/* Notebook Carousel */}
            <div 
              ref={scrollContainerRef}
              className="flex items-center gap-12 md:gap-20 px-[50vw] overflow-x-auto no-scrollbar py-20 pb-32"
              style={{ scrollBehavior: 'auto' }}
            >
              {THEMES.map((theme) => (
                <motion.button
                  key={theme.id}
                  onClick={() => handleSelect(theme.id)}
                  onMouseEnter={() => setIsHoveringItem(true)}
                  onMouseLeave={() => setIsHoveringItem(false)}
                  whileHover={{ 
                    scale: 1.05, 
                    rotateY: -8,
                    y: -15,
                    transition: { type: "spring", stiffness: 400, damping: 20 } 
                  }}
                  whileTap={{ scale: 0.98 }}
                  // Book opening animation
                  animate={selectedTheme === theme.id ? {
                      scale: 3,
                      rotateY: -10,
                      x: 0,
                      zIndex: 50,
                      transition: { duration: 1.5, ease: "easeInOut" }
                  } : {}}
                  exit={selectedTheme === theme.id ? {
                     opacity: 0
                  } : { opacity: 0 }}
                  className={cn(
                    "relative flex-shrink-0 w-64 h-96 md:w-72 md:h-[420px] rounded-r-xl shadow-xl transform-style-3d group perspective-1000 transition-all duration-500",
                    selectedTheme === theme.id ? "ring-0 z-20 cursor-default" : "cursor-none"
                  )}
                  style={{ backgroundColor: theme.color }}
                >
                    {/* Realistic Book Shadow Layer */}
                    <div className="absolute top-2 left-2 w-full h-full bg-black/10 rounded-r-xl blur-md -z-10 transition-transform duration-500 group-hover:translate-x-4 group-hover:translate-y-4" />

                    {/* Spine */}
                    <div className="absolute top-0 left-0 w-6 h-full bg-black/10 mix-blend-multiply rounded-l-sm border-r border-black/5" />
                    
                    {/* Texture Overlay */}
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cardboard-flat.png')] opacity-15 mix-blend-overlay rounded-r-xl" />
                    
                    {/* Lighting Gradient (Subtle sheen) */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-black/5 via-white/5 to-white/10 rounded-r-xl pointer-events-none" />

                    {/* Elastic Band (Vertical) */}
                    <div className="absolute top-0 right-6 w-3 h-full bg-black/20 shadow-sm mix-blend-multiply opacity-80" />

                    {/* Minimalist Label (Muji Style Sticker) */}
                    <div className="absolute top-12 left-0 w-full flex justify-center opacity-90">
                        <div className="w-24 h-16 bg-[#f4f4f0] shadow-sm flex flex-col items-center justify-center gap-1 border border-zinc-200/50">
                            <span className="font-serif text-xs text-zinc-500 tracking-widest uppercase">{t("diary")}</span>
                            <div className="w-8 h-[1px] bg-zinc-300" />
                            <span className="font-serif text-lg font-bold text-zinc-800">{theme.name}</span>
                        </div>
                    </div>

                    {/* Selection Checkmark Overlay */}
                    <AnimatePresence>
                      {selectedTheme === theme.id && (
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="absolute inset-0 z-30 flex items-center justify-center bg-black/10 backdrop-blur-[1px] rounded-r-xl"
                        >
                           <motion.div 
                             initial={{ scale: 0, rotate: -45 }}
                             animate={{ scale: 1, rotate: 0 }}
                             exit={{ scale: 0 }}
                             transition={{ type: "spring" }}
                             className="bg-white text-primary rounded-full p-4 shadow-2xl"
                           >
                              <div className="font-bold text-xl">{t("selected")}</div>
                           </motion.div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                </motion.button>
              ))}
            </div>
          </div>
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 1 }}
            className="h-24 flex items-center justify-center text-zinc-400 text-xs font-medium tracking-[0.2em] uppercase pointer-events-none pb-8"
          >
             {selectedTheme ? t("preparing_space") : t("explore_cursor")}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
