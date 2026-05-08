export async function runLoadTest(url: string, vus: number, duration: number) {
  console.log(`[k6] Running load test against ${url} with ${vus} VUs for ${duration}s`);
  
  // In a real implementation, this would spawn k6 as a child process
  return {
    success: true,
    p95Latency: Math.floor(Math.random() * 300) + 150,
    requestsPerSecond: Math.floor(Math.random() * 100) + 500,
    errorRate: Math.random() * 0.01
  };
}

export function parseK6Output(stdout: string) {
  // Utility to parse k6 output JSON
  try {
    return JSON.parse(stdout);
  } catch (e) {
    console.error("Failed to parse k6 output", e);
    return null;
  }
}
