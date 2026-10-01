import { createSlice } from "@reduxjs/toolkit";

export const defaultAdmin = {
    _id: "6aa44c0ac629c9b4f227ed46",
    name: "Ritik Varun",
    email: "ritikvarun65@gmail.com",
    role: "educator"
};

const userSlice = createSlice({
    name: "user",
    initialState: {
        userData: defaultAdmin
    },
    reducers: {
        setUserData: (state, action) => {
            state.userData = action.payload || defaultAdmin;
        }
    }
});

export const { setUserData } = userSlice.actions;
export default userSlice.reducer;