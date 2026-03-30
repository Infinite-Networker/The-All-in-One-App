/**
 * The All-in-One App — App Navigator
 * Cherry Computer Ltd.
 *
 * Root navigation structure. Tab navigator at the bottom with
 * custom styled tab bar matching the dark design system.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';

import HomeScreen       from '../screens/HomeScreen';
import EngagementScreen from '../screens/EngagementScreen';
import AnalyticsScreen  from '../screens/AnalyticsScreen';
import AccountsScreen   from '../screens/AccountsScreen';
import SettingsScreen   from '../screens/SettingsScreen';

import { useTheme }  from '../hooks/useTheme';
import { PALETTE }   from '../theme';

const Tab   = createBottomTabNavigator();
const Stack = createStackNavigator();

// ─── Tab Bar Config ───────────────────────────────────────────────────────

const TABS = [
  { name: 'Home',       icon: '🏠', screen: HomeScreen },
  { name: 'Engage',     icon: '⚡', screen: EngagementScreen },
  { name: 'Analytics',  icon: '📊', screen: AnalyticsScreen },
  { name: 'Accounts',   icon: '🔗', screen: AccountsScreen },
  { name: 'Settings',   icon: '⚙️', screen: SettingsScreen },
];

// ─── Custom Tab Bar ───────────────────────────────────────────────────────

const CustomTabBar = ({ state, descriptors, navigation }) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.tabBar,
        {
          backgroundColor: theme.colors.tabBar,
          borderTopColor:  theme.colors.tabBarBorder,
          paddingBottom:   insets.bottom,
        },
      ]}
    >
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isActive = state.index === index;
        const tab = TABS[index];

        const onPress = () => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!isActive && !event.defaultPrevented) navigation.navigate(route.name);
        };

        return (
          <TouchableOpacity
            key={route.key}
            onPress={onPress}
            style={styles.tabItem}
            activeOpacity={0.7}
          >
            {isActive && tab.name === 'Engage' ? (
              <LinearGradient
                colors={[PALETTE.cherry, PALETTE.cherryLight]}
                style={styles.activeEngageBtn}
              >
                <Text style={styles.activeEngageIcon}>{tab.icon}</Text>
              </LinearGradient>
            ) : (
              <>
                <Text style={[styles.tabIcon, isActive && { opacity: 1 }]}>{tab.icon}</Text>
                <Text
                  style={[
                    styles.tabLabel,
                    { color: isActive ? PALETTE.cherry : theme.colors.textTertiary },
                  ]}
                >
                  {tab.name}
                </Text>
                {isActive && <View style={styles.activeDot} />}
              </>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

// ─── Tab Navigator ────────────────────────────────────────────────────────

const TabNavigator = () => {
  const { theme } = useTheme();

  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        lazy: true,
      }}
    >
      {TABS.map((tab) => (
        <Tab.Screen key={tab.name} name={tab.name} component={tab.screen} />
      ))}
    </Tab.Navigator>
  );
};

// ─── Root Navigator ───────────────────────────────────────────────────────

const AppNavigator = () => {
  const { theme } = useTheme();

  return (
    <NavigationContainer
      theme={{
        dark:   theme.mode === 'dark',
        colors: {
          primary:    PALETTE.cherry,
          background: theme.colors.background,
          card:       theme.colors.card,
          text:       theme.colors.textPrimary,
          border:     theme.colors.border,
          notification: PALETTE.cherry,
        },
      }}
    >
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Main" component={TabNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingTop: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    position: 'relative',
    gap: 2,
  },
  tabIcon: {
    fontSize: 20,
    opacity: 0.6,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
  },
  activeDot: {
    position: 'absolute',
    bottom: -4,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: PALETTE.cherry,
  },
  activeEngageBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  activeEngageIcon: {
    fontSize: 20,
  },
});

export default AppNavigator;
