/**
 * Generates a WhatsApp API link for sending a message to a phone number.
 * @param {string} phone - The phone number (can include country code, spaces, dashes, etc.)
 * @param {string} message - The message text to send
 * @returns {string} The WhatsApp API URL
 */
export function generateWhatsAppLink(phone, message) {
  // Remove all non-digit characters from the phone number
  const cleanPhone = phone.replace(/\D/g, '');
  
  // Basic validation: ensure phone number has at least some digits
  if (!cleanPhone || cleanPhone.length < 8) {
    console.warn('Invalid phone number provided to generateWhatsAppLink');
    return '';
  }
  
  // Encode the message for URL
  const encodedMessage = encodeURIComponent(message);
  
  return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
}
