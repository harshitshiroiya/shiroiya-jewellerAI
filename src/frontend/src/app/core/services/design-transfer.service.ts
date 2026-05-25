import { Injectable, signal } from '@angular/core';

export interface DesignElement {
  id: string;
  category: 'base' | 'stone' | 'metal' | 'decorative';
  count?: number;
}

export interface DesignConfig {
  jewelleryType: string;
  metalType: string;
  elements: DesignElement[];
  originalPrompt: string;
}

@Injectable({ providedIn: 'root' })
export class DesignTransferService {
  designConfig = signal<DesignConfig | null>(null);

  /**
   * Parse a text prompt into design elements using keyword matching.
   * Returns a DesignConfig with identified base, stone, and metal details.
   */
  parsePrompt(prompt: string): DesignConfig {
    const lower = prompt.toLowerCase();

    // Determine jewellery type and base element
    const jewelleryType = this.detectJewelleryType(lower);
    const baseId = this.getBaseElementId(jewelleryType);

    // Determine metal type
    const metalType = this.detectMetalType(lower);

    // Determine stone type and count
    const stones = this.detectStones(lower);

    const elements: DesignElement[] = [];

    // Add base element
    if (baseId) {
      elements.push({ id: baseId, category: 'base', count: 1 });
    }

    // Add stone elements
    for (const stone of stones) {
      elements.push({ id: stone.id, category: 'stone', count: stone.count });
    }

    const config: DesignConfig = {
      jewelleryType,
      metalType,
      elements,
      originalPrompt: prompt
    };

    this.designConfig.set(config);
    return config;
  }

  /**
   * Encode design config to a URL-safe string for query params.
   */
  encodeConfig(config: DesignConfig): string {
    return encodeURIComponent(JSON.stringify(config));
  }

  /**
   * Decode a config string from query params.
   */
  decodeConfig(encoded: string): DesignConfig | null {
    try {
      const decoded = decodeURIComponent(encoded);
      const config = JSON.parse(decoded) as DesignConfig;
      this.designConfig.set(config);
      return config;
    } catch {
      return null;
    }
  }

  /**
   * Clear stored design config.
   */
  clear() {
    this.designConfig.set(null);
  }

  private detectJewelleryType(text: string): string {
    if (text.includes('ring') || text.includes('band')) return 'ring';
    if (text.includes('necklace') || text.includes('chain') || text.includes('pendant')) return 'necklace';
    if (text.includes('bangle') || text.includes('kada')) return 'bangle';
    if (text.includes('earring') || text.includes('ear ring') || text.includes('studs') || text.includes('jhumka')) return 'earring';
    if (text.includes('bracelet')) return 'bracelet';
    return 'ring'; // default
  }

  private getBaseElementId(jewelleryType: string): string {
    const map: Record<string, string> = {
      'ring': 'ring-band',
      'necklace': 'necklace-chain',
      'bangle': 'bangle',
      'earring': 'earring-hook',
      'pendant': 'pendant-bail',
      'bracelet': 'bracelet-link'
    };
    return map[jewelleryType] || 'ring-band';
  }

  private detectMetalType(text: string): string {
    if (text.includes('rose gold')) return 'Rose Gold';
    if (text.includes('white gold')) return 'White Gold';
    if (text.includes('platinum')) return 'Platinum';
    if (text.includes('silver')) return 'Silver';
    if (text.includes('gold')) return 'Gold';
    return 'Gold'; // default
  }

  private detectStones(text: string): { id: string; count: number }[] {
    const stones: { id: string; count: number }[] = [];

    // Detect stone shape
    const shapeMap: Record<string, string> = {
      'round': 'round-stone',
      'princess': 'princess-stone',
      'oval': 'oval-stone',
      'marquise': 'marquise-stone',
      'pear': 'pear-stone',
      'emerald cut': 'emerald-stone',
      'heart': 'heart-stone',
      'cushion': 'cushion-stone'
    };

    // Detect count from text
    const count = this.detectCount(text);

    // Check for specific stone shapes
    let foundShape = false;
    for (const [keyword, id] of Object.entries(shapeMap)) {
      if (text.includes(keyword)) {
        stones.push({ id, count });
        foundShape = true;
        break; // use first match
      }
    }

    // If no specific shape but mentions stones/diamonds/gems, default to round
    if (!foundShape) {
      const stoneKeywords = ['diamond', 'stone', 'gem', 'sapphire', 'ruby', 'emerald', 'topaz', 'amethyst', 'garnet', 'opal', 'pearl', 'crystal'];
      for (const kw of stoneKeywords) {
        if (text.includes(kw)) {
          // For emerald (the gem, not the cut), use round-stone
          stones.push({ id: 'round-stone', count });
          break;
        }
      }
    }

    return stones;
  }

  private detectCount(text: string): number {
    // Check for written numbers
    const numberWords: Record<string, number> = {
      'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5,
      'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10,
      'single': 1, 'double': 2, 'triple': 3
    };

    for (const [word, num] of Object.entries(numberWords)) {
      if (text.includes(word)) return num;
    }

    // Check for digit numbers
    const digitMatch = text.match(/(\d+)\s*(diamond|stone|gem|sapphire|ruby|emerald|round|oval|pear|marquise|princess|heart|cushion)/);
    if (digitMatch) {
      return parseInt(digitMatch[1], 10);
    }

    // Default: if stones are mentioned but no count, assume 1
    return 1;
  }
}
