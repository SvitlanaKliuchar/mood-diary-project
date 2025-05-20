import { describe, it, expect, vi, beforeEach } from "vitest";
import { createClient } from "@supabase/supabase-js";

// Mock the Supabase client
vi.mock("@supabase/supabase-js", () => {
  const mockSession = { user: { id: "test-user-id" } };

  const mockAuth = {
    getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
    signInAnonymously: vi.fn().mockResolvedValue({ error: null }),
  };

  const mockClient = {
    auth: mockAuth,
    storage: {
      from: vi.fn().mockReturnValue({
        upload: vi.fn(),
        getPublicUrl: vi.fn(),
      }),
    },
  };

  return {
    createClient: vi.fn().mockReturnValue(mockClient),
  };
});

// Import the module AFTER setting up the mock
let supabase;

describe("Supabase Client", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.resetModules();

    // We need to dynamically import the module under test to get a fresh instance
    // with our mocks applied
  });

  it("creates a client with the correct URL and key", async () => {
    const module = await import("../utils/supabaseClient");
    supabase = module.supabase;

    expect(createClient).toHaveBeenCalledWith(
      "https://kaujmrtvurpylnpoudqp.supabase.co",
      expect.any(String),
    );
  });

  it("attempts to create an anonymous session if none exists", async () => {
    const { supabase } = await import("../utils/supabaseClient");

    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(supabase.auth.getSession).toHaveBeenCalled();
    expect(supabase.auth.signInAnonymously).toHaveBeenCalled();
  });

  it("does not create a new session if one already exists", async () => {
    const mockGetSession = vi.fn().mockResolvedValue({
      data: { session: { user: { id: "existing-user" } } },
    });

    createClient.mockReturnValue({
      auth: {
        getSession: mockGetSession,
        signInAnonymously: vi.fn(),
      },
      storage: {
        from: vi.fn().mockReturnValue({
          upload: vi.fn(),
          getPublicUrl: vi.fn(),
        }),
      },
    });

    vi.resetModules();
    const module = await import("../utils/supabaseClient");

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(mockGetSession).toHaveBeenCalled();
    expect(module.supabase).toBeDefined();

    expect(module.supabase.auth.signInAnonymously).not.toHaveBeenCalled();
  });
});
