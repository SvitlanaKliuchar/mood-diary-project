import { createContext, useState, useEffect } from 'react'
import axios from 'axios'

export const AuthContext = createContext(null)

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const checkUser = async () => {
            try {
                const { data } = await axios.get('/api/me', {
                    withCredentials: true,
                })
                if (data?.user) {
                    setUser(data.user)
                }
            } catch (err) {
                console.error('Error checking user data: ', err)
            } finally {
                setLoading(false)
            }
        }
        checkUser()
    }, [])
    const login = async (credentials) => {
        //call the server login endpoint
        //on success the server sets HttpOnly cookie
        try {
            const { data, status } = await axios.post('/api/login', credentials, {
                withCredentials: true, headers: { 'Content-Type': 'application/json' }
            })
            if (status === 200 && data?.user) {
                setUser(data.user)
                return true
            } else {
                return false
            }
        } catch (err) {
            console.error('Error getting data after user login: ', err)
            return false
        }
    }


    const logout = async () => {
        try {
            await axios.post('/api/logout', {}, { withCredentials: true })
            setUser(null)
        } catch (err) {
            console.error('Error during user logout: ', err)
        }
    }

    return (
        <AuthContext.Provider value={{user, loading, login, logout}}>
            {children}
        </AuthContext.Provider>
    )

}
export default AuthProvider

