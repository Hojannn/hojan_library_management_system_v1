import type { PropsWithChildren } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { api } from "@/services/api";
import { useUpdateCategory } from "./useCategories";

vi.mock("@/services/api", () => ({ api: { put: vi.fn() } }));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

describe("category mutations", () => {
  it("refreshes categories and cached book catalogs after a rename", async () => {
    vi.mocked(api.put).mockResolvedValue({ data: { category: { id: "c1", name: "Engineering", book_count: 2 } } });
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const invalidate = vi.spyOn(client, "invalidateQueries");
    const wrapper = ({ children }: PropsWithChildren) => <QueryClientProvider client={client}>{children}</QueryClientProvider>;
    const { result } = renderHook(() => useUpdateCategory(), { wrapper });

    await act(async () => result.current.mutateAsync({ id: "c1", data: { name: "Engineering" } }));

    expect(invalidate).toHaveBeenCalledWith({ queryKey: ["categories"] });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ["books"] });
  });
});
