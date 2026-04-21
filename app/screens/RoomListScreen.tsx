import { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import { getRooms } from '../api/api';

export default function RoomListScreen() {
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRooms = async () => {
            try {
                const data = await getRooms();
                setRooms(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchRooms();
    }, []);

    if (loading) {
        return (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <Text>Laden...</Text>
            </View>
        );
    }

    return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            {rooms.map(room => (
                <Text key={room.id}>{room.name}</Text>
            ))}
        </View>
    );
}