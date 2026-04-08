import { createStaticNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import HomeScreen from './app/screens/HomeScreen';
import ScanScreen from './app/screens/ScanScreen';
import RoomListScreen from './app/screens/RoomListScreen';
import RoomDetailScreen from './app/screens/RoomDetailScreen';
import ProfielScreen from './app/screens/ProfielScreen';
import ReportFormScreen from './app/screens/ReportFormScreen';

const LokaalenStack = createNativeStackNavigator({
    screens: {
        RoomList: {
            screen: RoomListScreen,
            options: { headerShown: false },
        },
        RoomDetail: RoomDetailScreen,
    },
});

const ProfielStack = createNativeStackNavigator({
    screens: {
        Profiel: {
            screen: ProfielScreen,
            options: { headerShown: false },
        },
        ReportForm: ReportFormScreen,
    },
});

const Tabs = createBottomTabNavigator({
    screenOptions:{
        headerShown: false,
    },
    screens: {
        Home: HomeScreen,
        Scan: ScanScreen,
        Lokalen: {
            screen: LokaalenStack,
            options: { headerShown: false },
        },
        Profiel: {
            screen: ProfielStack,
            options: { headerShown: false },
        },
    },
});

const RootStack = createNativeStackNavigator({
    screens: {
        Main: {
            screen: Tabs,
            options: { headerShown: false },
        },
    },
});

const Navigation = createStaticNavigation(RootStack);

export default function App() {
    return (
        <SafeAreaProvider>
            <Navigation />
        </SafeAreaProvider>
    );
}