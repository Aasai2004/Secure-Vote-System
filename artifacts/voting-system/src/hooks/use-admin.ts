import { useQueryClient } from "@tanstack/react-query";
import {
  useGetVoters,
  useGetCandidates,
  useAddVoter as useApiAddVoter,
  useDeleteVoter as useApiDeleteVoter,
  useAddCandidate as useApiAddCandidate,
  useDeleteCandidate as useApiDeleteCandidate,
  getGetVotersQueryKey,
  getGetCandidatesQueryKey
} from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";

export function useAdmin() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const votersQuery = useGetVoters();
  const candidatesQuery = useGetCandidates();

  const addVoterMutation = useApiAddVoter({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetVotersQueryKey() });
        toast({ title: "Success", description: "Voter added successfully." });
      },
      onError: (err: any) => {
        toast({ title: "Error", description: err?.error || "Failed to add voter.", variant: "destructive" });
      }
    }
  });

  const deleteVoterMutation = useApiDeleteVoter({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetVotersQueryKey() });
        toast({ title: "Success", description: "Voter deleted." });
      }
    }
  });

  const addCandidateMutation = useApiAddCandidate({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetCandidatesQueryKey() });
        toast({ title: "Success", description: "Candidate added successfully." });
      },
      onError: (err: any) => {
        toast({ title: "Error", description: err?.error || "Failed to add candidate.", variant: "destructive" });
      }
    }
  });

  const deleteCandidateMutation = useApiDeleteCandidate({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetCandidatesQueryKey() });
        toast({ title: "Success", description: "Candidate deleted." });
      }
    }
  });

  return {
    voters: votersQuery.data || [],
    isLoadingVoters: votersQuery.isLoading,
    candidates: candidatesQuery.data || [],
    isLoadingCandidates: candidatesQuery.isLoading,
    
    addVoter: addVoterMutation.mutate,
    isAddingVoter: addVoterMutation.isPending,
    
    deleteVoter: deleteVoterMutation.mutate,
    
    addCandidate: addCandidateMutation.mutate,
    isAddingCandidate: addCandidateMutation.isPending,
    
    deleteCandidate: deleteCandidateMutation.mutate
  };
}
