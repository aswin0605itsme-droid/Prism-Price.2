
/**
 * Simulates the /api/outbound Next.js route handler.
 * In a full Next.js app, this would be a server-side route.
 * Here, we intercept the click, log the analytics event, and perform the navigation.
 */

export const trackAndRedirect = (product: { id: string; name: string; link: string; retailer: string }) => {
  console.group('🔍 Prism Tracker: Outbound Click Detected');
  console.log(`Timestamp: ${new Date().toISOString()}`);
  console.log(`Product ID: ${product.id}`);
  console.log(`Destination: ${product.retailer}`);
  console.log(`Target URL: ${product.link}`);
  console.groupEnd();

  // Simulate latency of an API call
  // In a real app: await fetch('/api/analytics', { method: 'POST', body: ... })
  
  // Use a temporary anchor to force a clean new tab open which mimics a 302 redirect behavior for the user
  const newWindow = window.open(product.link, '_blank', 'noopener,noreferrer');
  if (newWindow) newWindow.opener = null;
};
