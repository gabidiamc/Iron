import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, VolunteerProfile, VolunteerStats, Notification } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  profile: VolunteerProfile | null;
  stats: VolunteerStats | null;
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  login: (token: string, user: User, profile: VolunteerProfile, stats?: VolunteerStats) => void;
  logout: () => void;
  refreshUserData: () => Promise<void>;
  updateLocalProfile: (newProfile: VolunteerProfile) => void;
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<VolunteerProfile | null>(null);
  const [stats, setStats] = useState<VolunteerStats | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchNotifications = useCallback(async () => {
    try {
      const data = await api.getNotifications();
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch {
      // Ignore if unauthenticated
    }
  }, []);

  const refreshUserData = useCallback(async () => {
    const token = localStorage.getItem('volunteer_portal_token');
    if (!token) {
      setUser(null);
      setProfile(null);
      setStats(null);
      setLoading(false);
      return;
    }

    try {
      const data = await api.getMe();
      setUser(data.user);
      setProfile(data.profile);
      if (data.stats) setStats(data.stats);
      await fetchNotifications();
    } catch {
      // Token is stale, expired, or user was deleted
      localStorage.removeItem('volunteer_portal_token');
      setUser(null);
      setProfile(null);
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, [fetchNotifications]);

  useEffect(() => {
    refreshUserData();
  }, [refreshUserData]);

  // Periodic notification polling every 20 seconds
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(() => {
      fetchNotifications();
    }, 20000);
    return () => clearInterval(interval);
  }, [user, fetchNotifications]);

  const login = (token: string, newUser: User, newProfile: VolunteerProfile, newStats?: VolunteerStats) => {
    localStorage.setItem('volunteer_portal_token', token);
    setUser(newUser);
    setProfile(newProfile);
    if (newStats) setStats(newStats);
    fetchNotifications();
  };

  const logout = () => {
    localStorage.removeItem('volunteer_portal_token');
    setUser(null);
    setProfile(null);
    setStats(null);
    setNotifications([]);
    setUnreadCount(0);
  };

  const updateLocalProfile = (newProfile: VolunteerProfile) => {
    setProfile(newProfile);
  };

  const markNotificationRead = async (id: string) => {
    try {
      await api.markNotificationRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking notification read:', err);
    }
  };

  const markAllNotificationsRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all notifications read:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        stats,
        notifications,
        unreadCount,
        loading,
        login,
        logout,
        refreshUserData,
        updateLocalProfile,
        markNotificationRead,
        markAllNotificationsRead,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
  return context;
};
