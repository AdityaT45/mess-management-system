// # Decides if Auth or Role-based navigator

// src/navigation/RootNavigator.js
import React from "react";
import { useSelector } from "react-redux";
import AdminNavigator from "./AdminNavigator";
import AuthNavigator from "./AuthNavigator";
import SuperAdminNavigator from "./SuperAdminNavigator";
import UserNavigator from "./UserNavigator";

export default function RootNavigator() {
  const { isAuthenticated, role } = useSelector((state) => state.auth);

  // Debug logging
  console.log('RootNavigator - Auth State:', { isAuthenticated, role });

  if (!isAuthenticated) {
    console.log('RootNavigator - Not authenticated, showing AuthNavigator');
    return <AuthNavigator />;
  }

  console.log('RootNavigator - Authenticated, role:', role);

  switch (role) {
    case "user":
      console.log('RootNavigator - Routing to UserNavigator');
      return <UserNavigator />;
    case "admin":
      console.log('RootNavigator - Routing to AdminNavigator');
      return <AdminNavigator />;
    case "superadmin":
      console.log('RootNavigator - Routing to SuperAdminNavigator');
      return <SuperAdminNavigator />;
    default:
      console.log('RootNavigator - Unknown role, defaulting to AuthNavigator');
      return <AuthNavigator />;
  }
}
