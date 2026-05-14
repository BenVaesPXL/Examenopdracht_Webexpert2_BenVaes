import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { isConnected } from '../utils/network';

export default function OfflineBanner() {
    const [offline, setOffline] = useState(false);
    const slideAnim = useState(new Animated.Value(-40))[0];

    useEffect(() => {
        let isMounted = true;

        const check = async () => {
            const online = await isConnected();
            if (!isMounted) return;
            setOffline(!online);

            Animated.timing(slideAnim, {
                toValue: online ? -40 : 0,
                duration: 300,
                useNativeDriver: true,
            }).start();
        };

        check();
        const interval = setInterval(check, 10000); // re-check every 10s
        return () => {
            isMounted = false;
            clearInterval(interval);
        };
    }, []);

    if (!offline) return null;

    return (
        <Animated.View style={[styles.banner, { transform: [{ translateY: slideAnim }] }]}>
            <Text style={styles.text}>⚡ You are offline — showing cached data</Text>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    banner: {
        backgroundColor: '#4d4637',
        paddingVertical: 8,
        paddingHorizontal: 16,
        alignItems: 'center',
    },
    text: {
        color: '#e6c364',
        fontSize: 12,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
});