import { useQueryClient } from "@tanstack/react-query";
import {
  useGetCandidates,
  useCastVote as useApiCastVote,
  useGetResults,
  getGetCandidatesQueryKey,
  getGetResultsQueryKey,
  getGetMeQueryKey
} from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";

export function useVoting() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const candidatesQuery = useGetCandidates();
  const resultsQuery = useGetResults({
    query: {
      refetchInterval: 5000 // Poll every 5s for live results
    }
  });

  const castVoteMutation = useApiCastVote({
    mutation: {
      onSuccess: () => {
        // Invalidate relevant queries to update UI
        queryClient.invalidateQueries({ queryKey: getGetCandidatesQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetResultsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() }); // Updates user.hasVoted
        
        toast({ 
          title: "Vote Cast Successfully", 
          description: "Thank you for participating in the democratic process." 
        });
      },
      onError: (err: any) => {
        toast({ 
          title: "Voting Failed", 
          description: err?.error || "An error occurred while casting your vote.", 
          variant: "destructive" 
        });
      }
    }
  });

  return {
    candidates: candidatesQuery.data || [],
    isLoadingCandidates: candidatesQuery.isLoading,
    
    results: resultsQuery.data,
    isLoadingResults: resultsQuery.isLoading,
    
    castVote: castVoteMutation.mutate,
    isVoting: castVoteMutation.isPending
  };
}
