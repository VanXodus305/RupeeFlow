export function generateQRCode(text) {
  const encodedText = encodeURIComponent(text);
  const qrSize = 800;

  return `https://api.qrserver.com/v1/create-qr-code/?size=${qrSize}x${qrSize}&data=${encodedText}`;
}

export function generateRandomUPI() {
  const randomId = Math.random().toString(36).substring(2, 15).toUpperCase();
  return `UPI_${randomId}`;
}
