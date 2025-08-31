/**
 * ENS (Ethereum Name Service) Integration
 * https://docs.ens.domains/web/resolution
 * https://docs.ens.domains/web/quickstart
 * 
 * Note: ENS resolution always happens on Ethereum mainnet (chainId: 1)
 * even when the user is connected to Base Sepolia testnet
 */

import { useEnsName, useEnsAvatar, useEnsAddress as useWagmiEnsAddress } from 'wagmi';
import { useState, useEffect } from 'react';

export interface EnsProfile {
  name: string | null;
  avatar: string | null;
  address: string;
  resolved: boolean;
}

export interface EnsTextRecord {
  key: string;
  value: string | null;
}

class EnsService {
  /**
   * Check if a string is a valid ENS name
   */
  static isEnsName(name: string): boolean {
    return name.includes('.') && name.endsWith('.eth');
  }

  /**
   * Check if a string is a valid Ethereum address
   */
  static isEthereumAddress(address: string): boolean {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  }

  /**
   * Normalize ENS name (lowercase)
   */
  static normalizeName(name: string): string {
    return name.toLowerCase();
  }

  /**
   * Normalize Ethereum address (lowercase)
   */
  static normalizeAddress(address: string): string {
    return address.toLowerCase();
  }

  /**
   * Get shortened display format for address or ENS name
   */
  static getDisplayName(addressOrEns: string, maxLength = 20): string {
    if (!addressOrEns) return '';
    
    // If it's an ENS name and not too long, show it
    if (this.isEnsName(addressOrEns) && addressOrEns.length <= maxLength) {
      return addressOrEns;
    }
    
    // If it's an address or long ENS name, truncate
    if (addressOrEns.length <= maxLength) {
      return addressOrEns;
    }
    
    return `${addressOrEns.slice(0, 6)}...${addressOrEns.slice(-4)}`;
  }

  /**
   * Extract domain from ENS name (e.g., "nick.eth" -> "eth")
   */
  static getDomain(ensName: string): string {
    const parts = ensName.split('.');
    return parts[parts.length - 1] || '';
  }

  /**
   * Check if ENS name is a subdomain (e.g., "sub.nick.eth")
   */
  static isSubdomain(ensName: string): boolean {
    const parts = ensName.split('.');
    return parts.length > 2;
  }
}

// Export the service
export const ensService = EnsService;

// Hook for comprehensive ENS profile data
export function useEnsProfile(address?: string) {
  const [profile, setProfile] = useState<EnsProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Use wagmi hooks for ENS resolution
  const { 
    data: ensName, 
    isLoading: nameLoading, 
    error: nameError 
  } = useEnsName({ 
    address: address as `0x${string}`, 
    chainId: 1 
  });

  const { 
    data: ensAvatar, 
    isLoading: avatarLoading, 
    error: avatarError 
  } = useEnsAvatar({ 
    name: ensName || undefined, 
    chainId: 1 
  });

  useEffect(() => {
    if (!address) {
      setProfile(null);
      return;
    }

    const isLoading = nameLoading || avatarLoading;
    const hasError = nameError || avatarError;

    setLoading(isLoading);
    setError(hasError ? 'Error resolving ENS data' : null);

    if (!isLoading && !hasError) {
      setProfile({
        name: ensName || null,
        avatar: ensAvatar || null,
        address: address,
        resolved: !!ensName
      });
    }
  }, [address, ensName, ensAvatar, nameLoading, avatarLoading, nameError, avatarError]);

  return { profile, loading, error };
}

// Hook for ENS name only (lighter)
export function useEnsNameOnly(address?: string) {
  const { 
    data: ensName, 
    isLoading, 
    error 
  } = useEnsName({ 
    address: address as `0x${string}`, 
    chainId: 1 
  });

  return { 
    ensName, 
    loading: isLoading, 
    error: error?.message || null 
  };
}

// Hook for reverse ENS lookup (ENS name to address)
export function useEnsAddress(ensName?: string) {
  const { 
    data: address, 
    isLoading, 
    error 
  } = useWagmiEnsAddress({ 
    name: ensName, 
    chainId: 1 
  });

  return { 
    address, 
    loading: isLoading, 
    error: error?.message || null 
  };
}

// Hook for display name (ENS or shortened address)
export function useDisplayName(address?: string) {
  const { ensName, loading } = useEnsNameOnly(address);
  
  const displayName = ensName 
    ? ensName 
    : address 
    ? ensService.getDisplayName(address) 
    : '';

  return { displayName, isEns: !!ensName, loading };
}