import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Dimensions } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
    RoomDetail: { id: string };
};

const { width, height } = Dimensions.get('window');
const SCAN_AREA_SIZE = 250;

export default function ScanScreen() {
    const [permission, requestPermission] = useCameraPermissions();
    const [scanned, setScanned] = useState(false);
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const isFocused = useIsFocused();

    if (!permission) {
        return <View style={styles.container} />;
    }

    if (!permission.granted) {
        return (
            <View style={styles.container}>
                <Text style={styles.message}>We need your permission to show the camera</Text>
                <TouchableOpacity style={styles.button} onPress={requestPermission}>
                    <Text style={styles.buttonText}>Grant Permission</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const handleBarCodeScanned = ({ type, data }: { type: string, data: string }) => {
        if (scanned || !isFocused) return;
        setScanned(true);
        
        // Match our room ID format (e.g., A101, B201)
        const roomIdMatch = data.match(/[A-Z]\d{3}/);
        
        if (roomIdMatch) {
            const roomId = roomIdMatch[0];
            // Navigate to RoomDetail via the Lokalen stack
            // @ts-ignore - Navigation type nesting can be complex
            navigation.navigate('Lokalen', {
                screen: 'RoomDetail',
                params: { id: roomId }
            });
            
            // Reset scan state after a delay to allow future scans
            setTimeout(() => setScanned(false), 2000);
        } else {
            alert(`Invalid QR code: ${data}. Please scan a room QR code.`);
            setTimeout(() => setScanned(false), 2000);
        }
    };

    return (
        <View style={styles.container}>
            {isFocused && (
                <CameraView 
                    style={StyleSheet.absoluteFillObject} 
                    onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                    barcodeScannerSettings={{
                        barcodeTypes: ["qr"],
                    }}
                />
            )}
            
            {/* Overlay UI */}
            <View style={styles.overlay}>
                <View style={styles.unfocusedContainer}></View>
                <View style={styles.middleContainer}>
                    <View style={styles.unfocusedContainer}></View>
                    <View style={styles.focusedContainer}>
                        {/* Corner markers */}
                        <View style={[styles.corner, styles.topLeft]} />
                        <View style={[styles.corner, styles.topRight]} />
                        <View style={[styles.corner, styles.bottomLeft]} />
                        <View style={[styles.corner, styles.bottomRight]} />
                    </View>
                    <View style={styles.unfocusedContainer}></View>
                </View>
                <View style={styles.unfocusedContainer}>
                    <Text style={styles.instructions}>Align QR code within the frame</Text>
                    <TouchableOpacity 
                        style={styles.cancelButton} 
                        onPress={() => navigation.goBack()}
                    >
                        <Text style={styles.cancelText}>CANCEL</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#131313',
        justifyContent: 'center',
        alignItems: 'center',
    },
    message: {
        color: '#e5e2e1',
        textAlign: 'center',
        marginBottom: 20,
        paddingHorizontal: 40,
        fontSize: 16,
    },
    button: {
        backgroundColor: '#e6c364',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 4,
    },
    buttonText: {
        color: '#131313',
        fontWeight: 'bold',
        fontSize: 14,
        textTransform: 'uppercase',
    },
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    unfocusedContainer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    middleContainer: {
        flexDirection: 'row',
        height: SCAN_AREA_SIZE,
    },
    focusedContainer: {
        width: SCAN_AREA_SIZE,
        height: SCAN_AREA_SIZE,
        position: 'relative',
    },
    corner: {
        position: 'absolute',
        width: 30,
        height: 30,
        borderColor: '#e6c364',
    },
    topLeft: {
        top: 0,
        left: 0,
        borderLeftWidth: 3,
        borderTopWidth: 3,
    },
    topRight: {
        top: 0,
        right: 0,
        borderRightWidth: 3,
        borderTopWidth: 3,
    },
    bottomLeft: {
        bottom: 0,
        left: 0,
        borderLeftWidth: 3,
        borderBottomWidth: 3,
    },
    bottomRight: {
        bottom: 0,
        right: 0,
        borderRightWidth: 3,
        borderBottomWidth: 3,
    },
    instructions: {
        color: '#e5e2e1',
        fontSize: 14,
        marginTop: 20,
        textAlign: 'center',
        opacity: 0.8,
    },
    cancelButton: {
        marginTop: 40,
        padding: 12,
    },
    cancelText: {
        color: '#e6c364',
        fontSize: 12,
        fontWeight: 'bold',
        letterSpacing: 1.2,
    },
});