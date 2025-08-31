/**
 * POAP (Proof of Attendance Protocol) API Integration
 * https://documentation.poap.tech/reference/getactionsscan-5
 */

import { useState, useEffect } from 'react';

export interface PoapToken {
  event: {
    id: number;
    fancy_id: string;
    name: string;
    event_url: string;
    image_url: string;
    country: string;
    city: string;
    description: string;
    year: number;
    start_date: string;
    end_date: string;
    expiry_date: string;
    created_date: string;
  };
  tokenId: string;
  owner: string;
  chain: string;
  created: string;
}

export interface PoapStats {
  totalPoaps: number;
  uniqueEvents: number;
  countries: string[];
  years: number[];
  recentPoaps: PoapToken[];
}

class PoapService {
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_POAP_API_URL || 'https://api.poap.tech';
    this.apiKey = process.env.NEXT_PUBLIC_POAP_API_KEY || '';
  }

  private async makeRequest(endpoint: string): Promise<any> {
    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    };

    // Add API key if available
    if (this.apiKey) {
      headers['X-API-Key'] = this.apiKey;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
      }, 10000); // 10 second timeout
      
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        headers,
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 404) {
          // Return empty array for addresses with no POAPs
          return [];
        }
        if (response.status === 429) {
          // Rate limited - wait and retry once
          await new Promise(resolve => setTimeout(resolve, 1000));
          const retryResponse = await fetch(`${this.baseUrl}${endpoint}`, { headers });
          if (retryResponse.ok) {
            return retryResponse.json();
          }
        }
        throw new Error(`POAP API error (${response.status}): ${response.statusText}`);
      }

      return response.json();
    } catch (error: any) {
      if (error.name === 'AbortError') {
        // Request was aborted due to timeout
        console.warn('⏱️ POAP API request timed out, returning empty result');
        return [];
      }
      if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        // Network error - likely DNS or connection issue
        console.warn('🌐 POAP API unavailable, returning empty result');
        return [];
      }
      console.error('POAP API error:', error);
      return [];
    }
  }

  /**
   * Get all POAPs for a wallet address
   */
  async getPoapsByAddress(address: string): Promise<PoapToken[]> {
    try {
      const poaps = await this.makeRequest(`/actions/scan/${address.toLowerCase()}`);
      return Array.isArray(poaps) ? poaps : [];
    } catch (error) {
      console.error('Error fetching POAPs:', error);
      return [];
    }
  }

  /**
   * Get POAP statistics for a wallet address
   */
  async getPoapStats(address: string): Promise<PoapStats> {
    const poaps = await this.getPoapsByAddress(address);
    
    const stats: PoapStats = {
      totalPoaps: poaps.length,
      uniqueEvents: new Set(poaps.map(p => p.event.id)).size,
      countries: [...new Set(poaps.map(p => p.event.country).filter(Boolean))],
      years: [...new Set(poaps.map(p => p.event.year).filter(Boolean))].sort((a, b) => b - a),
      recentPoaps: poaps
        .sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime())
        .slice(0, 5)
    };

    return stats;
  }

  /**
   * Get optimized image URL for POAP
   * Available sizes: xsmall (64x64), small (128x128), medium (256x256), large (512x512), xlarge (1024x1024)
   */
  static getOptimizedImageUrl(originalUrl: string, size: 'xsmall' | 'small' | 'medium' | 'large' | 'xlarge' = 'small'): string {
    if (!originalUrl) return '';
    
    // Add size parameter to optimize image loading
    const separator = originalUrl.includes('?') ? '&' : '?';
    return `${originalUrl}${separator}size=${size}`;
  }

  /**
   * Format POAP count for display (e.g., 119 -> "100+")
   */
  static formatPoapCount(count: number): string {
    if (count >= 100) {
      return '100+';
    }
    return count.toString();
  }

  /**
   * Check if address has POAPs from specific event
   */
  async hasEventPoap(address: string, eventId: number): Promise<boolean> {
    const poaps = await this.getPoapsByAddress(address);
    return poaps.some(poap => poap.event.id === eventId);
  }

  /**
   * Get POAPs from specific year
   */
  async getPoapsByYear(address: string, year: number): Promise<PoapToken[]> {
    const poaps = await this.getPoapsByAddress(address);
    return poaps.filter(poap => poap.event.year === year);
  }

  /**
   * Get POAPs from specific city/country
   */
  async getPoapsByLocation(address: string, city?: string, country?: string): Promise<PoapToken[]> {
    const poaps = await this.getPoapsByAddress(address);
    return poaps.filter(poap => {
      if (city && poap.event.city?.toLowerCase() === city.toLowerCase()) return true;
      if (country && poap.event.country?.toLowerCase() === country.toLowerCase()) return true;
      return false;
    });
  }
}

// Singleton instance
export const poapService = new PoapService();

// Hook for React components
export function usePoaps(address?: string) {
  const [poaps, setPoaps] = useState<PoapToken[]>([]);
  const [stats, setStats] = useState<PoapStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!address) {
      setPoaps([]);
      setStats(null);
      return;
    }

    setLoading(true);
    setError(null);

    Promise.all([
      poapService.getPoapsByAddress(address),
      poapService.getPoapStats(address)
    ])
      .then(([poapData, statsData]) => {
        setPoaps(poapData);
        setStats(statsData);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [address]);

  return { poaps, stats, loading, error };
}

// Hook for POAP count only (lighter request)
export function usePoapCount(address?: string) {
  const [count, setCount] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!address) {
      setCount(0);
      return;
    }

    setLoading(true);
    setError(null);

    poapService.getPoapsByAddress(address)
      .then((poaps) => setCount(poaps.length))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [address]);

  return { count, loading, error };
}