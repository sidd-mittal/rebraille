import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Home  from './home'; // Adjust paths
import Profile from './profile';
import Templates from './templates'

const Tab = createBottomTabNavigator();

export default function Tabs() {
  return (
    <Tab.Navigator  screenOptions={{
      headerShown: false}}>
      <Tab.Screen name="Draw" component={Home}    />
      <Tab.Screen name="Templates" component={Templates}    />
      <Tab.Screen name="Profile" component={Profile}    />

    </Tab.Navigator>
  );
}
