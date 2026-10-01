import { useEffect } from "react"
import { serverUrl } from "../App"
import axios from "axios"
import { useDispatch } from "react-redux"
import { setUserData, defaultAdmin } from "../redux/userSlice"

const getCurrentUser = () => {
    let dispatch = useDispatch()
   
    useEffect(() => {
        const fetchUser = async () => {
            try {
                let result = await axios.get(serverUrl + "/api/user/currentuser", { withCredentials: true });
                if (result.data) {
                    dispatch(setUserData(result.data));
                }
            } catch (error) {
                // Fallback to default admin for direct access
                dispatch(setUserData(defaultAdmin));
            }
        }
        fetchUser()
    }, [dispatch])
}

export default getCurrentUser