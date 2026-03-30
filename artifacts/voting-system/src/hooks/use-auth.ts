import { useQueryClient } from "@tanstack/react-query";
import { 
  useGetMe, 
  useLogin as useApiLogin, 
  useLogout as useApiLogout,
  getGetMeQueryKey
} from "@workspace/api-client-react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

export function useAuth() {
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: user, isLoading, error } = useGetMe({
    query: {
      retry: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
    }
  });

  const loginMutation = useApiLogin({
    mutation: {
      onSuccess: (data) => {
        queryClient.setQueryData(getGetMeQueryKey(), data.voter);
        toast({
          title: "Welcome back",
          description: data.message,
        });
        if (data.voter.isAdmin) {
          setLocation("/admin");
        } else {
          setLocation("/vote");
        }
      },
      onError: (err: any) => {
        toast({
          title: "Authentication Failed",
          description: err?.error || "Invalid Aadhar number or permissions.",
          variant: "destructive",
        });
      }
    }
  });

  const logoutMutation = useApiLogout({
    mutation: {
      onSuccess: () => {
        queryClient.setQueryData(getGetMeQueryKey(), null);
        queryClient.clear();
        setLocation("/");
        toast({
          title: "Logged out",
          description: "You have been successfully logged out.",
        });
      }
    }
  });

  return {
    user,
    isLoading,
    error,
    login: loginMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    logout: logoutMutation.mutate,
    isLoggingOut: logoutMutation.isPending
  };
}
