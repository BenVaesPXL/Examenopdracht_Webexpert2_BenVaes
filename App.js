import "react-native-gesture-handler";
import React, { Suspense, lazy, useEffect, useState } from "react";
import { createStaticNavigation } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { Ionicons } from "@expo/vector-icons";
import { View, StyleSheet } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AuthProvider, useAuth } from "./app/providers/AuthContext";
import { ToastProvider } from "./app/providers/ToastContext";
import LoadingSpinner from "./app/components/LoadingSpinner";

import HomeScreen from "./app/screens/HomeScreen";
import RoomListScreen from "./app/screens/RoomListScreen";
import ProfielScreen from "./app/screens/ProfielScreen";
import ReportFormScreen from "./app/screens/ReportFormScreen";
import SettingsScreen from "./app/screens/SettingsScreen";
import LoginScreen from "./app/screens/LoginScreen";

const ScanScreen = lazy(() => import("./app/screens/ScanScreen"));
const RoomDetailScreen = lazy(() => import("./app/screens/RoomDetailScreen"));

const navIcon = (name) => ({ color, size }) => (
  <Ionicons name={name} size={size} color={color} />
);

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
      backgroundColor: "#131313",
      borderTopWidth: 1,
      borderTopColor: "rgba(255, 255, 255, 0.05)",
      height: 80,
      paddingBottom: 10,
      paddingTop: 10,
    },
    tabBarActiveTintColor: "#e6c364",
    tabBarInactiveTintColor: "rgba(255, 255, 255, 0.4)",
    tabBarLabelStyle: {
      fontSize: 10,
      fontWeight: "bold",
      textTransform: "uppercase",
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
        tabBarLabel: "HOME",
        tabBarIcon: navIcon("home-outline"),
      },
    },
    Scan: {
      screen: ScanScreen,
      options: {
        headerShown: false,
        tabBarLabel: "SCAN",
        tabBarIcon: navIcon("qr-code-outline"),
      },
    },
    Lokalen: {
      screen: LokaalenStack,
      options: {
        headerShown: false,
        tabBarLabel: "ROOMS",
        tabBarIcon: navIcon("grid-outline"),
      },
    },
    Profile: {
      screen: ProfielStack,
      options: {
        headerShown: false,
        tabBarLabel: "PROFILE",
        tabBarIcon: navIcon("person-outline"),
      },
    },
  },
});

const AppDrawer = createDrawerNavigator({
  screenOptions: {
    drawerType: "front",
    drawerStyle: {
      backgroundColor: "#131313",
      width: 280,
    },
    drawerActiveTintColor: "#e6c364",
    drawerInactiveTintColor: "#e5e2e1",
    drawerActiveBackgroundColor: "rgba(230, 195, 100, 0.1)",
    drawerLabelStyle: {
      fontSize: 14,
      fontWeight: "500",
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
        drawerLabel: "Main",
        drawerIcon: navIcon("menu-outline"),
      },
    },
    Settings: {
      screen: SettingsScreen,
      options: {
        headerShown: false,
        drawerLabel: "Settings",
        drawerIcon: navIcon("settings-outline"),
      },
    },
  },
});

const Navigation = createStaticNavigation(AppDrawer);

function AuthGate() {
  const { currentUser, isLoading } = useAuth();
  const [iconsLoaded, setIconsLoaded] = useState(false);

  useEffect(() => {
    let mounted = true;

    Ionicons.loadFont()
      .then(() => {
        if (mounted) {
          setIconsLoaded(true);
        }
      })
      .catch(() => {
        if (mounted) {
          setIconsLoaded(true);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  if (isLoading || !iconsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner text={isLoading ? "Loading session..." : "Loading icons..."} />
      </View>
    );
  }

  return currentUser ? (
    <Suspense
      fallback={
        <View style={styles.loadingContainer}>
          <LoadingSpinner text="Loading screen..." />
        </View>
      }
    >
      <Navigation />
    </Suspense>
  ) : (
    <LoginScreen />
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ToastProvider>
          <AuthProvider>
            <AuthGate />
          </AuthProvider>
        </ToastProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: "#131313",
    justifyContent: "center",
    alignItems: "center",
  },
});
