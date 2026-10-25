import type { PropsWithChildren } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { api } from "@/services/api";
import { toast } from "sonner";
import { useChangePassword } from "./useAuth";

vi.mock("@/services/api", () => ({ api: { put: vi.fn() } }));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

describe("settings mutations", () => {
  it("updates the current user's password and reports success", async () => {
    vi.mocked(api.put).mockResolvedValue({ data: { message: "Password updated successfully" } });
    const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
    const wrapper = ({ children }: PropsWithChildren) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );
    const { result } = renderHook(() => useChangePassword(), { wrapper });
    const payload = {
      current_password: "current-pass",
      new_password: "new-password",
      confirm_password: "new-password",
    };

    await act(async () => result.current.mutateAsync(payload));

    expect(api.put).toHaveBeenCalledWith("/users/me/password", payload);
    expect(toast.success).toHaveBeenCalledWith("Password updated successfully");
  });
});
