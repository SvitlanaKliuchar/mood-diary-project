import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  createFlowFields,
  createLayers,
  createParticles,
  fitCanvasToContainer,
} from "../utils/genArtHelpers";

describe("Generative Art Helpers", () => {
  describe("createFlowFields", () => {
    it("creates flow fields with the correct structure", () => {
      const configs = [
        {
          color: "#ff0000",
          secondaryColor: "#00ff00",
          intensity: 0.5,
          flow: 0.7,
          complexity: 0.3,
        },
      ];

      const width = 800;
      const height = 600;

      const result = createFlowFields(configs, width, height);

      expect(result).toBeInstanceOf(Array);
      expect(result).toHaveLength(1);

      const field = result[0];
      expect(field).toHaveProperty("resolution", 20);
      expect(field).toHaveProperty("grid");
      expect(field).toHaveProperty("color", "#ff0000");
      expect(field).toHaveProperty("secondaryColor", "#00ff00");
      expect(field).toHaveProperty("intensity", 0.5);
      expect(field).toHaveProperty("flow", 0.7);
      expect(field).toHaveProperty("noiseScale");
      expect(field).toHaveProperty("noiseSpeed");
    });
  });

  describe("createLayers", () => {
    it("creates layers with the correct structure", () => {
      const configs = [
        {
          color: "#ff0000",
          secondaryColor: "#00ff00",
          shape: "circle",
        },
      ];

      const width = 800;
      const height = 600;

      const result = createLayers(configs, width, height);

      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe("createParticles", () => {
    it("creates particles with the correct structure", () => {
      const configs = [
        {
          color: "#ff0000",
          secondaryColor: "#00ff00",
          intensity: 0.5,
          flow: 0.5,
        },
      ];

      const width = 800;
      const height = 600;

      const result = createParticles(configs, width, height);

      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe("fitCanvasToContainer", () => {
    beforeEach(() => {
      global.window = {
        devicePixelRatio: 2,
      };
    });

    it("resizes canvas to match parent container width and fixed height", () => {
      const canvas = {
        width: 0,
        height: 0,
        style: {
          width: "",
          height: "",
        },
        parentElement: {
          clientWidth: 800,
        },
        getContext: vi.fn().mockReturnValue({
          resetTransform: vi.fn(),
          scale: vi.fn(),
        }),
      };

      const result = fitCanvasToContainer(canvas, 500);

      expect(result).toBe(true);
    });
  });
});
