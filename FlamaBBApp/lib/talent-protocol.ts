/**
 * Talent Protocol API Integration
 * https://docs.talentprotocol.com/docs/developers/talent-api
 */

export interface TalentScore {
  score: number;
  rank?: number;
  credentials?: string[];
}

export interface TalentDataPoint {
  credential_slug: string;
  value: any;
  verified: boolean;
  updated_at: string;
}

export interface TalentApiResponse {
  data: TalentDataPoint[];
  meta?: {
    total: number;
    page: number;
    per_page: number;
  };
}

class TalentProtocolService {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_TALENT_PROTOCOL_API_KEY || '';
    this.baseUrl = process.env.NEXT_PUBLIC_TALENT_PROTOCOL_API_URL || 'https://api.talentprotocol.com/api/v2';
  }

  private async makeRequest(endpoint: string): Promise<any> {
    if (!this.apiKey) {
      throw new Error('Talent Protocol API key not configured');
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      headers: {
        'X-API-KEY': this.apiKey,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Unauthorized: Invalid Talent Protocol API key');
      }
      throw new Error(`Talent Protocol API error: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get talent score for a wallet address
   */
  async getTalentScore(walletAddress: string): Promise<TalentScore | null> {
    try {
      const response = await this.makeRequest(`/data_points?wallet=${walletAddress}`);
      
      if (!response?.data || response.data.length === 0) {
        return null;
      }

      // Look for builder score credential
      const builderScore = response.data.find((item: TalentDataPoint) => 
        item.credential_slug === 'builder_score' || 
        item.credential_slug === 'talent_score'
      );

      if (builderScore) {
        return {
          score: Math.round(builderScore.value || 0),
          credentials: response.data.map((item: TalentDataPoint) => item.credential_slug)
        };
      }

      return null;
    } catch (error) {
      console.error('Error fetching talent score:', error);
      return null;
    }
  }

  /**
   * Get all data points for a wallet address
   */
  async getDataPoints(walletAddress: string): Promise<TalentDataPoint[]> {
    try {
      const response = await this.makeRequest(`/data_points?wallet=${walletAddress}`);
      return response?.data || [];
    } catch (error) {
      console.error('Error fetching talent data points:', error);
      return [];
    }
  }

  /**
   * Get available data issuers/credentials
   */
  async getDataIssuersMeta(): Promise<any> {
    try {
      return await this.makeRequest('/data_issuers_meta');
    } catch (error) {
      console.error('Error fetching data issuers meta:', error);
      return null;
    }
  }

  /**
   * Format score for display (e.g., 119 -> "100+")
   */
  static formatScore(score: number): string {
    if (score >= 100) {
      return '100+';
    }
    return score.toString();
  }
}

// Singleton instance
export const talentProtocol = new TalentProtocolService();

// Hook for React components
export function useTalentScore(walletAddress?: string) {
  const [score, setScore] = useState<TalentScore | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!walletAddress) {
      setScore(null);
      return;
    }

    setLoading(true);
    setError(null);

    talentProtocol.getTalentScore(walletAddress)
      .then(setScore)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [walletAddress]);

  return { score, loading, error };
}

// Required imports for the hook
import { useState, useEffect } from 'react';