import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { subscribe } from "../services/db";

/**
 * Run an async service call and keep it fresh when mock data changes.
 * `key` is a string identifying the request; change it to refetch.
 * Data-change refreshes are silent. When the key changes, the previous data stays
 * on screen until the new result arrives: `isLoading` is true only with nothing to show,
 * `isFetching` whenever a request is in flight.
 */
export function useQuery(key, queryFn) {
  const [state, setState] = useState({ status: "loading", data: undefined, error: null });
  const [attempt, setAttempt] = useState(0);
  const fnRef = useRef(queryFn);

  useLayoutEffect(() => {
    fnRef.current = queryFn;
  });

  useEffect(() => {
    let active = true;
    const run = async (silent) => {
      if (!silent) setState((s) => ({ ...s, status: "loading", error: null }));
      try {
        const data = await fnRef.current();
        if (active) setState({ status: "success", data, error: null });
      } catch (error) {
        if (active) setState((s) => ({ ...s, status: "error", error }));
      }
    };
    run(false);
    const unsubscribe = subscribe(() => run(true));
    return () => {
      active = false;
      unsubscribe();
    };
  }, [key, attempt]);

  return {
    ...state,
    isLoading: state.status === "loading" && state.data === undefined,
    isFetching: state.status === "loading",
    isError: state.status === "error",
    refetch: () => setAttempt((n) => n + 1),
  };
}
