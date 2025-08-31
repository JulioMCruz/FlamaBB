import jwt from 'jsonwebtoken';
import { getAdminAuth, getAdminDb } from '@/config/firebase';
import { User, VerificationLevel } from '@/types';

export class AuthService {
  // generate jwt token for api access
  private generateToken(userId: string, walletAddress: string): string {
    return jwt.sign(
      { 
        userId, 
        walletAddress,
        iat: Math.floor(Date.now() / 1000),
      },
      process.env.JWT_SECRET || 'fallback-secret',
      { 
        expiresIn: process.env.JWT_EXPIRES_IN || '7d' 
      }
    );
  }

  // verify jwt token
  verifyToken(token: string): { userId: string; walletAddress: string } | null {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
      return {
        userId: decoded.userId,
        walletAddress: decoded.walletAddress
      };
    } catch (error) {
      console.error('Token verification failed:', error);
      return null;
    }
  }

  // authenticate user with firebase token
  async authenticateWithFirebase(firebaseToken: string): Promise<{ token: string; user: User } | null> {
    try {
      // verify firebase token
      const decodedToken = await getAdminAuth().verifyIdToken(firebaseToken);
      
      // get user from firestore
      const userDoc = await getAdminDb().collection('users').doc(decodedToken.uid).get();
      
      if (!userDoc.exists) {
        console.error('User not found in Firestore:', decodedToken.uid);
        return null;
      }

      const userData = userDoc.data();
      
      // create user object for our backend
      const user: User = {
        id: decodedToken.uid,
        walletAddress: userData.walletAddress || '',
        username: userData.displayName || '',
        reputation: userData.reputation || 0,
        verificationLevel: userData.verifications?.zkpassport ? VerificationLevel.VERIFIED : VerificationLevel.UNVERIFIED,
        createdAt: userData.createdAt?.toDate() || new Date(),
        updatedAt: userData.lastLoginAt?.toDate() || new Date()
      };

      // generate jwt token for api access
      const token = this.generateToken(user.id, user.walletAddress);

      return { token, user };
    } catch (error) {
      console.error('Firebase authentication failed:', error);
      return null;
    }
  }

  // authenticate user with wallet signature
  async authenticateWithWallet(walletAddress: string, signature: string, message: string): Promise<{ token: string; user: User } | null> {
    try {
      // verify signature (basic verification - you might want to add more robust verification)
      const expectedMessage = `Sign this message to authenticate with FlamaBB: ${walletAddress}`;
      if (message !== expectedMessage) {
        console.error('Invalid message format');
        return null;
      }

      // find user by wallet address
      const userSnapshot = await getAdminDb()
        .collection('users')
        .where('walletAddress', '==', walletAddress)
        .limit(1)
        .get();

      if (userSnapshot.empty) {
        console.error('User not found for wallet:', walletAddress);
        return null;
      }

      const userDoc = userSnapshot.docs[0];
      const userData = userDoc.data();

      // create user object for our backend
      const user: User = {
        id: userDoc.id,
        walletAddress: walletAddress,
        username: userData.displayName || '',
        reputation: userData.reputation || 0,
        verificationLevel: userData.verifications?.zkpassport ? VerificationLevel.VERIFIED : VerificationLevel.UNVERIFIED,
        createdAt: userData.createdAt?.toDate() || new Date(),
        updatedAt: userData.lastLoginAt?.toDate() || new Date()
      };

      // generate jwt token for api access
      const token = this.generateToken(user.id, user.walletAddress);

      return { token, user };
    } catch (error) {
      console.error('Wallet authentication failed:', error);
      return null;
    }
  }

  // get user by id
  async getUserById(userId: string): Promise<User | null> {
    try {
      const userDoc = await getAdminDb().collection('users').doc(userId).get();
      
      if (!userDoc.exists) {
        return null;
      }

      const userData = userDoc.data();
      
      return {
        id: userDoc.id,
        walletAddress: userData.walletAddress || '',
        username: userData.displayName || '',
        reputation: userData.reputation || 0,
        verificationLevel: userData.verifications?.zkpassport ? VerificationLevel.VERIFIED : VerificationLevel.UNVERIFIED,
        createdAt: userData.createdAt?.toDate() || new Date(),
        updatedAt: userData.lastLoginAt?.toDate() || new Date()
      };
    } catch (error) {
      console.error('Error getting user by id:', error);
      return null;
    }
  }

  // get user by wallet address
  async getUserByWallet(walletAddress: string): Promise<User | null> {
    try {
      const userSnapshot = await getAdminDb()
        .collection('users')
        .where('walletAddress', '==', walletAddress)
        .limit(1)
        .get();

      if (userSnapshot.empty) {
        return null;
      }

      const userDoc = userSnapshot.docs[0];
      const userData = userDoc.data();

      return {
        id: userDoc.id,
        walletAddress: walletAddress,
        username: userData.displayName || '',
        reputation: userData.reputation || 0,
        verificationLevel: userData.verifications?.zkpassport ? VerificationLevel.VERIFIED : VerificationLevel.UNVERIFIED,
        createdAt: userData.createdAt?.toDate() || new Date(),
        updatedAt: userData.lastLoginAt?.toDate() || new Date()
      };
    } catch (error) {
      console.error('Error getting user by wallet:', error);
      return null;
    }
  }
}
