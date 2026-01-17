import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { storage } from "@/lib/storage";
import { useAuth } from "./use-auth";
import { Plan, PlanType, Task } from "@/lib/types";

export function usePlans() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Principles
  const { data: principles, isLoading: loadingPrinciples } = useQuery({
    queryKey: ['principles', user?.id],
    queryFn: () => user ? storage.getPrinciples(user.id) : null,
    enabled: !!user
  });

  const updatePrinciples = useMutation({
    mutationFn: (content: string) => {
      if (!user) throw new Error("No user");
      return storage.updatePrinciples(user.id, content);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['principles', user?.id] });
    }
  });

  // Plans
  const getPlan = (date: string, type: PlanType) => useQuery({
    queryKey: ['plan', user?.id, date, type],
    queryFn: () => user ? storage.getOrCreatePlan(user.id, date, type) : null,
    enabled: !!user
  });

  const updatePlan = useMutation({
    mutationFn: ({ planId, updates }: { planId: string, updates: Partial<Plan> }) => {
      if (!user) throw new Error("No user");
      return storage.updatePlan(user.id, planId, updates);
    },
    onSuccess: (_, variables) => {
      // Invalidate specific plan query
      queryClient.invalidateQueries({ queryKey: ['plan'] }); // Invalidate all plans to be safe for inheritance
    }
  });

  return {
    principles,
    loadingPrinciples,
    updatePrinciples,
    getPlan,
    updatePlan
  };
}
