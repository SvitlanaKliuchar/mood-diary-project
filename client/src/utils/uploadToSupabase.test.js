import { describe, it, expect, vi, beforeEach } from "vitest";
import { uploadToSupabase } from "./uploadToSupabase";

vi.mock("./supabaseClient.js", () => {
  const mockUpload = vi.fn().mockResolvedValue({ error: null });
  const mockGetPublicUrl = vi.fn().mockReturnValue({
    data: { publicUrl: "https://example.com/file.jpg" },
  });

  return {
    supabase: {
      storage: {
        from: vi.fn().mockReturnValue({
          upload: mockUpload,
          getPublicUrl: mockGetPublicUrl,
        }),
      },
    },
  };
});

describe("uploadToSupabase", () => {
  const mockBlob = new Blob(["test content"], { type: "image/jpeg" });
  const mockPath = "users/123/image.jpg";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("uploads blob to correct bucket and path", async () => {
    const { supabase } = await import("./supabaseClient.js");

    await uploadToSupabase(mockBlob, mockPath);

    expect(supabase.storage.from).toHaveBeenCalledWith("mood-art");
    expect(supabase.storage.from().upload).toHaveBeenCalledWith(
      mockPath,
      mockBlob,
      { upsert: true, contentType: "image/jpeg", cacheControl: "3600" },
    );
  });

  it("returns public URL after successful upload", async () => {
    const result = await uploadToSupabase(mockBlob, mockPath);

    expect(result).toBe("https://example.com/file.jpg");
  });

  it("throws error when upload fails", async () => {
    const { supabase } = await import("./supabaseClient.js");
    supabase.storage.from().upload.mockResolvedValueOnce({
      error: new Error("Storage quota exceeded"),
    });

    await expect(uploadToSupabase(mockBlob, mockPath)).rejects.toThrow();
  });

  it("calls getPublicUrl with correct path", async () => {
    const { supabase } = await import("./supabaseClient.js");

    await uploadToSupabase(mockBlob, mockPath);

    expect(supabase.storage.from().getPublicUrl).toHaveBeenCalledWith(mockPath);
  });

  it("handles different file types correctly", async () => {
    const pngBlob = new Blob(["png data"], { type: "image/png" });
    const { supabase } = await import("./supabaseClient.js");

    await uploadToSupabase(pngBlob, "image.png");

    expect(supabase.storage.from().upload).toHaveBeenCalledWith(
      "image.png",
      pngBlob,
      { upsert: true, contentType: "image/png", cacheControl: "3600" },
    );
  });
});
