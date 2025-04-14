// import React from "react";
import { View, Text } from "react-native";
import saved from './template_tabs/saved'
import Premade from './template_tabs/premade'
import Shapes from './template_tabs/shapes'

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useUser } from '../UserContext';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <Tab.Navigator
    screenOptions={{
      tabBarPosition: 'top', // Move tab bar to the top`
      tabBarStyle: {
        borderTopWidth: 0, // Optionally remove the border
        height: 100, // Adjust height of the tab bar
        paddingBottom: 5, // Adjust bottom padding
      },
     tabBarLabelStyle: {
      fontSize: 16, // Adjust the size as needed
      fontWeight: 'bold', // Optional for better visibility
      
    },
    headerShown: false,
    tabBarIcon: () => null, // Disable the triangle icon
    }}
  >
        <Tab.Screen name="Saved Drawings" component={saved} />

        <Tab.Screen name="Letters" component={Premade} />
        <Tab.Screen name="Shapes" component={Shapes} />
      </Tab.Navigator>
  );
}