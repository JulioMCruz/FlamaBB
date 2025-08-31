"use client"

import { useEnsProfile, ensService } from "@/lib/ens"

interface EnsProfileDisplayProps {
  address?: string;
  showAvatar?: boolean;
  showAddress?: boolean;
  maxNameLength?: number;
}

export function EnsProfileDisplay({ 
  address, 
  showAvatar = true, 
  showAddress = false,
  maxNameLength = 20 
}: EnsProfileDisplayProps) {
  const { profile, loading, error } = useEnsProfile(address);

  if (loading) {
    return <div className="animate-pulse">Loading...</div>;
  }

  if (error || !profile) {
    return showAddress && address ? (
      <span className="text-gray-500">
        {ensService.getDisplayName(address, maxNameLength)}
      </span>
    ) : null;
  }

  return (
    <div className="flex items-center space-x-2">
      {showAvatar && profile.avatar && (
        <img 
          src={profile.avatar} 
          alt="ENS Avatar" 
          className="w-8 h-8 rounded-full"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      )}
      <div className="flex flex-col">
        {profile.name && (
          <span className="font-medium">
            {ensService.getDisplayName(profile.name, maxNameLength)}
          </span>
        )}
        {showAddress && (
          <span className="text-sm text-gray-500">
            {ensService.getDisplayName(profile.address, maxNameLength)}
          </span>
        )}
      </div>
    </div>
  );
}