import type { PropsWithChildren } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { put } = vi.hoisted(() => ({ put: vi.fn() }));
vi.mock("@/services/api", () => ({
  api: { get: vi.fn(), post: vi.fn(), put },
}));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

import { confirmPickup, rejectBorrow } from "@/features/borrows/api/borrows";
import { useConfirmBorrowPickup, useRejectBorrow } from "./useBorrows";

const response = { data: { borrow: { id: "borrow-1", status: "READY_FOR_PICKUP" } } };

describe("borrow workflow API", () => {
  beforeEach(() => {
    put.mockReset();
    put.mockResolvedValue(response);
  });

  it("sends the rejection reason and pickup endpoint", async () => {
    await rejectBorrow("borrow-1", "Missing ID");
    await confirmPickup("borrow-1");

    expect(put).toHaveBeenNthCalledWith(
      1,
      "/borrows/admin/borrow-1/reject-borrow",
      { reason: "Missing ID" },
    );
    expect(put).toHaveBeenNthCalledWith(2, "/borrows/admin/borrow-1/confirm-pickup");
  });

  const createWrapper = (queryClient: QueryClient) =>
    ({ children }: PropsWithChildren) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

  it("invalidates borrow and book data after rejection", async () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    queryClient.setQueryData(["borrows", "admin"], []);
    queryClient.setQueryData(["books"], []);
    const { result } = renderHook(() => useRejectBorrow(), { wrapper: createWrapper(queryClient) });

    await act(async () => { await result.current.mutateAsync({ borrowId: "borrow-1", reason: "Missing ID" }); });

    await waitFor(() => {
      expect(queryClient.getQueryState(["borrows", "admin"])?.isInvalidated).toBe(true);
      expect(queryClient.getQueryState(["books"])?.isInvalidated).toBe(true);
    });
  });

  it("invalidates borrow and book data after pickup", async () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    queryClient.setQueryData(["borrows", "admin"], []);
    queryClient.setQueryData(["books"], []);
    const { result } = renderHook(() => useConfirmBorrowPickup(), { wrapper: createWrapper(queryClient) });

    await act(async () => { await result.current.mutateAsync("borrow-1"); });

    await waitFor(() => {
      expect(queryClient.getQueryState(["borrows", "admin"])?.isInvalidated).toBe(true);
      expect(queryClient.getQueryState(["books"])?.isInvalidated).toBe(true);
    });
  });
});
