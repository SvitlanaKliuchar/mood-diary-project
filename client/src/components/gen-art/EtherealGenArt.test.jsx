import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import EtherealGenArt from './EtherealGenArt';
import { buildArtConfig } from "@/data/gen-art-mapping.js";
import {
  fitCanvasToContainer,
  createFlowFields,
  createLayers,
  createParticles,
} from "../../utils/genArtHelpers";

vi.mock("@/data/gen-art-mapping.js", () => ({
  buildArtConfig: vi.fn().mockImplementation(() => ({
    color: '#FF5733',
    noiseScale: 0.01,
    noiseSpeed: 0.002,
    particleCount: 50,
    particleSize: 2,
    particleSpeed: 20,
    flowInfluence: 0.8
  }))
}));

vi.mock("../../utils/genArtHelpers", () => ({
  fitCanvasToContainer: vi.fn().mockReturnValue(true),
  createFlowFields: vi.fn().mockReturnValue([]),
  createLayers: vi.fn().mockReturnValue([]),
  createParticles: vi.fn().mockReturnValue([])
}));

const originalRAF = global.requestAnimationFrame;
const originalCAF = global.cancelAnimationFrame;
const originalRO = global.ResizeObserver;
const originalGetContext = window.HTMLCanvasElement.prototype.getContext;

const mockCtx = {
  fillStyle: '',
  strokeStyle: '',
  lineWidth: 0,
  globalAlpha: 0,
  fillRect: vi.fn(),
  beginPath: vi.fn(),
  closePath: vi.fn(),
  fill: vi.fn(),
  stroke: vi.fn(),
  arc: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  quadraticCurveTo: vi.fn(),
  save: vi.fn(),
  restore: vi.fn(),
  createRadialGradient: vi.fn(() => ({
    addColorStop: vi.fn()
  }))
};

const mockObserveCalls = [];

beforeEach(() => {
  global.ResizeObserver = vi.fn().mockImplementation(function(callback) {
    this.callback = callback;
    this.observe = vi.fn(element => {
      mockObserveCalls.push(element);
    });
    this.unobserve = vi.fn();
    this.disconnect = vi.fn();
    return this;
  });
  
  global.requestAnimationFrame = vi.fn(cb => 123);
  global.cancelAnimationFrame = vi.fn();
  window.HTMLCanvasElement.prototype.getContext = vi.fn(() => mockCtx);
  vi.clearAllMocks();
  mockObserveCalls.length = 0;
});

afterEach(() => {
  global.requestAnimationFrame = originalRAF;
  global.cancelAnimationFrame = originalCAF;
  global.ResizeObserver = originalRO;
  window.HTMLCanvasElement.prototype.getContext = originalGetContext;
});

describe('EtherealGenArt Component', () => {
  it('renders a canvas element', () => {
    render(<EtherealGenArt moodLogs={[]} />);
    const canvas = document.querySelector('canvas');
    expect(canvas).toBeInTheDocument();
  });
  
  it('initializes art configuration based on moodLogs', () => {
    const moodLogs = [
      { mood: 'happy', date: '2023-05-01T12:00:00Z' },
      { mood: 'sad', date: '2023-05-02T12:00:00Z' }
    ];
    
    buildArtConfig.mockClear();
    render(<EtherealGenArt moodLogs={moodLogs} />);
    expect(buildArtConfig).toHaveBeenCalledWith(moodLogs[0], expect.anything(), expect.anything());
    expect(buildArtConfig).toHaveBeenCalledWith(moodLogs[1], expect.anything(), expect.anything());
  });
  
  it('sets up canvas with correct styles', () => {
    render(<EtherealGenArt moodLogs={[]} />);
    const canvas = document.querySelector('canvas');
    expect(canvas).toBeInTheDocument();
    expect(canvas.style.width).toBe('100%');
    expect(canvas.style.height).toBe('100%');
    expect(canvas.style.borderRadius).toBe('8px');
    expect(canvas.style.boxShadow).toBe('0 4px 20px rgba(0,0,0,0.05)');
  });
  
  it('calls canvas setup functions during initialization', () => {
    render(<EtherealGenArt moodLogs={[]} />);
    expect(fitCanvasToContainer).toHaveBeenCalled();
    expect(createFlowFields).toHaveBeenCalled();
    expect(createLayers).toHaveBeenCalled();
    expect(createParticles).toHaveBeenCalled();
  });
  
  it('starts animation loop on mount', () => {
    render(<EtherealGenArt moodLogs={[]} />);
    expect(global.requestAnimationFrame).toHaveBeenCalled();
  });
  
  it('sets up resize observer', () => {
    render(<EtherealGenArt moodLogs={[]} />);
    expect(global.ResizeObserver).toHaveBeenCalled();
    expect(mockObserveCalls.length).toBeGreaterThan(0);
    const observedElement = mockObserveCalls[0];
    expect(observedElement.contains(document.querySelector('canvas'))).toBe(true);
  });
  
  it('cleans up animation frame on unmount', () => {
    const { unmount } = render(<EtherealGenArt moodLogs={[]} />);
    expect(global.requestAnimationFrame).toHaveBeenCalled();
    unmount();
    expect(global.cancelAnimationFrame).toHaveBeenCalledWith(123);
  });
  
  it('reinitializes when moodLogs change', () => {
    const { rerender } = render(<EtherealGenArt moodLogs={[]} />);
    vi.clearAllMocks();
    rerender(<EtherealGenArt moodLogs={[{ mood: 'excited' }]} />);
    expect(buildArtConfig).toHaveBeenCalledWith(
      expect.objectContaining({ mood: 'excited' }),
      expect.anything(),
      expect.anything()
    );
    expect(createFlowFields).toHaveBeenCalled();
    expect(createLayers).toHaveBeenCalled();
    expect(createParticles).toHaveBeenCalled();
  });
  
  it('does not start animation when isAnimating is false', () => {
    render(<EtherealGenArt moodLogs={[]} />);
    expect(global.requestAnimationFrame).toHaveBeenCalled();
  });
});
