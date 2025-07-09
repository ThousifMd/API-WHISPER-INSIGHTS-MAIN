// Test API endpoint with console output
const apiKey = 'als_z2Ad8pQn0jrWqe2tvr6oxwfSpeGV3L14KEyCnVpSl7M';
const apiUrl = 'http://localhost:8001/proxy/stats/optimized';

console.log('Fetching API data...\n');

fetch(apiUrl, {
  headers: {
    'Authorization': `Bearer ${apiKey}`
  }
})
.then(response => response.json())
.then(data => {
  console.log('=== API RESPONSE ===\n');
  console.log('Summary:');
  console.log(`  Total Requests: ${data.summary.total_requests}`);
  console.log(`  Unique Companies: ${data.summary.unique_companies}`);
  console.log(`  Unique Models: ${data.summary.unique_models}`);
  console.log(`  Total Cost: $${data.summary.total_cost}`);
  console.log(`  Average Latency: ${data.summary.avg_latency}ms\n`);
  
  console.log('Breakdown by Company:');
  data.breakdown.forEach(item => {
    console.log(`\n  Company: ${item.company_name}`);
    console.log(`  - Vendor: ${item.vendor}`);
    console.log(`  - Model: ${item.model}`);
    console.log(`  - Request Count: ${item.request_count}`);
    console.log(`  - Total Cost: $${item.total_cost}`);
    console.log(`  - Avg Cost: $${item.avg_cost}`);
    console.log(`  - Input Tokens: ${item.total_input_tokens}`);
    console.log(`  - Output Tokens: ${item.total_output_tokens}`);
    console.log(`  - Avg Latency: ${item.avg_latency}ms`);
  });
  
  console.log('\nRaw JSON Response:');
  console.log(JSON.stringify(data, null, 2));
})
.catch(error => {
  console.error('Error fetching data:', error);
});