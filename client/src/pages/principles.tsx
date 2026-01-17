import { useEffect, useState } from "react";
import { usePlans } from "@/hooks/use-plans";
import { Layout } from "@/components/layout";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Save } from "lucide-react";

export default function PrinciplesPage() {
  const { principles, loadingPrinciples, updatePrinciples } = usePlans();
  const [content, setContent] = useState("");
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (principles) {
      setContent(principles.content);
    }
  }, [principles]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    setIsDirty(true);
  };

  const handleSave = () => {
    updatePrinciples.mutate(content);
    setIsDirty(false);
  };

  // Auto-save debounce could go here, but manual save is fine for MVP "Seriousness"
  
  if (loadingPrinciples) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-full">
          <Loader2 className="animate-spin text-muted-foreground" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-8">
        <header className="flex items-center justify-between pb-6 border-b border-border">
          <div>
            <h1 className="text-3xl font-serif font-bold text-primary mb-2">Life Principles</h1>
            <p className="text-muted-foreground">The foundation of all your plans. Review often.</p>
          </div>
          <button 
            onClick={handleSave}
            disabled={!isDirty || updatePrinciples.isPending}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-all
              ${isDirty 
                ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm' 
                : 'bg-muted text-muted-foreground cursor-not-allowed'}
            `}
          >
            {updatePrinciples.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isDirty ? 'Save Changes' : 'Saved'}
          </button>
        </header>

        <Card className="min-h-[60vh] p-8 shadow-sm border-border/60 bg-white">
          <Textarea 
            value={content}
            onChange={handleChange}
            className="w-full h-full min-h-[500px] resize-none border-none focus-visible:ring-0 p-0 text-lg leading-relaxed font-serif text-foreground/90 bg-transparent"
            placeholder="# Write your principles here..."
            data-testid="input-principles"
          />
        </Card>
      </div>
    </Layout>
  );
}
