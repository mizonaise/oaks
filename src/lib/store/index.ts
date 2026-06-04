import { configureStore } from "@reduxjs/toolkit";
import { tecniboApi } from "./api/tecniboApi";

export const makeStore = () => {
  return configureStore({
    reducer: {
      [tecniboApi.reducerPath]: tecniboApi.reducer,
      // Add more reducers here
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(tecniboApi.middleware),
  });
};

// Inferred types from the store itself
export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
