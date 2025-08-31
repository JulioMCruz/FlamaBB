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
    this.baseUrl = 'https://api.talentprotocol.com';
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    if (!this.apiKey) {
      console.warn('⚠️ Talent Protocol API key not configured');
      throw new Error('Talent Protocol API key not configured');
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'X-API-KEY': this.apiKey,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    console.log('🌐 Request URL:', `${this.baseUrl}${endpoint}`);
    console.log('📡 Response status:', response.status);
    console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Unauthorized: Invalid Talent Protocol API key');
      }
      const errorText = await response.text();
      console.error('❌ Error response:', errorText);
      throw new Error(`Talent Protocol API error: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get talent score for a wallet address using multiple API approaches
   */
  async getTalentScore(walletAddress: string): Promise<TalentScore | null> {
    try {
      console.log('🔍 Fetching Talent Protocol data for wallet:', walletAddress);
      console.log('🔑 API Key configured:', !!this.apiKey);
      console.log('🌐 Base URL:', this.baseUrl);
      
      // Early return if no API key is configured
      if (!this.apiKey) {
        console.warn('⚠️ Talent Protocol API key not configured, returning null');
        return null;
      }
      
      // Try multiple approaches based on Postman collection
      
      // Approach 1: Try direct score endpoint (similar to GetScore in Postman)
      try {
        console.log('🔍 Trying direct score endpoint...');
        const scoreResponse = await this.makeRequest(`/score?id=${walletAddress.toLowerCase()}`);
        console.log('📡 Score API Response:', scoreResponse);
        
        if (scoreResponse && scoreResponse.score && typeof scoreResponse.score.points === 'number') {
          return {
            score: Math.round(scoreResponse.score.points),
            credentials: scoreResponse.credentials || []
          };
        }
      } catch (error) {
        console.log('⚠️ Direct score endpoint failed:', error);
      }

      // Approach 2: Try accounts endpoint (similar to GetAccount in Postman)
      try {
        console.log('🔍 Trying accounts endpoint...');
        const accountResponse = await this.makeRequest(`/accounts?id=${walletAddress.toLowerCase()}`);
        console.log('📡 Accounts API Response:', accountResponse);
        
        if (accountResponse) {
          // Handle different possible response structures
          let scoreValue = 0;
          if (accountResponse.score && typeof accountResponse.score.points === 'number') {
            scoreValue = accountResponse.score.points;
          } else if (typeof accountResponse.score === 'number') {
            scoreValue = accountResponse.score;
          } else if (accountResponse.builder_score) {
            scoreValue = accountResponse.builder_score;
          }
          
          if (scoreValue > 0) {
            return {
              score: Math.round(scoreValue),
              credentials: accountResponse.credentials || []
            };
          }
        }
      } catch (error) {
        console.log('⚠️ Accounts endpoint failed:', error);
      }

      // Approach 3: Try search endpoint with wallet identity
      try {
        console.log('🔍 Trying search endpoint with POST...');
        const searchResponse = await this.makeRequest(`/search/advanced/profiles`, {
          method: 'POST',
          body: JSON.stringify({
            query: {
              identity: `ethereum:${walletAddress.toLowerCase()}`
            },
            sort: {
              id: {
                order: "desc"
              }
            },
            page: 1,
            per_page: 1
          })
        });
        
        console.log('📡 Search API Response:', searchResponse);
        
        if (searchResponse && searchResponse.profiles && searchResponse.profiles.length > 0) {
          const profile = searchResponse.profiles[0];
          let scoreValue = 0;
          
          // Handle different score structures
          if (profile.score && typeof profile.score.points === 'number') {
            scoreValue = profile.score.points;
          } else if (typeof profile.score === 'number') {
            scoreValue = profile.score;
          } else if (profile.builder_score) {
            scoreValue = profile.builder_score;
          } else if (profile.talent_score) {
            scoreValue = profile.talent_score;
          }
          
          if (scoreValue > 0) {
            return {
              score: Math.round(scoreValue),
              credentials: profile.credentials || []
            };
          }
        }
      } catch (error) {
        console.log('⚠️ Search endpoint failed:', error);
      }

      // Approach 4: Try socials endpoint
      try {
        console.log('🔍 Trying socials endpoint...');
        const socialResponse = await this.makeRequest(`/socials/id=${walletAddress.toLowerCase()}`);
        console.log('📡 Socials API Response:', socialResponse);
        
        if (socialResponse) {
          let scoreValue = 0;
          
          // Handle different score structures
          if (socialResponse.score && typeof socialResponse.score.points === 'number') {
            scoreValue = socialResponse.score.points;
          } else if (typeof socialResponse.score === 'number') {
            scoreValue = socialResponse.score;
          } else if (socialResponse.builder_score) {
            scoreValue = socialResponse.builder_score;
          }
          
          if (scoreValue > 0) {
            return {
              score: Math.round(scoreValue),
              credentials: socialResponse.credentials || []
            };
          }
        }
      } catch (error) {
        console.log('⚠️ Socials endpoint failed:', error);
      }

      console.log('❌ No valid talent score found through any endpoint');
      return null;
    } catch (error) {
      console.error('❌ Error fetching talent score:', error);
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