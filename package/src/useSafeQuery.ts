import { useState, useEffect } from 'react';

import {
  useQuery,
  useApolloClient,
  QueryHookOptions, // eslint-disable-line
} from '@apollo/react-hooks';

/**
 * Hook that works just like useQuery, but adapts onCompleted and onError to be fired whenever.
 * It always makes error and data available.
 * @param {Query to be executed.} query
 * @param {Query options.} options
 */
function useSafeQuery(
  query: any,
  options: QueryHookOptions<any, Record<string, any>> | undefined,
) {
  const apolloClient = useApolloClient();

  if (!apolloClient) {
    throw new Error('You need to declare your <SafeQueryApolloProviderProps /> and pass down your Apollo Client to use this.');
  }

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<any>(undefined);
  const [data, setData] = useState<any>(undefined);

  const queryPayload = useQuery<any, Record<string, any>>(query, {
    ...options,

    // Inject Apollo Client from Context API
    client: apolloClient,

    // Include both "errors" and "data" in query response
    errorPolicy: 'all',

    // Skip so we can control query execution via refetch
    skip: true,
  });

  const handleRefetch = () => new Promise((resolve, reject) => {
    setLoading(true);

    queryPayload.refetch()
      .then((result: any) => {
        const newError = result?.errors;
        const newData = result?.data;

        setError(newError);
        setData(newData);

        setLoading(false);

        if (options?.onCompleted) {
          options.onCompleted(newData);
        }

        if (options?.onError && newError) {
          options.onError(newError);
        }

        resolve(result);
      })
      .catch((queryError: any) => {
        reject(queryError);
      });
  });

  // Run the query manually when component mounts
  useEffect(() => {
    if (options?.skip) {
      return;
    }

    handleRefetch();
  }, []);

  const payload = {
    ...queryPayload,
    refetch: handleRefetch,
    loading,
    error,
    data,
  };

  return payload;
}

export default useSafeQuery;
