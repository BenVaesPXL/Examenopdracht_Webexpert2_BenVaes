import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { CompositeNavigationProp } from '@react-navigation/native';
import { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getRooms, getScheduleByRoom, getUsers, Room, Schedule, User } from '../api/api';
import { useToast } from '../context/ToastContext';
import { handleApiError } from '../utils/errorHandling';
import LoadingSpinner, { FullScreenSkeleton } from '../components/LoadingSpinner';

type RootTabParamList = {
    Home: undefined;
    Scan: undefined;
    Lokalen: undefined;
    Profile: { screen?: string };
};

type RootDrawerParamList = {
    Main: undefined;
    Settings: undefined;
};

type HomeScreenNavigationProp = CompositeNavigationProp<
    BottomTabNavigationProp<RootTabParamList, 'Home'>,
    DrawerNavigationProp<RootDrawerParamList>
>;


export default function HomeScreen() {
    const navigation = useNavigation<HomeScreenNavigationProp>();
    const toast = useToast();
    const [rooms, setRooms] = useState<Room[]>([]);
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentTime, setCurrentTime] = useState(new Date());

    const openDrawer = () => {
        navigation.openDrawer();
    };

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 60000); // Update every minute

        const fetchData = async () => {
            try {
                const [roomsData, usersData] = await Promise.all([
                    getRooms(),
                    getUsers()
                ]);
                
                const allSchedules = await Promise.all(
                    roomsData.map(room => getScheduleByRoom(room.id))
                );
                const flatSchedules = allSchedules.flat();
                
                setRooms(roomsData);
                setSchedules(flatSchedules);
                setCurrentUser(usersData[0]);
            } catch (error) {
                const errorToast = handleApiError(error);
                toast.showToast(errorToast);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        return () => clearInterval(timer);
    }, []);

    const handleScanQR = () => {
        navigation.navigate('Scan');
    };

    const handleReportIssue = () => {
        navigation.navigate('Profile', { screen: 'ReportForm' });
    };

    const handleRoomsList = () => {
        navigation.navigate('Lokalen');
    };

    const getScheduleStatus = () => {
        const currentDay = ['zondag', 'maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag'][currentTime.getDay()];
        const nowMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
        
        const todaySchedules = schedules
            .filter(s => s.day === currentDay)
            .sort((a, b) => {
                const startA = parseInt(a.start.split(':')[0]) * 60 + parseInt(a.start.split(':')[1]);
                const startB = parseInt(b.start.split(':')[0]) * 60 + parseInt(b.start.split(':')[1]);
                return startA - startB;
            });

        // Find active schedule
        const active = todaySchedules.find(schedule => {
            const start = parseInt(schedule.start.split(':')[0]) * 60 + parseInt(schedule.start.split(':')[1]);
            const end = parseInt(schedule.end.split(':')[0]) * 60 + parseInt(schedule.end.split(':')[1]);
            return nowMinutes >= start && nowMinutes <= end;
        });

        if (active) return { type: 'ACTIVE', schedule: active };

        // Find next upcoming schedule
        const upcoming = todaySchedules.find(schedule => {
            const start = parseInt(schedule.start.split(':')[0]) * 60 + parseInt(schedule.start.split(':')[1]);
            return nowMinutes < start;
        });

        if (upcoming) return { type: 'UPCOMING', schedule: upcoming };

        return { type: 'FREE', schedule: null };
    };

    const getProgress = (schedule: Schedule | null) => {
        if (!schedule) return 0;
        const nowMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
        const start = parseInt(schedule.start.split(':')[0]) * 60 + parseInt(schedule.start.split(':')[1]);
        const end = parseInt(schedule.end.split(':')[0]) * 60 + parseInt(schedule.end.split(':')[1]);
        
        if (nowMinutes < start) return 0;
        if (nowMinutes > end) return 100;
        
        return ((nowMinutes - start) / (end - start)) * 100;
    };

    const getTimeRemaining = (endTime: string) => {
        const end = parseInt(endTime.split(':')[0]) * 60 + parseInt(endTime.split(':')[1]);
        const current = currentTime.getHours() * 60 + currentTime.getMinutes();
        const remaining = end - current;
        
        if (remaining <= 0) return 'FINISHED';
        const hours = Math.floor(remaining / 60);
        const minutes = remaining % 60;
        
        if (hours > 0) return `${hours}H ${minutes}M`;
        return `${minutes}M`;
    };

    const getRoomAvailability = (roomId: string) => {
        const roomSchedule = schedules.filter(s => s.roomId === roomId);
        const currentDay = ['zondag', 'maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag'][currentTime.getDay()];
        const nowMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
        
        const isOccupied = roomSchedule.some(schedule => {
            const start = parseInt(schedule.start.split(':')[0]) * 60 + parseInt(schedule.start.split(':')[1]);
            const end = parseInt(schedule.end.split(':')[0]) * 60 + parseInt(schedule.end.split(':')[1]);
            return schedule.day === currentDay && nowMinutes >= start && nowMinutes <= end;
        });
        
        return isOccupied ? 'Bezet' : 'Vrij';
    };

    if (loading) {
        return <FullScreenSkeleton />;
    }

    const { type, schedule } = getScheduleStatus();
    const currentRoom = schedule ? rooms.find(room => room.id === schedule.roomId) : null;
    const progress = getProgress(schedule);

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.menuButton} onPress={openDrawer}>
                    <Text style={styles.menuIcon}>☰</Text>
                </TouchableOpacity>
                <View style={styles.headerContent}>
                    <View style={styles.profileContainer}>
                        <View style={styles.profilePlaceholder} />
                    </View>
                    <Text style={styles.greeting}>Good Morning, {currentUser?.name || 'Student'}</Text>
                </View>
            </View>
            
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                <View style={styles.mainContent}>
                    {/* Hero Card - Dynamic Activity */}
                    <View style={styles.heroCard}>
                        <View style={styles.heroHeader}>
                            <View style={styles.heroLeft}>
                                <Text style={[styles.activeLabel, type === 'UPCOMING' && { color: '#d0c5b2' }]}>
                                    {type === 'ACTIVE' ? 'Active Now' : type === 'UPCOMING' ? 'Up Next' : 'Schedule'}
                                </Text>
                                <Text style={styles.roomNumber}>{currentRoom?.id || (type === 'FREE' ? 'FREE' : '---')}</Text>
                            </View>
                            <View style={styles.heroRight}>
                                {schedule && (
                                    <>
                                        <Text style={styles.timeRange}>{schedule.start} - {schedule.end}</Text>
                                        <Text style={styles.timeRemaining}>
                                            {type === 'ACTIVE' ? `REMAINING: ${getTimeRemaining(schedule.end)}` : `STARTS IN: ${getTimeRemaining(schedule.start)}`}
                                        </Text>
                                    </>
                                )}
                            </View>
                        </View>
                        <View style={styles.heroDetails}>
                            <View style={styles.heroDetailsContent}>
                                <Text style={styles.courseTitle}>{schedule?.course || (type === 'FREE' ? 'No classes scheduled' : 'No Class Data')}</Text>
                                <Text style={styles.courseSubtitle}>{schedule?.teacher || (type === 'FREE' ? 'Enjoy your free time' : 'Unknown')}</Text>
                            </View>
                            {type !== 'FREE' && (
                                <View style={styles.progressBar}>
                                    <View style={[styles.progressFill, { width: `${progress}%` }]} />
                                </View>
                            )}
                        </View>
                        <View style={styles.heroIconPlaceholder} />
                    </View>

                    {/* Quick Action Grid */}
                    <View style={styles.quickActionGrid}>
                        <TouchableOpacity style={styles.quickActionButton} onPress={handleScanQR}>
                            <View style={styles.quickActionIconPlaceholder} />
                            <Text style={styles.quickActionText}>SCAN QR</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.quickActionButton} onPress={handleReportIssue}>
                            <View style={styles.quickActionIconPlaceholder} />
                            <Text style={styles.quickActionText}>REPORT ISSUE</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.quickActionButton} onPress={handleRoomsList}>
                            <View style={styles.quickActionIconPlaceholder} />
                            <Text style={styles.quickActionText}>ROOMS LIST</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Recently Visited Section */}
                    <View style={styles.recentSection}>
                        <View style={styles.recentHeader}>
                            <Text style={styles.recentTitle}>RECENTLY VISITED</Text>
                            <View style={styles.divider} />
                        </View>
                        <View style={styles.recentRooms}>
                            {rooms.slice(0, 3).map((room) => {
                                const availability = getRoomAvailability(room.id);
                                return (
                                    <View key={room.id} style={styles.roomCard}>
                                        <View style={styles.roomCardContent}>
                                            <View style={styles.roomInfo}>
                                                <Text style={styles.roomCode}>{room.id}</Text>
                                                <Text style={styles.roomName}>{room.name}</Text>
                                                <Text style={styles.lastVisit}>Floor {room.floor} - {room.capacity} seats</Text>
                                            </View>
                                            <View style={styles.roomStatus}>
                                                <Text style={availability === 'Vrij' ? styles.statusAvailable : styles.statusText}>
                                                    {availability}
                                                </Text>
                                                <View style={styles.statusIconPlaceholder} />
                                            </View>
                                        </View>
                                    </View>
                                );
                            })}
                        </View>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#131313',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        color: '#e5e2e1',
        fontSize: 16,
    },
    scrollView: {
        flex: 1,
    },
    mainContent: {
        paddingTop: 32, // Reduced since header is now in normal flow
        paddingHorizontal: 16,
        paddingBottom: 100, // Add space for bottom tab bar
        gap: 32,
    },
    heroCard: {
        backgroundColor: '#1c1b1b',
        borderLeftWidth: 4,
        borderLeftColor: '#e6c364',
        borderRadius: 2,
        padding: 24,
        paddingLeft: 28,
        gap: 16,
    },
    heroHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    heroLeft: {
        gap: 4,
        width: 81.3,
    },
    activeLabel: {
        color: '#e6c364',
        fontSize: 12,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 1.2,
        lineHeight: 16,
    },
    roomNumber: {
        color: '#e5e2e1',
        fontSize: 30,
        fontWeight: 'bold',
        lineHeight: 36,
    },
    heroRight: {
        alignItems: 'flex-end',
        gap: 4,
    },
    timeRange: {
        color: '#d0c5b2',
        fontSize: 14,
        lineHeight: 20,
        textAlign: 'right',
    },
    timeRemaining: {
        color: '#e6c364',
        fontSize: 12,
        letterSpacing: -0.6,
        lineHeight: 16,
        textAlign: 'right',
    },
    heroDetails: {
        gap: 16,
    },
    heroDetailsContent: {
        gap: 4,
    },
    courseTitle: {
        color: '#e5e2e1',
        fontSize: 20,
        fontWeight: 'bold',
        lineHeight: 28,
    },
    courseSubtitle: {
        color: '#d0c5b2',
        fontSize: 14,
        lineHeight: 20,
    },
    progressBar: {
        height: 4,
        backgroundColor: '#353535',
        borderRadius: 2,
    },
    progressFill: {
        width: '65%',
        height: '100%',
        backgroundColor: '#e6c364',
        borderRadius: 2,
    },
    heroIcon: {
        position: 'absolute',
        bottom: 2.87,
        right: 20.02,
        width: 56,
        height: 93.128,
    },
    quickActionGrid: {
        flexDirection: 'row',
        gap: 12,
        height: 82,
    },
    quickActionButton: {
        flex: 1,
        backgroundColor: '#2a2a2a',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        gap: 8,
        borderRadius: 2,
    },
    quickActionIcon: {
        width: 20,
        height: 20,
    },
    quickActionText: {
        color: '#e5e2e1',
        fontSize: 10,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: -0.5,
        textAlign: 'center',
    },
    recentSection: {
        gap: 16,
        paddingBottom: 16,
    },
    recentHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    recentTitle: {
        color: '#d0c5b2',
        fontSize: 12,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 2.4,
    },
    divider: {
        width: 48,
        height: 1,
        backgroundColor: '#4d4637',
    },
    recentRooms: {
        gap: 8,
    },
    roomCard: {
        backgroundColor: '#1c1b1b',
        borderRadius: 2,
        padding: 16,
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
        color: '#e5e2e1',
        fontSize: 16,
        fontWeight: 'bold',
    },
    roomName: {
        color: '#d0c5b2',
        fontSize: 14,
    },
    lastVisit: {
        color: '#d0c5b2',
        fontSize: 12,
        opacity: 0.7,
    },
    roomStatus: {
        alignItems: 'flex-end',
        gap: 4,
    },
    statusText: {
        color: '#f44336',
        fontSize: 10,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    statusAvailable: {
        color: '#4caf50',
        fontSize: 10,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    statusIcon: {
        width: 4,
        height: 7,
    },
        header: {
        height: 80, // Header height
        backgroundColor: 'rgba(19, 19, 19, 0.9)',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: 10, // Add some top padding
        paddingBottom: 10, // Add bottom padding
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    profileContainer: {
        width: 32,
        height: 32,
        backgroundColor: '#353535',
        borderWidth: 1,
        borderColor: '#4d4637',
        borderRadius: 12,
        overflow: 'hidden',
    },
    profileImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    greeting: {
        color: '#e6c364',
        fontSize: 18,
        fontWeight: 'bold',
        letterSpacing: -0.45,
    },
    menuButton: {
        padding: 8,
        borderRadius: 4,
        backgroundColor: 'rgba(230, 195, 100, 0.1)',
        borderWidth: 1,
        borderColor: '#e6c364',
    },
    menuIcon: {
        color: '#e6c364',
        fontSize: 20,
        fontWeight: 'bold',
        lineHeight: 20,
    },
    // Placeholder styles for removed Figma assets
    heroIconPlaceholder: {
        position: 'absolute',
        bottom: 2.87,
        right: 20.02,
        width: 56,
        height: 93.128,
        backgroundColor: '#353535',
        borderRadius: 8,
    },
    quickActionIconPlaceholder: {
        width: 20,
        height: 20,
        backgroundColor: '#4d4637',
        borderRadius: 4,
    },
    statusIconPlaceholder: {
        width: 4,
        height: 7,
        backgroundColor: '#4d4637',
        borderRadius: 1,
    },
    profilePlaceholder: {
        width: '100%',
        height: '100%',
        backgroundColor: '#4d4637',
        borderRadius: 12,
    },
    settingsIconPlaceholder: {
        width: 15,
        height: 19,
        backgroundColor: '#4d4637',
        borderRadius: 2,
    },
});