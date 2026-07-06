import { fetchWithAuth } from './fetchHelper';

export const getNotificationSettings = () => fetchWithAuth('/api/notifications/settings');
export const updateNotificationSettings = (data: any) => fetchWithAuth('/api/notifications/settings', {
  method: 'PATCH',
  body: JSON.stringify(data)
});
export const subscribeToPush = (subscription: any) => fetchWithAuth('/api/notifications/subscribe', {
  method: 'POST',
  body: JSON.stringify({ subscription })
});
export const unsubscribeFromPush = () => fetchWithAuth('/api/notifications/unsubscribe', {
  method: 'POST'
});
export const testPushNotification = () => fetchWithAuth('/api/notifications/test', {
  method: 'POST'
});
