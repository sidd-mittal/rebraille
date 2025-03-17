import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Home  from './home'; // Adjust paths
import Profile from './profile';
import Templates from './templates'
import { Ionicons } from 'react-native-vector-icons';

const Tab = createBottomTabNavigator();

export default function Tabs() {
  return (
    <Tab.Navigator screenOptions={{headerShown: false}}>
      <Tab.Screen name="Draw" component={Home}    options={{ headerShown: false, tabBarIcon: ({ color, size }) => (
              <Ionicons name="pencil" size={size} color={color} />
            ),}}   />
      <Tab.Screen name="Templates" component={Templates}   options={{ headerShown: false, tabBarIcon: ({ color, size }) => (
              <Ionicons name="document" size={size} color={color} />
            ),}} />
      <Tab.Screen name="Profile" component={Profile}   options={{ headerShown: false, tabBarIcon: ({ color, size }) => (
              <Ionicons name="person" size={size} color={color} />
            ),}} />

    </Tab.Navigator>
  );
}
