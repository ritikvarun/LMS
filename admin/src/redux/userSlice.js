import { createSlice } from "@reduxjs/toolkit";

export const defaultAdmin = {
    _id: "6aa44c0ac629c9b4f227ed46",
    name: "Ritik Varun",
    email: "ritikvarun65@gmail.com",
    role: "educator"
};

let savedUser = null;
try {
  const raw = localStorage.getItem("admin_user");
  if (raw) savedUser = JSON.parse(raw);
} catch (e) {}

const userSlice = createSlice({
    name: "user",
    initialState: {
        userData: savedUser
    },
    reducers: {
        setUserData: (state, action) => {
            state.userData = action.payload;
            try {
                if (action.payload) {
                    localStorage.setItem("admin_user", JSON.stringify(action.payload));
                } else {
                    localStorage.removeItem("admin_user");
                    localStorage.removeItem("admin_token");
                }
            } catch (e) {}
        }
    }
});

export const { setUserData } = userSlice.actions;
export default userSlice.reducer;