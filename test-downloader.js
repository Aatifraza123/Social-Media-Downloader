const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function testDownloader() {
  console.log('🚀 Testing Social Media Downloader...\n');

  // Test 1: Health Check
  console.log('1️⃣ Testing server health...');
  try {
    const healthResponse = await axios.get(`${API_URL}/health`);
    console.log('✅ Server is healthy:', healthResponse.data.message);
    console.log('   Uptime:', healthResponse.data.data.uptime, 'seconds\n');
  } catch (error) {
    console.error('❌ Health check failed:', error.message);
    return;
  }

  // Test 2: Analyze a YouTube URL
  console.log('2️⃣ Testing URL analysis (YouTube)...');
  const testUrl = 'https://www.youtube.com/watch?v=jNQXAC9IVRw';
  
  try {
    const analyzeResponse = await axios.post(`${API_URL}/media/analyze`, {
      url: testUrl
    });
    
    console.log('✅ URL analyzed successfully!');
    console.log('   Platform:', analyzeResponse.data.data.platform);
    console.log('   Title:', analyzeResponse.data.data.title);
    console.log('   Duration:', analyzeResponse.data.data.duration);
    console.log('   Available formats:', analyzeResponse.data.data.formats?.length || 0);
    console.log('   Available qualities:', analyzeResponse.data.data.qualities?.length || 0);
    console.log('\n');
    
    // Test 3: Initiate a download
    console.log('3️⃣ Testing download initiation...');
    const downloadResponse = await axios.post(`${API_URL}/media/download`, {
      url: testUrl,
      platform: analyzeResponse.data.data.platform,
      format: 'video',
      quality: 'best'
    });
    
    console.log('✅ Download initiated successfully!');
    console.log('   Download ID:', downloadResponse.data.data.downloadId);
    console.log('   Status:', downloadResponse.data.data.status);
    console.log('   Progress:', downloadResponse.data.data.progress, '%');
    
    const downloadId = downloadResponse.data.data.downloadId;
    
    // Test 4: Check download progress
    console.log('\n4️⃣ Checking download progress...');
    
    let attempts = 0;
    const maxAttempts = 10;
    
    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
      
      try {
        const progressResponse = await axios.get(`${API_URL}/download/${downloadId}/progress`);
        const progress = progressResponse.data.data.progress;
        const status = progressResponse.data.data.status;
        
        console.log(`   Progress: ${progress}% - Status: ${status}`);
        
        if (status === 'completed') {
          console.log('✅ Download completed successfully!\n');
          break;
        } else if (status === 'failed') {
          console.log('❌ Download failed!\n');
          break;
        }
      } catch (error) {
        console.log('   Checking progress...', error.message);
      }
      
      attempts++;
    }
    
    if (attempts >= maxAttempts) {
      console.log('⏱️ Download still in progress after monitoring period\n');
    }
    
    console.log('✨ All tests completed!\n');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data?.message || error.message);
    if (error.response?.data) {
      console.error('   Details:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

// Run the tests
testDownloader().catch(console.error);
