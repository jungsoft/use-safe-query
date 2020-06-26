# use-safe-query

> Implementation to adapt useQuery to use both errors and data callbacks easily

[![NPM](https://img.shields.io/npm/v/use-safe-query.svg)](https://www.npmjs.com/package/use-safe-query) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

This implements a new hook, `useSafeQuery`, almost identical to `useQuery`, that enables you to work with both `data` and `errors` via query result or callbacks (`onCompleted`, `onError`) easily.

For more information on why this was created, check [this issue](https://github.com/apollographql/react-apollo/issues/3853).

## Install

You can use `yarn` or `npm`. Whatever floats your boat =).


### Yarn

```bash
yarn add use-safe-query
```

### npm

```bash
npm install --save use-safe-query
```

## Problem

Upon using Apollo Client in our projects (latest version, 3.1.3) we noticed an issue: we can't easily access both error and data when a query returns both of these fields.

Currently, we're defining errorPolicy: 'all' in order to store both errors and data, but this way onError is not fired (so we can't have error feedbacks easily) and onCompleted is fired but the payload comes as undefined, even though there is data being returned.

## Workaround

To solve this and use something like onError and onCompleted, we're currently using a workaround where we use refetch to simulate these events, as shown below. The problem is that we need to control the state manually, not to mention that this is not a good solution overall.

```
export default function Component () {
  const [loading, setLoading] = useState(null);
  const [data, setData] = useState(true);

  const { refetch } = useQuery(QUERY, {
    // include both "errors" and "data" in query response
    errorPolicy: "all",

    // skip so we can control query execution via refetch
    skip: true,
  });

  const handleRefetch = () => {
    setLoading(true);

    refetch()
      .then((payload) => {
        if (payload && payload.errors) {
          // show a snackbar notifying the error
          // e.g. notify("error", payload.errors);
        }

        // update state with information
        setData(payload && payload.data);
        setLoading(false);
      });
  };

  // execute the query when the component mounts
  useEffect(handleRefetch, []);

  return ...;
}
```

## Solution

With this package, you can use `useSafeQuery` normally, just like you would use any `useQuery` hook. The only differences are:

- `data` and `errors` will always be available.
- `onCompleted` and `onError` callbacks will be fired, even if the query has errors.

## Usage

Here's an example on how to use `useSafeQuery`.

- First, you'll need to setup your `SafeQueryApolloProvider`:

```
import { SafeQueryApolloProvider } from 'use-safe-query';

export default function App () {
  const client = new ApolloClient(...); // Your Apollo Client

  return (
    <SafeQueryApolloProvider client={client}>
      ... // The rest of your app
    </SafeQueryApolloProvider>
  )
}
```

- Then, you can use `useSafeQuery`:

```
import { useSafeQuery } from 'use-safe-query';

export default function Component () {
  const {
    loading,
    error,
    data,
  } = useSafeQuery(QUERY, {
    onCompleted: (queryData) => console.log(queryData), // onCompleted callback
    onError: (queryError) => console.log(queryError), // onError callback

    // any other option
  });

  if (loading) {
    // show loading
    return null;
  }

  if (error) {
    // do whatever you want with error
    return <p>{error}</p>
  }

  // do whatever you want with data
  return <p>{data}</p>;
}
```

See? Much clearer than the code above! =)

## Contributing

Pull requests are welcome! If you have any feedback, issue or suggestion, feel free to open [a new issue](https://github.com/pedro-lb/use-safe-query/issues/new) so we can talk about it 💬.

## License

MIT © [pedro-lb](https://github.com/pedro-lb)
