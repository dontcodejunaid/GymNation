// WhatsApp Integration Helper for Gymnation
// Configure the destination number via VITE_WHATSAPP_NUMBER (digits only, including country code).

export class WhatsAppConfig {
  static get ActiveNumber() {
    const envNum = import.meta.env.VITE_WHATSAPP_NUMBER;
    if (envNum && envNum.trim()) {
      return envNum.replace(/\D/g, '');
    }
    return '919742041444'; // Gymnation front desk
  }
}

/**
 * Formats a phone string into clean country-coded digits
 * @param {string} phoneStr 
 * @returns {string}
 */
export function formatWhatsAppNumber(phoneStr) {
  if (!phoneStr) return WhatsAppConfig.ActiveNumber;
  const digits = phoneStr.replace(/\D/g, '');
  if (digits.length === 10) {
    return '91' + digits; // Default to India country code (+91) for 10-digit mobile numbers
  }
  return digits || WhatsAppConfig.ActiveNumber;
}

/**
 * Formats booking details into a clean WhatsApp text message and opens direct chat with phone number
 * @param {Object} bookingDetails 
 * @param {string|null} [targetPhone] Optional target phone number override
 */
export function sendWhatsAppBookingAlert(bookingDetails, targetPhone = null) {
  const { id, name, phone, service, date, time, trainer, status } = bookingDetails;

  const destinationNumber = targetPhone 
    ? formatWhatsAppNumber(targetPhone) 
    : WhatsAppConfig.ActiveNumber;

  const textMessage = `🏋️ *NEW GYMNATION BOOKING REQUEST* 🏋️\n\n` +
    `📌 *Booking Ref:* #${id}\n` +
    `👤 *Client Name:* ${name}\n` +
    `📞 *Phone Number:* ${phone}\n` +
    `💪 *Service:* ${service}\n` +
    `📅 *Date:* ${date}\n` +
    `⏰ *Time Slot:* ${time}\n` +
    `${trainer ? `🧘 *Trainer:* ${trainer}\n` : ''}` +
    `⚡ *Status:* ${status || 'Pending'}\n\n` +
    `Please confirm slot availability. Thank you!`;

  const encodedMessage = encodeURIComponent(textMessage);
  // Using api.whatsapp.com/send?phone=... guarantees direct chat opening with recipient
  const whatsappUrl = `https://api.whatsapp.com/send?phone=${destinationNumber}&text=${encodedMessage}`;
  
  if (typeof window !== 'undefined') {
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  }

  return { whatsappUrl, destinationNumber };
}
