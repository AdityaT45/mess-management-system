// src/store/store.js
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import messReducer from "./slices/messSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    mess: messReducer,
  },
});

export default store;
