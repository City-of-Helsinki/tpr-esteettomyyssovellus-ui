import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "./store";

// custom hook for checking if page is loaded (uses nextjs router events)
// is used to display loading spinner while loading page
export const useLoading = () => {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleStart = (url: string) => {
      var siteUrl = url;
      if (
        siteUrl.substring(0, 3) == "/en" ||
        siteUrl.substring(0, 3) == "/sv"
      ) {
        siteUrl = url.substring(3);
      }
      siteUrl !== router.asPath && setLoading(true);
    };

    const handleComplete = (url: string) => {
      var siteUrl = url;
      if (
        siteUrl.substring(0, 3) == "/en" ||
        siteUrl.substring(0, 3) == "/sv"
      ) {
        siteUrl = url.substring(3);
      }
      siteUrl === router.asPath && setLoading(false);
    };

    router.events.on("routeChangeStart", handleStart);
    router.events.on("routeChangeComplete", handleComplete);
    router.events.on("routeChangeError", handleComplete);

    return () => {
      router.events.off("routeChangeStart", handleStart);
      router.events.off("routeChangeComplete", handleComplete);
      router.events.off("routeChangeError", handleComplete);
    };
  }, []);

  return loading;
};

// use these typed hooks throughout the app instead of regular useDispatch and useSelector
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
