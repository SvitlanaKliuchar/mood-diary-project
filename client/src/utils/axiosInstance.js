//centralize configuration and interceptors
import axios from 'axios'

const axiosInstance = axios.create({
    baseURL: '/api',
    withCredentials: true,
})

export const setupInterceptors = (store) => {
    axiosInstance.interceptors.response.use(
        (response) => response, //if the response is successful, just return it
        async (error) => {
            const originalRequest = error.config

            //if the error is 401 and the original req hasnt been retried yet
            if (
                error.response &&
                error.response.status === 401 &&
                !originalRequest._retry
            ) {
                originalRequest._retry = true //mark the request as retried
                try {
                    //refresh the access token
                    const refreshResponse = await axiosInstance.post("/auth/refresh")

                    if (refreshResponse.status === 200) {
                        //retry the original request with the new access token
                        return axiosInstance(originalRequest)
                    }
                } catch (refreshError) {
                    //if refresh fails, log the user out
                    store.logout()
                    return Promise.reject(refreshError)
                }
            }

            return Promise.reject(error) //if the error isnt 401 or refresh fails
        }
    )
}


export default axiosInstance