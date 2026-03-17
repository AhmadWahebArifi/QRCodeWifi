export default async function handler(request) {
  return new Response(JSON.stringify({ 
    message: "API is working",
    timestamp: new Date().toISOString(),
    method: request.method
  }), {
    status: 200,
    headers: { 
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}
