"use client";

import NextLink from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, type ComponentProps } from "react";
import { buildHref, type HrefSearch } from "@/lib/href";

type NavigateOptions = {
  to: string;
  params?: Record<string, string>;
  search?: HrefSearch;
  replace?: boolean;
};

export function Link({
  to,
  params,
  search,
  ...props
}: Omit<ComponentProps<typeof NextLink>, "href"> & {
  to: string;
  params?: Record<string, string>;
  search?: HrefSearch;
}) {
  return <NextLink href={buildHref(to, params, search)} {...props} />;
}

export function useNavigate() {
  const router = useRouter();
  return useCallback(
    ({ to, params, search, replace }: NavigateOptions) => {
      const href = buildHref(to, params, search);
      if (replace) router.replace(href);
      else router.push(href);
    },
    [router],
  );
}

export function useLocation() {
  return { pathname: usePathname() };
}

export function useSearch(_options?: { strict?: boolean }) {
  const params = useSearchParams();
  return {
    lista: params.get("lista") ?? undefined,
    tag: params.get("tag") ?? undefined,
    aba: params.get("aba") ?? undefined,
  };
}
