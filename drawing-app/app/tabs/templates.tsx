import React from "react";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { NavigationContainer } from "@react-navigation/native";
import { View, Text } from "react-native";
import saved from './template_tabs/saved'
import Premade from './template_tabs/premade'
import Shapes from './template_tabs/shapes'
import { SafeAreaView } from 'react-native';
  {/* Your tab navigator here */}

const TopTab = createMaterialTopTabNavigator();
export default function MyTopTabs() {
  return (
<SafeAreaView style={{ flex: 1 }}>
    <TopTab.Navigator
           screenOptions={{
            tabBarScrollEnabled: false,  // Disable horizontal scrolling
            tabBarStyle: {
              width: '100%',  // Ensure the tab bar uses full width
              paddingHorizontal: 0,  // Prevent unnecessary padding
            },
          }}>
      <TopTab.Screen name="Saved Drawings" component={saved} />
      <TopTab.Screen name="Shapes" component={Shapes} />
      <TopTab.Screen name="Letters" component={Premade} />
    </TopTab.Navigator>
    </SafeAreaView>

  );
}
