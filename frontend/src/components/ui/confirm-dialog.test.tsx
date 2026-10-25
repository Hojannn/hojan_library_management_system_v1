import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ConfirmDialog } from "./confirm-dialog";

describe("ConfirmDialog", () => {
  it("uses a solid theme-aware surface and responsive readable typography", () => {
    render(<ConfirmDialog open onOpenChange={vi.fn()} title="Delete category?" description="This action cannot be undone." onConfirm={vi.fn()} variant="destructive" />);

    const dialog = screen.getByRole("dialog");
    const title = screen.getByRole("heading", { name: "Delete category?" });
    const description = screen.getByText("This action cannot be undone.");
    const footer = dialog.querySelector("[data-slot=dialog-footer]");

    expect(dialog).toHaveClass("bg-popover", "text-popover-foreground", "sm:max-w-md");
    expect(title).toHaveClass("text-xl", "sm:text-2xl", "text-foreground");
    expect(description).toHaveClass("text-sm", "sm:text-base", "leading-relaxed");
    expect(footer).toHaveClass("bg-muted", "border-border");
    expect(screen.getByRole("button", { name: "Cancel" })).toHaveClass("h-10", "text-sm", "sm:text-base");
    expect(screen.getByRole("button", { name: "Confirm" })).toHaveClass("h-10", "text-sm", "sm:text-base");
  });
});
