// test script for experience creation
import fetch from 'node-fetch';

async function testExperienceCreation() {
  console.log('🧪 Testing experience creation...');
  
  // first authenticate to get a token
  const testWallet = '0x1234567890123456789012345678901234567890';
  const testSignature = 'test-signature-for-development';
  const testMessage = `Sign this message to authenticate with FlamaBB: ${testWallet}`;
  
  try {
    // authenticate first
    console.log('🔐 Authenticating...');
    const authResponse = await fetch('http://localhost:3001/api/auth/wallet', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        walletAddress: testWallet,
        signature: testSignature,
        message: testMessage
      }),
    });

    const authData = await authResponse.json();
    
    if (!authData.success) {
      console.log('❌ Authentication failed:', authData.error);
      return;
    }
    
    const token = authData.data.token;
    console.log('✅ Authentication successful!');
    
    // create experience
    console.log('🎪 Creating experience...');
    const experienceData = {
      title: "Test Asado Night",
      description: "Join us for an authentic Argentine asado experience with traditional meats and wine",
      venue: "La Parrilla del Sur",
      venueType: "restaurant",
      city: "Buenos Aires",
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
      minContribution: 0.1,
      maxParticipants: 12,
      includedItems: ["Meat", "Wine", "Side dishes"],
      checkinPercentage: 40,
      midExperiencePercentage: 35
    };
    
    const experienceResponse = await fetch('http://localhost:3001/api/experiences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(experienceData),
    });

    const experienceResult = await experienceResponse.json();
    console.log('📊 Experience creation response:', JSON.stringify(experienceResult, null, 2));
    
    if (experienceResult.success) {
      console.log('✅ Experience created successfully!');
      console.log('🎪 Experience ID:', experienceResult.data.id);
      console.log('👤 Host ID:', experienceResult.data.hostId);
    } else {
      console.log('❌ Experience creation failed:', experienceResult.error);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testExperienceCreation();
