import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { useAuth } from '../providers/AuthContext';

export default function ProfielScreen() {
    const navigation = useNavigation();
    const { currentUser } = useAuth();

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <TouchableOpacity
                    style={styles.menuButton}
                    onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
                >
                    <Text style={styles.menuIcon}>☰</Text>
                </TouchableOpacity>

                <View style={styles.header}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>
                            {currentUser?.name?.charAt(0).toUpperCase() || 'U'}
                        </Text>
                    </View>
                    <Text style={styles.name}>{currentUser?.name || 'Unknown User'}</Text>
                    <Text style={styles.email}>{currentUser?.email || 'No email available'}</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Account</Text>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Name</Text>
                        <Text style={styles.infoValue}>{currentUser?.name || '-'}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>School email</Text>
                        <Text style={styles.infoValue}>{currentUser?.email || '-'}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Role</Text>
                        <Text style={styles.infoValue}>{currentUser?.role || '-'}</Text>
                    </View>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#131313',
    },
    content: {
        flex: 1,
        padding: 24,
    },
    menuButton: {
        alignSelf: 'flex-start',
        padding: 8,
        borderRadius: 4,
        backgroundColor: 'rgba(230, 195, 100, 0.1)',
        borderWidth: 1,
        borderColor: '#e6c364',
        marginBottom: 16,
    },
    menuIcon: {
        color: '#e6c364',
        fontSize: 20,
        fontWeight: 'bold',
        lineHeight: 20,
    },
    header: {
        alignItems: 'center',
        marginBottom: 32,
    },
    avatar: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: '#e6c364',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    avatarText: {
        color: '#131313',
        fontSize: 28,
        fontWeight: 'bold',
    },
    name: {
        color: '#e5e2e1',
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 6,
    },
    email: {
        color: '#d0c5b2',
        fontSize: 14,
        textAlign: 'center',
    },
    section: {
        borderTopWidth: 1,
        borderTopColor: '#353535',
        paddingTop: 20,
        gap: 14,
    },
    sectionTitle: {
        color: '#e6c364',
        fontSize: 12,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 1.2,
        marginBottom: 4,
    },
    infoRow: {
        backgroundColor: '#1c1b1b',
        borderRadius: 4,
        borderWidth: 1,
        borderColor: '#353535',
        padding: 16,
        gap: 6,
    },
    infoLabel: {
        color: '#d0c5b2',
        fontSize: 12,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    infoValue: {
        color: '#e5e2e1',
        fontSize: 16,
    },
});
