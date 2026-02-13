
/**
 * Handles outbound clicks to retailer websites.
 * Logs analytics and performs a safe redirect in a new tab.
 */
export const trackAndRedirect = (product: { id: string; name: string; link: string; retailer: string }) => {
  console.group('🔍 Prism Tracker: Outbound Click Detected');
  console.log(`Timestamp: ${new Date().toISOString()}`);
  console.log(`Product ID: ${product.id}`);
  console.log(`Destination: ${product.retailer}`);
  console.log(`Target URL: ${product.link}`);
  console.groupEnd();

  if (!product.link) {
    console.error("Tracker Error: Missing product link");
    alert("Sorry, the link for this product is currently unavailable.");
    return;
  }

  // Ensure the link has a protocol
  let url = product.link.trim();
  if (!/^https?:\/\//i.test(url)) {
    url = `https://${url}`;
  }

  // Use window.open for reliable new tab behavior
  const newWindow = window.open(url, '_blank', 'noopener,noreferrer');
  
  // Fallback if popup blocker catches it (though usually safe in click handlers)
  if (!newWindow) {
    window.location.href = url;
  } else {
    newWindow.opener = null;
  }
};
