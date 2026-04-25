import 'react-native-gesture-handler';
import { createStaticNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

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
        ReportForm: ReportFormScreen,
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
    },
    screens: {
        Main: {
            screen: Tabs,
            options: { headerShown: false },
        },
        Settings: SettingsScreen,
    },
});

const Navigation = createStaticNavigation(AppDrawer);

export default function App() {
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <SafeAreaProvider>
                <Navigation />
            </SafeAreaProvider>
        </GestureHandlerRootView>
    );
}
