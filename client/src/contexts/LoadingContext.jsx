import { createContext, useState } from "react";

export const LoadingContext = createContext();

export const LoadingProvider = ({ children }) => {
  //use a counter so that overlapping async calls are handles gracefully
  const [loadingCount, setLoadingCount] = useState(0);

  const startLoading = () => setLoadingCount((prev) => prev + 1);
  const finishLoading = () =>
    setLoadingCount((prev) => (prev > 0 ? prev - 1 : 0));

  return (
    <LoadingContext.Provider
      value={{ loadingCount, startLoading, finishLoading }}
    >
      {children}
    </LoadingContext.Provider>
  );
};
