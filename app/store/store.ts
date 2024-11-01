import coursesSlice from "./slices/coursesSlice";
import currentCourseSlice from "./slices/currentCourseSlice";
import currentUserSlice from "./slices/userSlice";
import { configureStore } from "@reduxjs/toolkit";

export const makeStore = () => {
  return configureStore({
    reducer: {
      currentUser: currentUserSlice,
      courses: coursesSlice,
      currentCourse: currentCourseSlice,
    },
  });
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
