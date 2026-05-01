import 'react-native-gesture-handler';
import { createStaticNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ToastProvider } from './app/context/ToastContext';

import HomeScreen from './app/screens/HomeScreen';
import ScanScreen from './app/screens/ScanScreen';
import RoomListScreen from './app/screens/RoomListScreen';
import RoomDetailScreen from './app/screens/RoomDetailScreen';
import ProfielScreen from './app/screens/ProfielScreen';
import ReportFormScreen from './app/screens/ReportFormScreen';
import SettingsScreen from './app/screens/SettingsScreen';

const LokaalenStack = createNativeStackNavigator({
    screens: {
        RoomList: {
            screen: RoomListScreen,
            options: { headerShown: false },
        },
        RoomDetail: {
            screen: RoomDetailScreen,
            options: { headerShown: false },
        },
    },
});

const ProfielStack = createNativeStackNavigator({
    screens: {
        ProfileDetail: {
            screen: ProfielScreen,
            options: { headerShown: false },
        },
        ReportForm: {
            screen: ReportFormScreen,
            options: { headerShown: false },
        },
    },
});


const Tabs = createBottomTabNavigator({
    screenOptions: {
        headerShown: false,
        tabBarStyle: {
            backgroundColor: '#131313',
            borderTopWidth: 1,
            borderTopColor: 'rgba(255, 255, 255, 0.05)',
            height: 80,
            paddingBottom: 10,
            paddingTop: 10,
        },
        tabBarActiveTintColor: '#e6c364',
        tabBarInactiveTintColor: 'rgba(255, 255, 255, 0.4)',
        tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: 'bold',
            textTransform: 'uppercase',
            letterSpacing: 0.5,
        },
        tabBarItemStyle: {
            paddingVertical: 4,
        },
    },
    screens: {
        Home: {
            screen: HomeScreen,
            options: { 
                headerShown: false,
                tabBarLabel: 'HOME'
            },
        },
        Scan: {
            screen: ScanScreen,
            options: { 
                headerShown: false,
                tabBarLabel: 'SCAN'
            },
        },
        Lokalen: {
            screen: LokaalenStack,
            options: { 
                headerShown: false,
                tabBarLabel: 'ROOMS'
            },
        },
        Profile: {
            screen: ProfielStack,
            options: { 
                headerShown: false,
                tabBarLabel: 'PROFILE'
            },
        },
    },
});

const AppDrawer = createDrawerNavigator({
    screenOptions: {
        drawerType: 'front',
        drawerStyle: {
            backgroundColor: '#131313',
            width: 280,
        },
        drawerActiveTintColor: '#e6c364',
        drawerInactiveTintColor: '#e5e2e1',
        drawerActiveBackgroundColor: 'rgba(230, 195, 100, 0.1)',
        drawerLabelStyle: {
            fontSize: 14,
            fontWeight: '500',
        },
        drawerItemStyle: {
            borderRadius: 4,
            marginHorizontal: 12,
            marginVertical: 2,
        },
    },
    screens: {
        Main: {
            screen: Tabs,
            options: { 
                headerShown: false,
                drawerLabel: 'Home',
                drawerIcon: ({ focused, color, size }) => (
                    focused ? '🏠' : '🏠'
                ),
            },
        },
        Settings: {
            screen: SettingsScreen,
            options: {
                drawerLabel: 'Settings',
                drawerIcon: ({ focused, color, size }) => (
                    focused ? '⚙️' : '⚙️'
                ),
            },
        },
    },
});

const Navigation = createStaticNavigation(AppDrawer);

export default function App() {
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <SafeAreaProvider>
                <ToastProvider>
                    <Navigation />
                </ToastProvider>
            </SafeAreaProvider>
        </GestureHandlerRootView>
    );
}
