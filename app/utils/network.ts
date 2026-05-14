import * as Network from 'expo-network';

export async function isConnected(): Promise<boolean> {
    try {
        const networkState = await Network.getNetworkStateAsync();
        return networkState.isConnected === true && networkState.isInternetReachable === true;
    } catch (error) {
        console.error("Error checking network connectivity:", error);
        return false;
    }
}