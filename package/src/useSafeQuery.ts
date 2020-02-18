import { useState, useEffect } from 'react';

// eslint-disable-next-line no-unused-vars
import { useQuery, QueryHookOptions } from '@apollo/react-hooks';

/**
 * Hook that works just like useQuery, but adapts onCompleted and onError to be fired whenever.
 * It always makes error and data available.
 * @param {Query to be executed.} query
 * @param {Objects to listen for changes.} deps
 * @param {Debounce time.} debounceTime
 */
function useSafeQuery(
  query: any,
  options: QueryHookOptions<any, Record<string, any>> | undefined,
) {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<any>(undefined);
  const [data, setData] = useState<any>(undefined);

  const queryPayload = useQuery<any, Record<string, any>>(query, {
    ...options,

    // Include both "errors" and "data" in query response
    errorPolicy: 'all',

    // Skip so we can control query execution via refetch
    skip: true,
  });

  const handleRefetch = () => {
    setLoading(true);

    queryPayload.refetch()
      .then((result: any) => {
        const newError = result?.errors;
        const newData = result?.data;

        if (options?.onCompleted) {
          options.onCompleted(newData);
        }

        if (options?.onError && newError) {
          options.onError(newError);
        }

        setError(newError);
        setData(newData);

        setLoading(false);
      });
  };

  // Run the query manually when component mounts
  useEffect(() => {
    if (options?.skip) {
      return;
    }

    handleRefetch();
  }, []);

  const payload = {
    ...queryPayload,
    loading,
    error,
    data,
  };

  return payload;
}

export default useSafeQuery;
