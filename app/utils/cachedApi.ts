import {getRooms, getRoom, getScheduleByRoom, getReports, Room, Schedule, Report, createReport} from '../api/api';
import { getCache, setCache, CACHE_KEYS } from '../utils/cache';
import { isConnected } from '../utils/network';

export async function getCachedRooms(): Promise<Room[]> {
    const online = await isConnected();

    if (online) {
        try {
            const rooms = await getRooms();
            await setCache(CACHE_KEYS.ROOMS, rooms);
            return rooms;
        } catch (error) {
            console.error('Error fetching rooms:', error);

        }
    }

    const cached = await getCache<Room[]>(CACHE_KEYS.ROOMS, true);
    if (cached) return cached;

    throw new Error('No room data available. Please connect to the internet.');
}

export async function getCachedRoom(id: string): Promise<Room> {
    const online = await isConnected();

    if (online) {
        try {
            const room = await getRoom(id);
            await setCache(CACHE_KEYS.ROOM(id), room);
            return room;
        } catch (error) {
            console.error(`Error fetching room ${id}:`, error);
        }
    }

    const cached = await getCache<Room>(CACHE_KEYS.ROOM(id), true);
    if (cached) return cached;

    throw new Error(`No data available for room ${id}. Please connect to the internet.`);
}

export async function getCachedScheduleByRoom(roomId: string): Promise<Schedule[]> {
    const online = await isConnected();

    if (online) {
        try {
            const schedule = await getScheduleByRoom(roomId);
            await setCache(CACHE_KEYS.SCHEDULE(roomId), schedule);
            return schedule;
        } catch (error) {
            console.error(`Error fetching schedule for room ${roomId}:`, error);
        }
    }

    const cached = await getCache<Schedule[]>(CACHE_KEYS.SCHEDULE(roomId), true);
    if (cached) return cached;

    return [];
}

export async function getCachedReports(): Promise<Report[]> {
    const online = await isConnected();

    if (online) {
        try {
            const reports = await getReports();
            await setCache(CACHE_KEYS.REPORTS, reports);
            return reports;
        } catch (error) {
            console.error('Error fetching reports:', error);
        }
    }

    const cached = await getCache<Report[]>(CACHE_KEYS.REPORTS, true);
    if (cached) return cached;

    return [];
}

export async function submitReport(report: Omit<Report, 'id'>): Promise<Report> {
    const online = await isConnected();

    if (!online) {
        throw new Error('You are offline. Please connect to the internet to submit a report.');
    }

    return createReport(report);
}
