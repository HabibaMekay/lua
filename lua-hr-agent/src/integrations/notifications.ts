export interface Notification {
  employeeEmail: string;
  message: string;
  channel: 'email' | 'whatsapp';
}

export async function sendNotification(
  notification: Notification,
): Promise<{ sent: boolean }> {
  // Mock notification for the take-home prototype.
  console.log('\n📩 NOTIFICATION SENT');
  console.log(`To: ${notification.employeeEmail}`);
  console.log(`Channel: ${notification.channel}`);
  console.log(`Message: ${notification.message}\n`);

  return {
    sent: true,
  };
}