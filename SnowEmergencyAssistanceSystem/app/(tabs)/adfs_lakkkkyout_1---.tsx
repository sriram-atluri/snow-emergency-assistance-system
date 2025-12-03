// import { Tabs } from 'expo-router';
// import React from 'react';

// import { HapticTab } from '@/components/haptic-tab';
// import { IconSymbol } from '@/components/ui/icon-symbol';
// import { Colors } from '@/constants/theme';
// import { useColorScheme } from '@/hooks/use-color-scheme';

// export default function TabLayout() {
//   const colorScheme = useColorScheme();

//   return (
//     <Tabs
//       screenOptions={{
//         tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
//         headerShown: false,
//         tabBarButton: HapticTab,
//       }}>
//       <Tabs.Screen
//         name="index"
//         options={{
//           title: 'Home',
//           tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
//         }}
//       />
//       <Tabs.Screen
//         name="explore"
//         options={{
//           title: 'Explore',
//           tabBarIcon: ({ color }) => <IconSymbol size={28} name="paperplane.fill" color={color} />,
//         }}
//       />
//       <Tabs.Screen
//         name="mapDisplay"
//         options = {{
//           title: 'Mapping',
//           tabBarIcon: ({ color }) => <IconSymbol size={28} name="map.fill" color={color} />,
//         }}
//         />
        
//         <Tabs.Screen
//         name="Splash"
//         options = {{
//           title: 'Splash',
//           tabBarIcon: ({ color }) => <IconSymbol size={28} name="paperplane.fill" color={color} />,
//         }}
//         />
//         <Tabs.Screen
//         name="signIn"
//         options = {{
//           title: 'SignIn',
//           tabBarIcon: ({ color }) => <IconSymbol size={28} name="cat.fill" color={color} />,
//         }}
//         />
//        <Tabs.Screen
//         name="signIn"
//         options = {{
//           title: 'Mapping',
//           tabBarIcon: ({ color }) => <IconSymbol size={28} name="map.fill" color={color} />,
//         }}
//         />
//     </Tabs>
//   );
// }
