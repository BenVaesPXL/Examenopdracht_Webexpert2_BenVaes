import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../providers/AuthContext';
import { useToast } from '../providers/ToastContext';

export default function SettingsScreen() {
    const navigation = useNavigation();
    const { currentUser, logout } = useAuth();
    const toast = useToast();

    const handleBack = () => {
        if (navigation.canGoBack()) {
            navigation.goBack();
            return;
        }

        navigation.navigate('Main' as never);
    };

    const handleLogout = () => {
        Alert.alert(
            'Log out',
            'Are you sure you want to log out?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Log out',
                    style: 'destructive',
                    onPress: async () => {
                        await logout();
                        toast.showInfo('Logged out', 'You have been signed out.');
                    },
                },
            ]
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                    <Text style={styles.backButtonText}>← BACK</Text>
                </TouchableOpacity>

                <Text style={styles.title}>Settings</Text>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Account</Text>
                    <View style={styles.accountCard}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>
                                {currentUser?.name?.charAt(0).toUpperCase() || 'U'}
                            </Text>
                        </View>
                        <View style={styles.accountInfo}>
                            <Text style={styles.name}>{currentUser?.name || 'Unknown User'}</Text>
                            <Text style={styles.email}>{currentUser?.email || 'No email available'}</Text>
                            <Text style={styles.role}>{currentUser?.role || 'No role'}</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Actions</Text>
                    <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                        <Text style={styles.logoutButtonText}>Log Out</Text>
                    </TouchableOpacity>
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
    backButton: {
        alignSelf: 'flex-start',
        marginBottom: 16,
        padding: 8,
    },
    backButtonText: {
        color: '#e6c364',
        fontSize: 12,
        fontWeight: 'bold',
        letterSpacing: 1.2,
    },
    title: {
        color: '#e5e2e1',
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 28,
    },
    section: {
        marginBottom: 28,
        gap: 12,
    },
    sectionTitle: {
        color: '#e6c364',
        fontSize: 12,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 1.2,
    },
    accountCard: {
        backgroundColor: '#1c1b1b',
        borderRadius: 4,
        borderWidth: 1,
        borderColor: '#353535',
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#e6c364',
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        color: '#131313',
        fontSize: 20,
        fontWeight: 'bold',
    },
    accountInfo: {
        flex: 1,
        gap: 4,
    },
    name: {
        color: '#e5e2e1',
        fontSize: 17,
        fontWeight: 'bold',
    },
    email: {
        color: '#d0c5b2',
        fontSize: 14,
    },
    role: {
        color: '#8f8778',
        fontSize: 12,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    logoutButton: {
        backgroundColor: '#2a1717',
        borderRadius: 4,
        borderWidth: 1,
        borderColor: '#7a2e2e',
        paddingVertical: 14,
        alignItems: 'center',
    },
    logoutButtonText: {
        color: '#ff8f8f',
        fontSize: 14,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 1.2,
    },
});
