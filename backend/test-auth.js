// test script for wallet authentication
import fetch from 'node-fetch';

async function testWalletAuth() {
  console.log('🧪 Testing wallet authentication...');
  
  const testWallet = '0x1234567890123456789012345678901234567890';
  const testSignature = 'test-signature-for-development';
  const testMessage = `Sign this message to authenticate with FlamaBB: ${testWallet}`;
  
  try {
    const response = await fetch('http://localhost:3001/api/auth/wallet', {
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

    const data = await response.json();
    console.log('📊 Response:', JSON.stringify(data, null, 2));
    
    if (data.success) {
      console.log('✅ Authentication successful!');
      console.log('👤 User:', data.data.user.username);
      console.log('🔑 Token:', data.data.token.substring(0, 20) + '...');
    } else {
      console.log('❌ Authentication failed:', data.error);
    }
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testWalletAuth();
