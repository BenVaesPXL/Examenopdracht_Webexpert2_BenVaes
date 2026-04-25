import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { getRoom, getScheduleByRoom, Room, Schedule } from '../api/api';

type RootStackParamList = {
    RoomDetail: { id: string };
    ReportForm: { roomId: string };
};

type RoomDetailRouteProp = RouteProp<RootStackParamList, 'RoomDetail'>;

export default function RoomDetailScreen() {
    const route = useRoute<RoomDetailRouteProp>();
    const navigation = useNavigation<any>();
    const { id } = route.params;

    const [room, setRoom] = useState<Room | null>(null);
    const [schedule, setSchedule] = useState<Schedule[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [roomData, scheduleData] = await Promise.all([
                    getRoom(id),
                    getScheduleByRoom(id)
                ]);
                setRoom(roomData);
                // Sort schedule by day and time
                const dayOrder = ['maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag', 'zondag'];
                const sortedSchedule = scheduleData.sort((a, b) => {
                    const dayDiff = dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day);
                    if (dayDiff !== 0) return dayDiff;
                    return a.start.localeCompare(b.start);
                });
                setSchedule(sortedSchedule);
            } catch (error) {
                console.error('Error fetching room details:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    const handleReportIssue = () => {
        // Navigate to Profile stack -> ReportForm screen
        navigation.navigate('Profile', { 
            screen: 'ReportForm',
            params: { roomId: id }
        });
    };

    if (loading) {
        return (
            <View style={[styles.container, styles.center]}>
                <ActivityIndicator color="#e6c364" size="large" />
            </View>
        );
    }

    if (!room) {
        return (
            <View style={[styles.container, styles.center]}>
                <Text style={styles.errorText}>Room not found</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Header Section */}
                <View style={styles.header}>
                    <Text style={styles.roomCode}>{room.id}</Text>
                    <Text style={styles.roomName}>{room.name}</Text>
                    <View style={styles.tagRow}>
                        <View style={styles.tag}>
                            <Text style={styles.tagText}>FLOOR {room.floor}</Text>
                        </View>
                        <View style={styles.tag}>
                            <Text style={styles.tagText}>{room.capacity} SEATS</Text>
                        </View>
                        <View style={styles.tag}>
                            <Text style={styles.tagText}>{room.type.toUpperCase()}</Text>
                        </View>
                    </View>
                </View>

                {/* Schedule Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>WEEKLY SCHEDULE</Text>
                        <View style={styles.divider} />
                    </View>

                    {schedule.length > 0 ? (
                        <View style={styles.scheduleList}>
                            {schedule.map((item, index) => (
                                <Animated.View 
                                    key={item.id} 
                                    entering={FadeInDown.delay(index * 100).duration(400)}
                                    style={styles.scheduleCard}
                                >
                                    <View style={styles.timeContainer}>
                                        <Text style={styles.dayText}>{item.day}</Text>
                                        <Text style={styles.timeText}>{item.start} - {item.end}</Text>
                                    </View>
                                    <View style={styles.courseContainer}>
                                        <Text style={styles.courseText}>{item.course}</Text>
                                        <Text style={styles.teacherText}>{item.teacher}</Text>
                                    </View>
                                </Animated.View>
                            ))}
                        </View>
                    ) : (
                        <Text style={styles.emptyText}>No classes scheduled for this room.</Text>
                    )}
                </View>

                {/* Report Button */}
                <TouchableOpacity style={styles.reportButton} onPress={handleReportIssue}>
                    <Text style={styles.reportButtonText}>REPORT AN ISSUE</Text>
                </TouchableOpacity>
                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#131313',
    },
    center: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollView: {
        flex: 1,
        paddingHorizontal: 24,
    },
    header: {
        marginTop: 20,
        marginBottom: 32,
        gap: 8,
    },
    roomCode: {
        color: '#e6c364',
        fontSize: 14,
        fontWeight: 'bold',
        letterSpacing: 2,
    },
    roomName: {
        color: '#e5e2e1',
        fontSize: 32,
        fontWeight: 'bold',
        lineHeight: 40,
    },
    tagRow: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 8,
    },
    tag: {
        backgroundColor: '#1c1b1b',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: 'rgba(230, 195, 100, 0.2)',
    },
    tagText: {
        color: '#d0c5b2',
        fontSize: 10,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
    section: {
        gap: 16,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    sectionTitle: {
        color: '#d0c5b2',
        fontSize: 12,
        fontWeight: 'bold',
        letterSpacing: 2.4,
    },
    divider: {
        width: 40,
        height: 1,
        backgroundColor: '#4d4637',
    },
    scheduleList: {
        gap: 12,
    },
    scheduleCard: {
        backgroundColor: '#1c1b1b',
        borderRadius: 2,
        padding: 16,
        flexDirection: 'row',
        gap: 16,
    },
    timeContainer: {
        width: 100,
        gap: 4,
    },
    dayText: {
        color: '#e6c364',
        fontSize: 12,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    timeText: {
        color: '#d0c5b2',
        fontSize: 12,
    },
    courseContainer: {
        flex: 1,
        gap: 4,
    },
    courseText: {
        color: '#e5e2e1',
        fontSize: 16,
        fontWeight: 'bold',
    },
    teacherText: {
        color: '#d0c5b2',
        fontSize: 12,
        opacity: 0.7,
    },
    emptyText: {
        color: '#d0c5b2',
        fontSize: 14,
        fontStyle: 'italic',
        textAlign: 'center',
        marginTop: 20,
    },
    errorText: {
        color: '#f44336',
        fontSize: 16,
    },
    reportButton: {
        backgroundColor: '#2a2a2a',
        marginTop: 40,
        padding: 18,
        borderRadius: 2,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(244, 67, 54, 0.3)',
    },
    reportButtonText: {
        color: '#e5e2e1',
        fontSize: 12,
        fontWeight: 'bold',
        letterSpacing: 1.2,
    },
});