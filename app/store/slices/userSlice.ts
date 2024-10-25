"use client"
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { RootState } from "../store";
import { IAuth, IUser } from "@/app/interfaces/interfaces";
import { currentUser, login, register, updateUser, getSkills } from "@/app/api";
import { sliceHelper } from "./sliceHelper";

interface ICurrentUserState {
  user: IUser | null;
  loading: boolean;
  error: string | null;
}

const initialState: ICurrentUserState = {
  user: null,
  loading: false,
  error: null,
};

export const fetchCurrentUser = createAsyncThunk("currentUser", async () => {
  try {
    const user = await currentUser();
    return user;
  } catch (error) {
    throw error;
  }
});

export const fetchSkills = createAsyncThunk("skills", async () => {
  try {
    const skills = await getSkills();
    return skills;
  } catch (error) {
    throw error;
  }
});

export const fetchLogin = createAsyncThunk("login", async (body: IAuth) => {
  try {
    await login(body);
    const user = await currentUser();
    return user;
  } catch (error) {
    throw error;
  }
});

export const fetchRegistration = createAsyncThunk(
  "register",
  async (body: IAuth) => {
    try {
      await register(body);
      const user = await currentUser();
      return user;
    } catch (error) {
      throw error;
    }
  }
);

export const fetchUpdate = createAsyncThunk("update", async (formData: any) => {
  try {
    return await updateUser(formData);
  } catch (error) {
    throw error;
  }
});

const currentUserSlice = createSlice({
  name: "currentUser",
  initialState,
  reducers: {
    logout(state) {
      state.loading = true;
      state.error = null;
      state.user = null;
      //@ts-ignore
      state.skills = [],
      localStorage.setItem("token", "");
    },
  },
  extraReducers: (builder) => {
    sliceHelper(builder, fetchCurrentUser).addCase(
      fetchCurrentUser.fulfilled,
      (state: any, action: any) => {
        state.loading = false;
        state.user = action.payload as IUser;
      },
    );
    sliceHelper(builder, fetchLogin).addCase(
      fetchLogin.fulfilled,
      (state: any, action: any) => {
        state.loading = false;
        state.user = action.payload as IUser;
      }
    );
    sliceHelper(builder, fetchRegistration).addCase(
      fetchRegistration.fulfilled,
      (state: any, action: any) => {
        state.loading = false;
        state.user = action.payload as IUser;
      }
    );
    sliceHelper(builder, fetchUpdate).addCase(
      fetchUpdate.fulfilled,
      (state: any, action: any) => {
        state.loading = false;
        state.user = action.payload as IUser;
      }
    );
  },
});




export const { logout } = currentUserSlice.actions;

export const selectCurrentUser = (state: RootState) => state.currentUser;

export default currentUserSlice.reducer;
