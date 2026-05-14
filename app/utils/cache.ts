import AsyncStorage from "@react-native-async-storage/async-storage";

const defaultCacheDuration = 5 * 60 * 1000; // 5 minutes

interface cacheEntry<T> {
    data: T;
    timestamp: number;
    ttl: number;
}

export const CACHE_KEYS = {
    ROOMS: 'cache:rooms',
    ROOM: (id: string) => `cache:room:${id}`,
    SCHEDULE: (roomId: string) => `cache:schedule:${roomId}`,
    REPORTS: 'cache:reports',
};

export async function setCache<T>(key: string, data: T, ttl: number = defaultCacheDuration): Promise<void> {
    const entry: cacheEntry<T> = {
        data,
        timestamp: Date.now(),
        ttl,
    };
    await AsyncStorage.setItem(key, JSON.stringify(entry));
}

export async function getCache<T>(key: string,allowStale = false): Promise<T | null> {
    const entryString = await AsyncStorage.getItem(key);
    if (!entryString) return null;

    const entry: cacheEntry<T> = JSON.parse(entryString);
    const isExpired = Date.now() - entry.timestamp > entry.ttl;

    if (!isExpired) {
        return entry.data;
    }

    if (allowStale) {
        return entry.data;
    }

    await AsyncStorage.removeItem(key);
    return null;
}

export async function clearCache(key: string): Promise<void> {
    await AsyncStorage.removeItem(key);
}