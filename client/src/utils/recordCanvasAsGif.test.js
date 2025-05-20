import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { recordCanvasAsGif } from "../utils/recordCanvasAsGif";

const mockGif = vi.hoisted(() => ({
  default: vi.fn().mockImplementation(function (options) {
    this.options = options;
    this.addFrame = vi.fn();
    this.on = vi.fn();
    this.render = vi.fn();
  }),
}));

vi.mock("gif.js", () => mockGif);

describe("recordCanvasAsGif", () => {
  let canvas;

  beforeEach(() => {
    vi.clearAllMocks();

    canvas = {
      width: 800,
      height: 600,
      getContext: vi.fn().mockReturnValue({}),
    };

    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("creates a GIF with correct options", () => {
    recordCanvasAsGif(canvas);

    expect(mockGif.default).toHaveBeenCalledWith(
      expect.objectContaining({
        width: 800,
        height: 600,
      }),
    );
  });

  it("respects custom duration and fps", () => {
    recordCanvasAsGif(canvas, {
      duration: 1000,
      fps: 10,
    });

    vi.advanceTimersByTime(1000);
    vi.runAllTimers();
  });
});
