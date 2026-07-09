/**
 * Centralized Haptic Feedback Engine
 * Gracefully falls back if navigator.vibrate is unsupported (e.g. iOS Safari or Desktop).
 */

class HapticEngine {
  private isSupported: boolean;
  private isEnabled: boolean = true; // Can be toggled globally via settings

  constructor() {
    this.isSupported = typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator;
  }

  public setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
  }

  private vibrate(pattern: number | number[]) {
    if (this.isSupported && this.isEnabled) {
      try {
        window.navigator.vibrate(pattern);
      } catch {
        // Ignore errors (e.g. strict browser policies)
      }
    }
  }

  // Common UI Interactions
  public lightTap() { this.vibrate(10); }
  public mediumTap() { this.vibrate(20); }
  public heavyTap() { this.vibrate(40); }

  // Game Events
  public success() { this.vibrate([20, 50, 20]); }
  public error() { this.vibrate([30, 50, 40]); }
  public levelUp() { this.vibrate([40, 50, 40, 50, 80, 50, 200]); }
  public bossWarning() { this.vibrate([100, 100, 100, 100, 100, 100, 300]); }
  public chestOpen() { this.vibrate([30, 100, 50, 100, 80]); }
  public missionComplete() { this.vibrate([20, 60, 30, 60, 50]); }
  public missionFailed() { this.vibrate([50, 100, 80, 100, 150]); }
}

export const haptics = new HapticEngine();
