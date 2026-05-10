import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
// import { Ionicons } from '@expo/vector-icons';
// import { MaterialCommunityIcons } from '@expo/vector-icons';
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
    const [currentTime] = useState(new Date());

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

    const isRoomOccupied = () => {
        const currentDay = ['zondag', 'maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag'][currentTime.getDay()];
        const nowMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
        
        return schedule.some(item => {
            if (item.day !== currentDay) return false;
            const start = parseInt(item.start.split(':')[0]) * 60 + parseInt(item.start.split(':')[1]);
            const end = parseInt(item.end.split(':')[0]) * 60 + parseInt(item.end.split(':')[1]);
            return nowMinutes >= start && nowMinutes <= end;
        });
    };

    const handleReportIssue = () => {
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
                <TouchableOpacity 
                    style={styles.backButtonAbsolute} 
                    onPress={() => navigation.goBack()}
                >
                    <Text style={styles.backIcon}>←</Text>
                </TouchableOpacity>
                <Text style={styles.errorText}>Room not found</Text>
            </View>
        );
    }

    const occupied = isRoomOccupied();
    const months = ['JAN', 'FEB', 'MRT', 'APR', 'MEI', 'JUN', 'JUL', 'AUG', 'SEP', 'OKT', 'NOV', 'DEC'];
    const formattedDate = `${currentTime.getDate()} ${months[currentTime.getMonth()]} ${currentTime.getFullYear()}`;

    const getNextLesson = () => {
        const currentDay = ['zondag', 'maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag'][currentTime.getDay()];
        const nowMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
        
        const upcoming = schedule
            .filter(item => item.day === currentDay)
            .find(item => {
                const start = parseInt(item.start.split(':')[0]) * 60 + parseInt(item.start.split(':')[1]);
                return start > nowMinutes;
            });
            
        return upcoming;
    };

    const nextLesson = getNextLesson();

    return (
        <SafeAreaView style={styles.container}>
            {/* Custom Header */}
            <View style={styles.navBar}>
                <TouchableOpacity style={styles.navIcon} onPress={() => navigation.goBack()}>
                    <Text style={styles.navIconText}>←</Text>
                </TouchableOpacity>
                <Text style={styles.logoText}>FINDIT</Text>
                <View style={styles.profileCircle}>
                    <View style={styles.profilePlaceholder} />
                </View>
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Hero Section */}
                <View style={styles.heroSection}>
                    <Text style={styles.roomCodeBig}>{room.id}</Text>
                    <View style={styles.statusRow}>
                        <View style={[styles.statusBadge, { backgroundColor: occupied ? 'rgba(244, 67, 54, 0.1)' : 'rgba(76, 175, 80, 0.1)' }]}>
                            <View style={[styles.statusDot, { backgroundColor: occupied ? '#f44336' : '#4caf50' }]} />
                            <Text style={[styles.statusText, { color: occupied ? '#f44336' : '#4caf50' }]}>
                                {occupied ? 'BEZET' : 'VRIJ'}
                            </Text>
                        </View>
                        <Text style={styles.locationInfo}>PXL-{room.building || 'DIGITAL'} / {room.floor === 0 ? 'GELIJKVLOERS' : `VERDIEPING ${room.floor}`}</Text>
                    </View>
                    
                    {nextLesson && (
                        <View style={styles.nextLessonContainer}>
                            <Text style={styles.nextLessonLabel}>VOLGENDE LES:</Text>
                            <Text style={styles.nextLessonText}>{nextLesson.course} om {nextLesson.start}</Text>
                        </View>
                    )}
                </View>

                {/* Info Cards */}
                <View style={styles.infoCardsRow}>
                    <View style={styles.infoCard}>
                        <Text style={styles.infoLabel}>CAPACITEIT</Text>
                        <Text style={styles.infoValue}>{room.capacity}</Text>
                    </View>
                    <View style={styles.infoCard}>
                        <Text style={styles.infoLabel}>TYPE</Text>
                        <Text style={styles.infoValue}>{room.type.charAt(0).toUpperCase() + room.type.slice(1)}</Text>
                    </View>
                </View>

                {/* Schedule Section */}
                <View style={styles.scheduleSection}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>VANDAAG</Text>
                        <Text style={styles.dateText}>{formattedDate}</Text>
                    </View>

                    <View style={styles.timelineContainer}>
                        {(() => {
                            const currentDay = ['zondag', 'maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag'][currentTime.getDay()];
                            const todaySchedule = schedule.filter(item => item.day === currentDay);
                            
                            if (todaySchedule.length === 0) {
                                return <Text style={styles.emptyText}>Geen lessen gepland voor vandaag.</Text>;
                            }

                            // Create a combined list of lessons and breaks
                            const timelineItems: any[] = [];
                            todaySchedule.forEach((item, index) => {
                                timelineItems.push({ ...item, type: 'lesson' });
                                
                                // Check if there's a gap to the next lesson
                                if (index < todaySchedule.length - 1) {
                                    const nextItem = todaySchedule[index + 1];
                                    if (item.end !== nextItem.start) {
                                        timelineItems.push({
                                            id: `break-${index}`,
                                            start: item.end,
                                            end: nextItem.start,
                                            type: 'break'
                                        });
                                    }
                                }
                            });

                            return timelineItems.map((item, index) => {
                                const isNow = item.type === 'lesson' && (() => {
                                    const nowMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
                                    const start = parseInt(item.start.split(':')[0]) * 60 + parseInt(item.start.split(':')[1]);
                                    const end = parseInt(item.end.split(':')[0]) * 60 + parseInt(item.end.split(':')[1]);
                                    return nowMinutes >= start && nowMinutes <= end;
                                })();

                                return (
                                    <View key={item.id} style={styles.timelineItem}>
                                        <View style={styles.timelineLeft}>
                                            <Text style={[styles.timelineTime, isNow && { color: '#e6c364' }]}>{item.start}</Text>
                                            <View style={[styles.timelineDot, isNow && styles.timelineDotActive]} />
                                            {index !== timelineItems.length - 1 && <View style={styles.timelineLine} />}
                                        </View>
                                        
                                        {item.type === 'lesson' ? (
                                            <Animated.View 
                                                entering={FadeInDown.delay(index * 100).duration(400)}
                                                style={[styles.timelineCard, isNow && styles.timelineCardActive]}
                                            >
                                                {isNow && <Text style={styles.activeTag}>LOPEND</Text>}
                                                <Text style={styles.courseName}>{item.course}</Text>
                                                <Text style={styles.lecturerText}>Lectured by: {item.teacher}</Text>
                                            </Animated.View>
                                        ) : (
                                            <View style={styles.timelineCardEmpty}>
                                                <Text style={styles.pauzeText}>PAUZE</Text>
                                            </View>
                                        )}
                                    </View>
                                );
                            });
                        })()}
                    </View>
                </View>

                {/* Report Button */}
                <TouchableOpacity style={styles.goldReportButton} onPress={handleReportIssue}>
                    <Text style={styles.alertIcon}>!</Text>
                    <Text style={styles.goldReportButtonText}>PROBLEEM MELDEN</Text>
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
    navBar: {
        height: 60,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
    },
    navIcon: {
        padding: 4,
    },
    logoText: {
        color: '#e6c364',
        fontSize: 18,
        fontWeight: '900',
        letterSpacing: 2,
    },
    profileCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#2a2a2a',
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#4d4637',
    },
    profilePlaceholder: {
        flex: 1,
        backgroundColor: '#4d4637',
    },
    scrollView: {
        flex: 1,
        paddingHorizontal: 24,
    },
    heroSection: {
        marginTop: 40,
        marginBottom: 30,
    },
    roomCodeBig: {
        color: '#e6c364',
        fontSize: 90,
        fontWeight: 'bold',
        letterSpacing: -2,
        lineHeight: 100,
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginTop: 10,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 4,
        gap: 6,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    statusText: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    locationInfo: {
        color: '#d0c5b2',
        fontSize: 12,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    nextLessonContainer: {
        marginTop: 16,
        padding: 12,
        backgroundColor: 'rgba(230, 195, 100, 0.05)',
        borderRadius: 2,
        borderLeftWidth: 2,
        borderLeftColor: '#e6c364',
    },
    nextLessonLabel: {
        color: '#e6c364',
        fontSize: 10,
        fontWeight: 'bold',
        letterSpacing: 1,
        marginBottom: 4,
    },
    nextLessonText: {
        color: '#e5e2e1',
        fontSize: 14,
        fontWeight: 'bold',
    },
    infoCardsRow: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 40,
    },
    infoCard: {
        flex: 1,
        backgroundColor: '#1c1c1c',
        padding: 20,
        borderRadius: 2,
        gap: 8,
    },
    infoLabel: {
        color: '#d0c5b2',
        fontSize: 10,
        fontWeight: 'bold',
        letterSpacing: 1,
        opacity: 0.6,
    },
    infoValue: {
        color: '#e5e2e1',
        fontSize: 24,
        fontWeight: 'bold',
    },
    scheduleSection: {
        marginBottom: 30,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginBottom: 20,
    },
    sectionTitle: {
        color: '#e5e2e1',
        fontSize: 20,
        fontWeight: 'bold',
        letterSpacing: 2,
    },
    dateText: {
        color: '#e6c364',
        fontSize: 10,
        fontWeight: 'bold',
        opacity: 0.8,
    },
    timelineContainer: {
        paddingLeft: 4,
    },
    timelineItem: {
        flexDirection: 'row',
        gap: 24,
        minHeight: 100,
    },
    timelineLeft: {
        alignItems: 'center',
        width: 40,
    },
    timelineTime: {
        color: '#d0c5b2',
        fontSize: 12,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    timelineDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        borderWidth: 2,
        borderColor: '#353535',
        backgroundColor: '#131313',
        zIndex: 2,
    },
    timelineDotActive: {
        borderColor: '#e6c364',
        backgroundColor: '#e6c364',
    },
    timelineLine: {
        position: 'absolute',
        top: 45,
        bottom: -45,
        width: 1,
        backgroundColor: '#353535',
    },
    timelineCard: {
        flex: 1,
        backgroundColor: '#1c1c1c',
        padding: 20,
        borderRadius: 2,
        marginBottom: 16,
    },
    timelineCardActive: {
        borderLeftWidth: 2,
        borderLeftColor: '#e6c364',
    },
    timelineCardEmpty: {
        flex: 1,
        padding: 20,
        marginBottom: 16,
    },
    activeTag: {
        color: '#e6c364',
        fontSize: 10,
        fontWeight: 'bold',
        letterSpacing: 1,
        marginBottom: 8,
    },
    courseName: {
        color: '#e5e2e1',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    lecturerText: {
        color: '#d0c5b2',
        fontSize: 12,
        opacity: 0.6,
    },
    pauzeText: {
        color: '#d0c5b2',
        fontSize: 12,
        fontWeight: 'bold',
        opacity: 0.4,
        letterSpacing: 1,
    },
    goldReportButton: {
        backgroundColor: '#e6c364',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 20,
        borderRadius: 2,
        gap: 12,
        marginTop: 20,
    },
    goldReportButtonText: {
        color: '#131313',
        fontSize: 14,
        fontWeight: 'bold',
        letterSpacing: 2,
    },
    emptyText: {
        color: '#d0c5b2',
        fontSize: 14,
        fontStyle: 'italic',
        textAlign: 'center',
        padding: 20,
    },
    errorText: {
        color: '#f44336',
        fontSize: 16,
    },
    backIcon: {
        color: '#e6c364',
        fontSize: 24,
        fontWeight: 'bold',
    },
    navIconText: {
        color: '#e6c364',
        fontSize: 28,
        fontWeight: 'bold',
    },
    alertIcon: {
        color: '#131313',
        fontSize: 20,
        fontWeight: 'bold',
    },
    backButtonAbsolute: {
        position: 'absolute',
        top: 60,
        left: 20,
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
});