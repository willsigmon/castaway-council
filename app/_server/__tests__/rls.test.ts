import { describe, it } from "vitest";

// TODO: Set up test database and test RLS policies
describe("RLS Policies", () => {
  it("should restrict DM access to participants only", async () => {
    // TODO: Test that user A can't read DM between B and C
  });

  it("should restrict tribe messages to tribe members", async () => {
    // TODO: Test that non-members can't read tribe chat
  });

  it("should hide votes until revealed", async () => {
    // TODO: Test that votes are private until revealed_at is set
  });
});
