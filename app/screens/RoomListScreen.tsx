import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getRooms, Room } from '../api/api';

export default function RoomListScreen() {
    const navigation = useNavigation<any>();
    const [rooms, setRooms] = useState<Room[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRooms = async () => {
            try {
                const data = await getRooms();
                setRooms(data);
            } catch (error) {
                console.error('Error fetching rooms:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchRooms();
    }, []);

    const handleRoomPress = (roomId: string) => {
        navigation.navigate('RoomDetail', { id: roomId });
    };

    const renderRoomItem = ({ item }: { item: Room }) => (
        <TouchableOpacity 
            style={styles.roomCard} 
            onPress={() => handleRoomPress(item.id)}
        >
            <View style={styles.roomCardContent}>
                <View style={styles.roomInfo}>
                    <Text style={styles.roomCode}>{item.id}</Text>
                    <Text style={styles.roomName}>{item.name}</Text>
                    <Text style={styles.roomDetails}>Floor {item.floor} • {item.capacity} Seats</Text>
                </View>
                <View style={styles.typeBadge}>
                    <Text style={styles.typeText}>{item.type.toUpperCase()}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.center}>
                    <ActivityIndicator color="#e6c364" size="large" />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>All Rooms</Text>
                <View style={styles.divider} />
            </View>
            <FlatList
                data={rooms}
                keyExtractor={(item) => item.id}
                renderItem={renderRoomItem}
                contentContainerStyle={styles.listContainer}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <Text style={styles.emptyText}>No rooms available at the moment.</Text>
                }
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#131313',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        paddingHorizontal: 24,
        marginTop: 20,
        marginBottom: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    title: {
        color: '#e5e2e1',
        fontSize: 24,
        fontWeight: 'bold',
        letterSpacing: -0.5,
    },
    divider: {
        width: 48,
        height: 1,
        backgroundColor: '#4d4637',
    },
    listContainer: {
        paddingHorizontal: 24,
        paddingBottom: 40,
    },
    roomCard: {
        backgroundColor: '#1c1b1b',
        borderRadius: 2,
        padding: 20,
        borderLeftWidth: 3,
        borderLeftColor: '#e6c364',
        marginBottom: 12,
    },
    roomCardContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    roomInfo: {
        gap: 4,
        flex: 1,
    },
    roomCode: {
        color: '#e6c364',
        fontSize: 12,
        fontWeight: 'bold',
        letterSpacing: 1.2,
    },
    roomName: {
        color: '#e5e2e1',
        fontSize: 18,
        fontWeight: 'bold',
    },
    roomDetails: {
        color: '#d0c5b2',
        fontSize: 12,
        opacity: 0.7,
    },
    typeBadge: {
        backgroundColor: 'rgba(230, 195, 100, 0.1)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    typeText: {
        color: '#e6c364',
        fontSize: 10,
        fontWeight: 'bold',
    },
    emptyText: {
        color: '#d0c5b2',
        fontSize: 14,
        fontStyle: 'italic',
        textAlign: 'center',
        marginTop: 40,
    },
});