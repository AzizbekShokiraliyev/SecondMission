import type { AuthState, UserDataAuth } from '@/interface/Interface';
import { createSlice, type PayloadAction } from '@reduxjs/toolkit'; 

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true, 
};

const authSilce = createSlice({
    name: "auth", 
    initialState,
    reducers: {
        setUser: (state, action: PayloadAction<UserDataAuth | null>) => {
            state.user = action.payload;
            state.isAuthenticated = !!action.payload;
            state.isLoading = false;
        },
        logout: (state) => {
            state.user = null;
            state.isAuthenticated = false;
            state.isLoading = false;
        }
    }
})

export const {setUser, logout} = authSilce.actions
export default authSilce.reducer