import React from 'react';

import { ApolloProvider } from '@apollo/react-hooks';

export interface SafeQueryApolloProviderProps {
  children: any,
  client: any,
}

/**
 * ApolloProvider for useSafeQuery.
 * @param {Apollo Client.} client
 */
function SafeQueryApolloProvider({
  children,
  client,
}: SafeQueryApolloProviderProps) {
  return (
    <ApolloProvider client={client}>
      {children}
    </ApolloProvider>
  );
}

export default SafeQueryApolloProvider;
