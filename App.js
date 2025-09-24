import { DefaultTheme, NavigationContainer } from "@react-navigation/native";
import React from "react";
import 'react-native-gesture-handler';
import { Provider } from "react-redux";
import RootNavigator from "./navigation/RootNavigator";
import store from "./store/store";

export default function App() {
  const theme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: '#f3f3f3',
    },
  };
  return (
    <Provider store={store}>
      <NavigationContainer theme={theme}>
        <RootNavigator />
      </NavigationContainer>
    </Provider>
  );
}
