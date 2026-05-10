import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet, ViewStyle, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface LoadingSpinnerProps {
  size?: 'small' | 'large';
  color?: string;
  text?: string;
  overlay?: boolean;
}

export default function LoadingSpinner({ 
  size = 'large', 
  color = '#e6c364', 
  text,
  overlay = false 
}: LoadingSpinnerProps) {
  const content = (
    <View style={[spinnerStyles.container, overlay && spinnerStyles.overlay]}>
      <ActivityIndicator 
        size={size} 
        color={color}
        style={spinnerStyles.spinner}
      />
      {text && (
        <Text style={spinnerStyles.text}>{text}</Text>
      )}
    </View>
  );

  return content;
}

const spinnerStyles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(19, 19, 19, 0.8)',
    zIndex: 1000,
  },
  spinner: {
    marginBottom: 12,
  },
  text: {
    color: '#d0c5b2',
    fontSize: 14,
    textAlign: 'center',
  },
});

// Skeleton loading component
export function SkeletonLoader({ width, height, style }: { width?: number; height?: number; style?: ViewStyle }) {
  return (
    <View 
      style={[
        skeletonStyles.skeleton,
        { 
          width: width || '100%', 
          height: height || 20 
        },
        style
      ]} 
    />
  );
}

const skeletonStyles = StyleSheet.create({
  skeleton: {
    backgroundColor: '#353535',
    borderRadius: 4,
    overflow: 'hidden',
  },
});

// Card skeleton for room lists
export function RoomCardSkeleton() {
  return (
    <View style={cardSkeletonStyles.card}>
      <View style={cardSkeletonStyles.cardContent}>
        <View style={cardSkeletonStyles.leftContent}>
          <SkeletonLoader width={60} height={16} style={cardSkeletonStyles.roomCode} />
          <SkeletonLoader width={120} height={14} style={cardSkeletonStyles.roomName} />
          <SkeletonLoader width={80} height={12} style={cardSkeletonStyles.lastVisit} />
        </View>
        <View style={cardSkeletonStyles.rightContent}>
          <SkeletonLoader width={40} height={10} style={cardSkeletonStyles.status} />
          <SkeletonLoader width={4} height={7} style={cardSkeletonStyles.statusIcon} />
        </View>
      </View>
    </View>
  );
}

const cardSkeletonStyles = StyleSheet.create({
  card: {
    backgroundColor: '#1c1b1b',
    borderRadius: 2,
    padding: 16,
    marginBottom: 8,
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  leftContent: {
    gap: 4,
    flex: 1,
  },
  roomCode: {
    marginBottom: 4,
  },
  roomName: {
    marginBottom: 4,
  },
  lastVisit: {
    opacity: 0.7,
  },
  rightContent: {
    alignItems: 'flex-end',
    gap: 4,
  },
  status: {
    marginBottom: 4,
  },
  statusIcon: {
    alignSelf: 'flex-end',
  },
});

// Full screen skeleton for initial loading
export function FullScreenSkeleton() {
  return (
    <View style={fullScreenStyles.container}>
      {/* Header skeleton */}
      <View style={fullScreenStyles.header}>
        <View style={fullScreenStyles.headerContent}>
          <SkeletonLoader width={32} height={32} style={fullScreenStyles.profile} />
          <SkeletonLoader width={150} height={16} style={fullScreenStyles.greeting} />
        </View>
        <SkeletonLoader width={24} height={24} style={fullScreenStyles.settings} />
      </View>

      {/* Hero card skeleton */}
      <View style={fullScreenStyles.heroCard}>
        <View style={fullScreenStyles.heroHeader}>
          <View style={fullScreenStyles.heroLeft}>
            <SkeletonLoader width={80} height={12} style={fullScreenStyles.activeLabel} />
            <SkeletonLoader width={60} height={24} style={fullScreenStyles.roomNumber} />
          </View>
          <View style={fullScreenStyles.heroRight}>
            <SkeletonLoader width={100} height={14} style={fullScreenStyles.timeRange} />
            <SkeletonLoader width={80} height={12} style={fullScreenStyles.timeRemaining} />
          </View>
        </View>
        <SkeletonLoader width={SCREEN_WIDTH - 64} height={4} style={fullScreenStyles.progressBar} />
      </View>

      {/* Recent rooms skeleton */}
      <View style={fullScreenStyles.recentSection}>
        <View style={fullScreenStyles.recentHeader}>
          <SkeletonLoader width={120} height={12} style={fullScreenStyles.recentTitle} />
          <SkeletonLoader width={48} height={1} style={fullScreenStyles.divider} />
        </View>
        <View style={fullScreenStyles.recentRooms}>
          {[1, 2, 3].map((index) => (
            <RoomCardSkeleton key={index} />
          ))}
        </View>
      </View>
    </View>
  );
}

const fullScreenStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#131313',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  profile: {
    borderRadius: 12,
  },
  greeting: {
    marginBottom: 4,
  },
  settings: {
    borderRadius: 4,
  },
  heroCard: {
    backgroundColor: '#1c1b1b',
    borderRadius: 2,
    padding: 20,
    marginBottom: 24,
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  heroLeft: {
    gap: 8,
  },
  activeLabel: {
    marginBottom: 8,
  },
  roomNumber: {
    marginBottom: 4,
  },
  heroRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  timeRange: {
    marginBottom: 4,
  },
  timeRemaining: {
    marginBottom: 4,
  },
  progressBar: {
    borderRadius: 2,
  },
  recentSection: {
    gap: 16,
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  recentTitle: {
    marginBottom: 8,
  },
  divider: {
    marginBottom: 8,
  },
  recentRooms: {
    gap: 8,
  },
});
