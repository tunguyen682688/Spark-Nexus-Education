import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAxiosClient } from './axios-client';

// Generic GET hook
export const useApiQueryBasic = <T>(key: string[], endpoint: string) => {
  const axios = getAxiosClient();
  
  return useQuery({
    queryKey: key,
    queryFn: async () => {
      const { data } = await axios.get<T>(endpoint);
      return data;
    },
  });
};

// Generic POST/PUT/DELETE hook
export const useApiMutationBasic = <TData, TVariables>(
  endpoint: string,
  method: 'post' | 'put' | 'delete' = 'post',
  invalidateKeys?: string[][]
) => {
  const axios = getAxiosClient();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (variables: TVariables) => {
      const { data } = await axios[method]<TData>(endpoint, variables);
      return data;
    },
    onSuccess: () => {
      // Invalidate and refetch related queries
      invalidateKeys?.forEach(key => {
        queryClient.invalidateQueries({ queryKey: key });
      });
    },
  });
};
