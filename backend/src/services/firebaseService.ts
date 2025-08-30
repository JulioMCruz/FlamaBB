import { getAdminDb } from '@/config/firebase';
import { Experience, User, Pool, Contribution } from '@/types';

export class FirebaseService {
  // user operations
  async createUser(userData: Partial<User>): Promise<User> {
    const userRef = getAdminDb().collection('users').doc();
    const user: User = {
      id: userRef.id,
      walletAddress: userData.walletAddress!,
      username: userData.username,
      reputation: userData.reputation || 0,
      verificationLevel: userData.verificationLevel || 'UNVERIFIED' as any,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    await userRef.set(user);
    return user;
  }

  async getUserByWallet(walletAddress: string): Promise<User | null> {
    const userSnapshot = await getAdminDb()
      .collection('users')
      .where('walletAddress', '==', walletAddress)
      .limit(1)
      .get();
    
    if (userSnapshot.empty) return null;
    
    const userDoc = userSnapshot.docs[0];
    return { id: userDoc.id, ...userDoc.data() } as User;
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<void> {
    await getAdminDb().collection('users').doc(userId).update({
      ...updates,
      updatedAt: new Date()
    });
  }

  // experience operations
  async createExperience(experienceData: Partial<Experience>): Promise<Experience> {
    const experienceRef = getAdminDb().collection('experiences').doc();
    const experience: Experience = {
      id: experienceRef.id,
      title: experienceData.title!,
      description: experienceData.description!,
      hostId: experienceData.hostId!,
      venue: experienceData.venue!,
      venueType: experienceData.venueType!,
      city: experienceData.city!,
      date: experienceData.date!,
      minContribution: experienceData.minContribution!,
      maxParticipants: experienceData.maxParticipants!,
      currentParticipants: experienceData.currentParticipants || 0,
      status: experienceData.status || 'draft' as any,
      includedItems: experienceData.includedItems || [],
      checkinPercentage: experienceData.checkinPercentage || 40,
      midExperiencePercentage: experienceData.midExperiencePercentage || 35,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    await experienceRef.set(experience);
    return experience;
  }

  async getExperiences(limit = 20, offset = 0): Promise<Experience[]> {
    const experiencesSnapshot = await getAdminDb()
      .collection('experiences')
      .where('status', '==', 'published')
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .offset(offset)
      .get();
    
    return experiencesSnapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data()
    })) as Experience[];
  }

  async getExperienceById(experienceId: string): Promise<Experience | null> {
    const experienceDoc = await getAdminDb().collection('experiences').doc(experienceId).get();
    
    if (!experienceDoc.exists) return null;
    
    return { id: experienceDoc.id, ...experienceDoc.data() } as Experience;
  }

  async updateExperience(experienceId: string, updates: Partial<Experience>): Promise<void> {
    await getAdminDb().collection('experiences').doc(experienceId).update({
      ...updates,
      updatedAt: new Date()
    });
  }

  // pool operations
  async createPool(poolData: Partial<Pool>): Promise<Pool> {
    const poolRef = getAdminDb().collection('pools').doc();
    const pool: Pool = {
      id: poolRef.id,
      experienceId: poolData.experienceId!,
      totalAmount: poolData.totalAmount || 0,
      targetAmount: poolData.targetAmount!,
      contributions: poolData.contributions || [],
      status: poolData.status || 'open' as any,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    await poolRef.set(pool);
    return pool;
  }

  async getPoolByExperienceId(experienceId: string): Promise<Pool | null> {
    const poolSnapshot = await getAdminDb()
      .collection('pools')
      .where('experienceId', '==', experienceId)
      .limit(1)
      .get();
    
    if (poolSnapshot.empty) return null;
    
    const poolDoc = poolSnapshot.docs[0];
    return { id: poolDoc.id, ...poolDoc.data() } as Pool;
  }

  async addContribution(poolId: string, contribution: Contribution): Promise<void> {
    const poolRef = getAdminDb().collection('pools').doc(poolId);
    
    await getAdminDb().runTransaction(async (transaction: any) => {
      const poolDoc = await transaction.get(poolRef);
      if (!poolDoc.exists) throw new Error('Pool not found');
      
      const pool = poolDoc.data() as Pool;
      const updatedContributions = [...pool.contributions, contribution];
      const updatedTotalAmount = pool.totalAmount + contribution.amount;
      
      transaction.update(poolRef, {
        contributions: updatedContributions,
        totalAmount: updatedTotalAmount,
        updatedAt: new Date()
      });
    });
  }
}
