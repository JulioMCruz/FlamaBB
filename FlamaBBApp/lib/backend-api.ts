// backend api service for communicating with our node.js backend
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

export interface BackendUser {
  id: string;
  walletAddress: string;
  username: string;
  reputation: number;
  verificationLevel: 'unverified' | 'basic' | 'verified' | 'premium';
  createdAt: string;
  updatedAt: string;
}

export interface BackendAuthResponse {
  success: boolean;
  data?: {
    token: string;
    user: BackendUser;
  };
  error?: string;
  message?: string;
}

export interface BackendUserProfile {
  id: string;
  walletAddress: string;
  username: string;
  reputation: number;
  verificationLevel: 'unverified' | 'basic' | 'verified' | 'premium';
  createdAt: string;
  updatedAt: string;
}

// authentication with backend
export const authenticateWithBackend = async (firebaseToken: string): Promise<BackendAuthResponse> => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/auth/firebase`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ firebaseToken }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Backend authentication error:', error);
    return {
      success: false,
      error: 'network error'
    };
  }
};

// authenticate with wallet signature
export const authenticateWithWallet = async (
  walletAddress: string, 
  signature: string, 
  message: string
): Promise<BackendAuthResponse> => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/auth/wallet`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ walletAddress, signature, message }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Wallet authentication error:', error);
    return {
      success: false,
      error: 'network error'
    };
  }
};

// verify jwt token
export const verifyBackendToken = async (token: string): Promise<BackendAuthResponse> => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/auth/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Token verification error:', error);
    return {
      success: false,
      error: 'network error'
    };
  }
};

// get user profile from backend
export const getBackendUserProfile = async (token: string): Promise<BackendUserProfile | null> => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/users/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.success ? data.data.user : null;
  } catch (error) {
    console.error('Error getting backend user profile:', error);
    return null;
  }
};

// update user profile in backend
export const updateBackendUserProfile = async (
  token: string, 
  updates: Partial<BackendUserProfile>
): Promise<boolean> => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/users/profile`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });

    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error('Error updating backend user profile:', error);
    return false;
  }
};

// get public user info by wallet address
export const getPublicUserByWallet = async (walletAddress: string): Promise<BackendUserProfile | null> => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/users/wallet/${walletAddress}`);

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.success ? data.data.user : null;
  } catch (error) {
    console.error('Error getting public user by wallet:', error);
    return null;
  }
};

// test backend connection
export const testBackendConnection = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${BACKEND_URL}/health`);
    const data = await response.json();
    return data.status === 'ok';
  } catch (error) {
    console.error('Backend connection test failed:', error);
    return false;
  }
};
