import { useEffect } from "react"
import { serverUrl } from "../App"
import axios from "axios"
import { useDispatch } from "react-redux"
import { setUserData } from "../redux/userSlice"

const getCurrentUser = () => {
    let dispatch = useDispatch()
   
    useEffect(() => {
        const fetchUser = async () => {
            const token = localStorage.getItem("admin_token");
            try {
                let result = await axios.get(serverUrl + "/api/user/currentuser", { withCredentials: true });
                if (result.data) {
                    dispatch(setUserData(result.data));
                }
            } catch (error) {
                if (!token) {
                    dispatch(setUserData(null));
                }
            }
        }
        fetchUser()
    }, [dispatch])
}

export default getCurrentUser