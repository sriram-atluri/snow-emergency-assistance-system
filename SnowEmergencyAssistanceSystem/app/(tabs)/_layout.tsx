import { Tabs } from 'expo-router';
import React from 'react';
import { Button } from 'react-native'; // Import Button for the Sign Out example

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '../../context/AuthContext'; // Adjust path as needed

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { signOut } = useAuth(); // <-- Get the signOut function

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        // You can use the headerRight option to place the Sign Out button
        headerRight: () => (
            <Button
              onPress={signOut} // Call signOut to trigger the navigation back to 'signin'
              title="Sign Out"
              color={Colors[colorScheme ?? 'light'].tint}
            />
        ),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Help',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="paperplane.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="mapDisplay"
        options = {{
          title: 'Mapping',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="map.fill" color={color} />,
        }}
        />
    </Tabs>
  );
}