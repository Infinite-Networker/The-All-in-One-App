/**
 * The All-in-One App — App Navigator
 * Cherry Computer Ltd.
 *
 * Navigation structure for the entire app.
 * I've designed the navigation to feel natural and predictable —
 * users should never feel lost in a feature-rich app like this.
 */

import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../hooks/useTheme';
import { PALETTE } from '../theme';

// Screens
import HomeScreen from '../screens/HomeScreen';
import EngagementScreen from '../screens/EngagementScreen';
import AnalyticsScreen from '../screens/AnalyticsScreen';
import AccountsScreen from '../screens/AccountsScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// ─────────────────────────────────────────────────────────────────────────────
// TAB ICONS
// ─────────────────────────────────────────────────────────────────────────────

const TAB_ICONS = {
  Home: { active: '🏠', inactive: '🏠', label: 'Feed' },
  Engage: { active: '⚡', inactive: '⚡', label: 'Engage' },
  Analytics: { active: '📊', inactive: '📊', label: 'Analytics' },
  Accounts: { active: '🔗', inactive: '🔗', label: 'Accounts' },
  Settings: { active: '⚙️', inactive: '⚙️', label: 'Settings' },
};

const TabIcon = ({ name, focused, color }) => {
  const icon = TAB_ICONS[name];
  return (
    <Text style={{ fontSize: focused ? 22 : 20, opacity: focused ? 1 : 0.6 }}>
      {focused ? icon.active : icon.inactive}
    </Text>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN TAB NAVIGATOR
// ─────────────────────────────────────────────────────────────────────────────

const MainTabNavigator = () => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color }) => (
          <TabIcon name={route.name} focused={focused} color={color} />
        ),
        tabBarActiveTintColor: PALETTE.cherry,
        tabBarInactiveTintColor: theme.colors.textTertiary,
        tabBarStyle: {
          backgroundColor: theme.colors.tabBar,
          borderTopColor: theme.colors.tabBarBorder,
          borderTopWidth: 0.5,
          paddingBottom: insets.bottom,
          height: 49 + insets.bottom,
          ...Platform.select({
            ios: {},
            android: { elevation: 8 },
          }),
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '500',
          marginTop: -4,
          marginBottom: 2,
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ tabBarLabel: 'Feed' }}
      />
      <Tab.Screen
        name="Engage"
        component={EngagementScreen}
        options={{ tabBarLabel: 'Engage' }}
      />
      <Tab.Screen
        name="Analytics"
        component={AnalyticsScreen}
        options={{ tabBarLabel: 'Analytics' }}
      />
      <Tab.Screen
        name="Accounts"
        component={AccountsScreen}
        options={{ tabBarLabel: 'Accounts' }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ tabBarLabel: 'Settings' }}
      />
    </Tab.Navigator>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// ROOT NAVIGATOR
// ─────────────────────────────────────────────────────────────────────────────

const AppNavigator = () => {
  const { theme } = useTheme();

  return (
    <NavigationContainer
      theme={{
        dark: theme.mode === 'dark',
        colors: {
          primary: PALETTE.cherry,
          background: theme.colors.background,
          card: theme.colors.surface,
          text: theme.colors.textPrimary,
          border: theme.colors.border,
          notification: PALETTE.cherry,
        },
      }}
    >
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: theme.colors.background },
          presentation: 'card',
          gestureEnabled: true,
        }}
      >
        <Stack.Screen name="Main" component={MainTabNavigator} />
        <Stack.Screen
          name="PostDetail"
          component={PostDetailScreen}
          options={{ presentation: 'modal' }}
        />
        <Stack.Screen
          name="Profile"
          component={ProfileScreen}
        />
        <Stack.Screen
          name="ConnectPlatform"
          component={ConnectPlatformScreen}
          options={{ presentation: 'modal' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

// Placeholder screens for navigation targets
const PostDetailScreen = () => null;
const ProfileScreen = () => null;
const ConnectPlatformScreen = () => null;

export default AppNavigator;
