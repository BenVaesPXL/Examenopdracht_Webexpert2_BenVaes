const BASE_URL = 'http://localhost:3000';

export interface Room {
    id: string;
    name: string;
    floor: number;
    capacity: number;
    type: string;
    building: string;
}

export interface Schedule {
    id: string;
    roomId: string;
    course: string;
    teacher: string;
    start: string;
    end: string;
    day: string;
}

export interface Report {
    id?: string;
    roomId: string;
    userId: string;
    type: string;
    description: string;
    status: string;
    createdAt: string;
}

export interface User {
    id: string;
    name: string;
    email: string;
    password: string;
    role: string;
}

export const getRooms = async (): Promise<Room[]> => {
    const response = await fetch(`${BASE_URL}/rooms`);
    return response.json();
};

export const getRoom = async (id: string): Promise<Room> => {
    const response = await fetch(`${BASE_URL}/rooms/${id}`);
    return response.json();
};

export const getScheduleByRoom = async (roomId: string): Promise<Schedule[]> => {
    const response = await fetch(`${BASE_URL}/schedule?roomId=${roomId}`);
    return response.json();
};

export const getReports = async (): Promise<Report[]> => {
    const response = await fetch(`${BASE_URL}/reports`);
    return response.json();
};

export const createReport = async (report: Omit<Report, 'id'>): Promise<Report> => {
    const response = await fetch(`${BASE_URL}/reports`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(report),
    });
    return response.json();
};

export const getUsers = async (): Promise<User[]> => {
    const response = await fetch(`${BASE_URL}/users`);
    return response.json();
};