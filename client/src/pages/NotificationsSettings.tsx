import { useState, useEffect } from 'react';
import { getNotificationSettings, updateNotificationSettings, subscribeToPush, unsubscribeFromPush, testPushNotification } from '../api/notificationApi';
import { GlassCard } from '../components/ui/GlassCard';
import { Bell, Mail, Clock, Droplets, Utensils, BookOpen, Code, Moon } from 'lucide-react';
import { AchievementToast } from '../components/ui/AchievementToast';
import { useAudioStore } from '../store/useAudioStore';
import { useSettings } from '../contexts/SettingsContext';
import { Volume2, VolumeX, Eye, Minimize2, AudioLines, Sliders } from 'lucide-react';

// Utility to convert VAPID key
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

const PUBLIC_VAPID_KEY = 'BJUI9LR1K5R3THI1TQnUGf1RFAGqCh8rgvErUt2xxnC7gmdHh9YD4BnF4wII4dZeyGwvpsjGYaYcky1uFt7ZPxo';

export const NotificationsSettings = () => {
  const [settings, setSettings] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState<any[]>([]);
  
  const { masterVolume, setMasterVolume, musicVolume, setMusicVolume, effectsVolume, setEffectsVolume, soundEnabled, toggleSound } = useAudioStore();
  const { reducedMotion, setReducedMotion, highContrast, setHighContrast } = useSettings();

  const loadSettings = async () => {
    try {
      const data = await getNotificationSettings();
      setSettings(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadSettings();
  }, []);

  const handleTogglePush = async () => {
    if (!settings) return;
    try {
      if (!settings.push.enabled) {
        // Request Permission
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          // Register service worker if not already
          const registration = await navigator.serviceWorker.register('/sw.js');
          
          // Subscribe to push
          const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(PUBLIC_VAPID_KEY)
          });

          await subscribeToPush(subscription);
          showToast('Push Notifications Enabled');
        } else {
          alert('Notification permission denied by browser.');
          return;
        }
      } else {
        // Unsubscribe
        await unsubscribeFromPush();
        showToast('Push Notifications Disabled');
      }
      await loadSettings();
    } catch (error) {
      console.error('Error toggling push:', error);
      alert('Failed to toggle push notifications.');
    }
  };

  const handleTestPush = async () => {
    try {
      await testPushNotification();
      showToast('Test push sent');
    } catch (error) {
      console.error(error);
      alert('Failed to send test push.');
    }
  };

  const showToast = (title: string) => {
    setToasts([...toasts, {
      id: Math.random().toString(),
      title,
      description: 'System updated',
      icon: '🔔'
    }]);
  };

  const updateNestedSetting = async (category: string, path: string[], value: any) => {
    if (!settings) return;
    
    // Deep clone
    const newSettings = JSON.parse(JSON.stringify(settings));
    
    // Traverse and update
    let current = newSettings[category];
    for (let i = 0; i < path.length - 1; i++) {
      current = current[path[i]];
    }
    current[path[path.length - 1]] = value;

    setSettings(newSettings); // Optimistic UI
    try {
      await updateNotificationSettings(newSettings);
      showToast('Settings Saved');
    } catch (error) {
      console.error(error);
      await loadSettings(); // Revert on fail
    }
  };

  if (loading || !settings) {
    return <div className="animate-pulse text-neonBlue text-center mt-20">Loading Settings...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <AchievementToast toasts={toasts} removeToast={(id) => setToasts(t => t.filter(x => x.id !== id))} />

      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-neonBlue to-white">
          System Configuration
        </h1>
      </div>

      <p className="text-textMuted">Configure Audio, Accessibility, and Push Notifications.</p>
      
      {/* AUDIO ENGINE SETTINGS */}
      <h2 className="text-2xl font-bold mt-10 mb-4 flex items-center gap-2"><AudioLines className="text-neonBlue"/> Audio Engine</h2>
      <GlassCard className="border-white/10 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-bold text-lg flex items-center gap-2">Master Audio {soundEnabled ? <Volume2 size={18} className="text-neonBlue" /> : <VolumeX size={18} className="text-red-500" />}</h3>
            <p className="text-sm text-textMuted">Toggle all sound effects and background music.</p>
          </div>
          <button 
            onClick={toggleSound}
            className={`px-4 py-2 rounded font-bold transition-all ${soundEnabled ? 'bg-neonBlue/20 text-neonBlue border border-neonBlue' : 'bg-white/10 text-textMuted'}`}
          >
            {soundEnabled ? 'ENABLED' : 'MUTED'}
          </button>
        </div>
        
        <div className={`space-y-4 ${!soundEnabled ? 'opacity-50 pointer-events-none' : ''}`}>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Master Volume</span>
              <span className="text-neonBlue">{Math.round(masterVolume * 100)}%</span>
            </div>
            <input type="range" min="0" max="1" step="0.05" value={masterVolume} onChange={(e) => setMasterVolume(Number(e.target.value))} className="w-full accent-neonBlue" />
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Background Music</span>
              <span className="text-purple-400">{Math.round(musicVolume * 100)}%</span>
            </div>
            <input type="range" min="0" max="1" step="0.05" value={musicVolume} onChange={(e) => setMusicVolume(Number(e.target.value))} className="w-full accent-purple-500" />
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Sound Effects</span>
              <span className="text-green-400">{Math.round(effectsVolume * 100)}%</span>
            </div>
            <input type="range" min="0" max="1" step="0.05" value={effectsVolume} onChange={(e) => setEffectsVolume(Number(e.target.value))} className="w-full accent-green-500" />
          </div>
        </div>
      </GlassCard>

      {/* ACCESSIBILITY SETTINGS */}
      <h2 className="text-2xl font-bold mt-10 mb-4 flex items-center gap-2"><Eye className="text-neonBlue"/> Accessibility & Display</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <GlassCard>
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold flex items-center gap-2"><Minimize2 size={18} className="text-blue-400"/> Reduce Motion</h3>
            <input type="checkbox" checked={reducedMotion} onChange={(e) => setReducedMotion(e.target.checked)} className="w-5 h-5 accent-neonBlue" />
          </div>
          <p className="text-xs text-textMuted">Disables particle effects, heavy animations, and 3D transitions.</p>
        </GlassCard>
        
        <GlassCard>
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold flex items-center gap-2"><Sliders size={18} className="text-yellow-400"/> High Contrast</h3>
            <input type="checkbox" checked={highContrast} onChange={(e) => setHighContrast(e.target.checked)} className="w-5 h-5 accent-neonBlue" />
          </div>
          <p className="text-xs text-textMuted">Increases text readability and borders.</p>
        </GlassCard>
      </div>

      <h2 className="text-2xl font-bold mt-10 mb-4 flex items-center gap-2"><Bell className="text-neonBlue"/> Push Notifications</h2>

      {/* MASTER PUSH TOGGLE */}
      <GlassCard className="flex flex-col sm:flex-row justify-between items-center border-neonBlue shadow-[0_0_15px_rgba(0,212,255,0.1)]">
        <div className="flex items-center gap-4 mb-4 sm:mb-0">
          <div className={`p-3 rounded-full ${settings.push.enabled ? 'bg-neonBlue/20 text-neonBlue' : 'bg-white/5 text-textMuted'}`}>
            <Bell size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold">Browser Push Notifications</h2>
            <p className="text-sm text-textMuted">Receive real-time alerts on your device.</p>
          </div>
        </div>
        <div className="flex flex-col gap-2 items-center">
          <button 
            onClick={handleTogglePush}
            className={`px-6 py-2 rounded-lg font-bold transition-all ${settings.push.enabled ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' : 'bg-neonBlue text-black hover:bg-neonBlue/80'}`}
          >
            {settings.push.enabled ? 'Disable Push' : 'Enable Push'}
          </button>
          {settings.push.enabled && (
            <button onClick={handleTestPush} className="text-xs text-textMuted hover:text-white underline">
              Send Test Notification
            </button>
          )}
        </div>
      </GlassCard>

      {/* INDIVIDUAL PUSH SETTINGS */}
      <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${!settings.push.enabled ? 'opacity-50 pointer-events-none' : ''}`}>
        
        {/* Workout */}
        <GlassCard>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold flex items-center gap-2"><Clock size={18} className="text-neonBlue"/> Workout Reminder</h3>
            <input type="checkbox" checked={settings.push.workoutReminder.enabled} 
                   onChange={(e) => updateNestedSetting('push', ['workoutReminder', 'enabled'], e.target.checked)} 
                   className="w-5 h-5 accent-neonBlue" />
          </div>
          <p className="text-xs text-textMuted mb-2">Fires if no workout logged today.</p>
          <input type="time" value={settings.push.workoutReminder.time} 
                 onChange={(e) => updateNestedSetting('push', ['workoutReminder', 'time'], e.target.value)}
                 className="bg-black/50 border border-white/10 rounded px-3 py-1 w-full text-white" />
        </GlassCard>

        {/* Water */}
        <GlassCard>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold flex items-center gap-2"><Droplets size={18} className="text-blue-400"/> Water Reminder</h3>
            <input type="checkbox" checked={settings.push.waterReminder.enabled} 
                   onChange={(e) => updateNestedSetting('push', ['waterReminder', 'enabled'], e.target.checked)} 
                   className="w-5 h-5 accent-neonBlue" />
          </div>
          <p className="text-xs text-textMuted mb-2">Fires every N hours if behind goal.</p>
          <select value={settings.push.waterReminder.intervalHours} 
                  onChange={(e) => updateNestedSetting('push', ['waterReminder', 'intervalHours'], Number(e.target.value))}
                  className="bg-black/50 border border-white/10 rounded px-3 py-1 w-full text-white">
            {[1, 2, 3, 4, 6].map(h => <option key={h} value={h}>Every {h} hours</option>)}
          </select>
        </GlassCard>

        {/* Meals */}
        <GlassCard>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold flex items-center gap-2"><Utensils size={18} className="text-green-400"/> Meal Reminder</h3>
            <input type="checkbox" checked={settings.push.mealReminder.enabled} 
                   onChange={(e) => updateNestedSetting('push', ['mealReminder', 'enabled'], e.target.checked)} 
                   className="w-5 h-5 accent-neonBlue" />
          </div>
          <p className="text-xs text-textMuted mb-2">Fires if meal not logged.</p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span>Breakfast</span>
              <input type="time" value={settings.push.mealReminder.breakfast} 
                     onChange={(e) => updateNestedSetting('push', ['mealReminder', 'breakfast'], e.target.value)}
                     className="bg-black/50 border border-white/10 rounded px-2 py-1 text-white" />
            </div>
            <div className="flex justify-between items-center">
              <span>Lunch</span>
              <input type="time" value={settings.push.mealReminder.lunch} 
                     onChange={(e) => updateNestedSetting('push', ['mealReminder', 'lunch'], e.target.value)}
                     className="bg-black/50 border border-white/10 rounded px-2 py-1 text-white" />
            </div>
            <div className="flex justify-between items-center">
              <span>Dinner</span>
              <input type="time" value={settings.push.mealReminder.dinner} 
                     onChange={(e) => updateNestedSetting('push', ['mealReminder', 'dinner'], e.target.value)}
                     className="bg-black/50 border border-white/10 rounded px-2 py-1 text-white" />
            </div>
          </div>
        </GlassCard>

        {/* Sleep, Study, DSA grouped */}
        <div className="space-y-4">
          <GlassCard>
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-bold flex items-center gap-2"><Moon size={18} className="text-purple-400"/> Sleep Nudge</h3>
              <input type="checkbox" checked={settings.push.sleepReminder.enabled} 
                     onChange={(e) => updateNestedSetting('push', ['sleepReminder', 'enabled'], e.target.checked)} 
                     className="w-5 h-5 accent-neonBlue" />
            </div>
            <input type="time" value={settings.push.sleepReminder.time} 
                   onChange={(e) => updateNestedSetting('push', ['sleepReminder', 'time'], e.target.value)}
                   className="bg-black/50 border border-white/10 rounded px-2 py-1 w-full text-white" />
          </GlassCard>

          <GlassCard>
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-bold flex items-center gap-2"><BookOpen size={18} className="text-yellow-400"/> Study Reminder</h3>
              <input type="checkbox" checked={settings.push.studyReminder.enabled} 
                     onChange={(e) => updateNestedSetting('push', ['studyReminder', 'enabled'], e.target.checked)} 
                     className="w-5 h-5 accent-neonBlue" />
            </div>
            <input type="time" value={settings.push.studyReminder.time} 
                   onChange={(e) => updateNestedSetting('push', ['studyReminder', 'time'], e.target.value)}
                   className="bg-black/50 border border-white/10 rounded px-2 py-1 w-full text-white" />
          </GlassCard>

          <GlassCard>
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-bold flex items-center gap-2"><Code size={18} className="text-pink-400"/> DSA Reminder</h3>
              <input type="checkbox" checked={settings.push.dsaReminder.enabled} 
                     onChange={(e) => updateNestedSetting('push', ['dsaReminder', 'enabled'], e.target.checked)} 
                     className="w-5 h-5 accent-neonBlue" />
            </div>
            <input type="time" value={settings.push.dsaReminder.time} 
                   onChange={(e) => updateNestedSetting('push', ['dsaReminder', 'time'], e.target.value)}
                   className="bg-black/50 border border-white/10 rounded px-2 py-1 w-full text-white" />
          </GlassCard>
        </div>
      </div>

      {/* EMAIL SETTINGS */}
      <h2 className="text-2xl font-bold mt-10 mb-4 flex items-center gap-2"><Mail className="text-neonBlue"/> Email Preferences</h2>
      
      <GlassCard className="border-white/10">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="font-bold text-lg">Weekly Review Email</h3>
            <p className="text-sm text-textMuted">ARIA summarizes your week's progress and suggests focus areas.</p>
          </div>
          <input type="checkbox" checked={settings.email.enabled && settings.email.weeklyReview.enabled} 
                 onChange={(e) => {
                   updateNestedSetting('email', ['enabled'], e.target.checked);
                   updateNestedSetting('email', ['weeklyReview', 'enabled'], e.target.checked);
                 }} 
                 className="w-6 h-6 accent-neonBlue" />
        </div>
        
        <div className={`grid grid-cols-2 gap-4 ${!(settings.email.enabled && settings.email.weeklyReview.enabled) ? 'opacity-50 pointer-events-none' : ''}`}>
          <div>
            <label className="block text-sm text-textMuted mb-1">Day of Week</label>
            <select value={settings.email.weeklyReview.dayOfWeek} 
                    onChange={(e) => updateNestedSetting('email', ['weeklyReview', 'dayOfWeek'], Number(e.target.value))}
                    className="bg-black/50 border border-white/10 rounded px-3 py-2 w-full text-white">
              <option value={0}>Sunday</option>
              <option value={1}>Monday</option>
              <option value={2}>Tuesday</option>
              <option value={3}>Wednesday</option>
              <option value={4}>Thursday</option>
              <option value={5}>Friday</option>
              <option value={6}>Saturday</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-textMuted mb-1">Time</label>
            <input type="time" value={settings.email.weeklyReview.time} 
                   onChange={(e) => updateNestedSetting('email', ['weeklyReview', 'time'], e.target.value)}
                   className="bg-black/50 border border-white/10 rounded px-3 py-2 w-full text-white" />
          </div>
        </div>
      </GlassCard>
    </div>
  );
};
