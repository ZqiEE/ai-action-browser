import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { TaskProgress } from "@/components/TaskProgress";

describe("TaskProgress", () => {
  it("lets the user pause and resume a running task", async () => {
    const user = userEvent.setup();
    render(<TaskProgress />);

    await user.click(screen.getByRole("button", { name: "Pause" }));
    expect(screen.getByRole("status")).toHaveTextContent("Paused by you");

    await user.click(screen.getByRole("button", { name: "Resume" }));
    expect(screen.getByRole("status")).toHaveTextContent(/complete/);
  });

  it("can restart a completed demonstration", async () => {
    const user = userEvent.setup();
    render(<TaskProgress initialState="completed" />);

    expect(screen.getByRole("status")).toHaveTextContent("Finished using demo data");
    await user.click(screen.getByRole("button", { name: "Run demo again" }));
    expect(screen.getByRole("status")).toHaveTextContent(/complete/);
  });
});
