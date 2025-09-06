
import axios from 'axios';
import { toast } from "sonner";

let loadingToastId: string | number | null = null;

const instance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  withCredentials: true,
});

//Since backend is deployed on render so this interceptor for axios is needed 
//interceptor is like a middleware from axios that will run before sending request or before receving response 

// request interceptor -> runs before the request leaves the frontend.
instance.interceptors.request.use((config) => {
  // show persistent toast only if not already shown

  if (!loadingToastId) {
    loadingToastId = toast.loading("Please wait... waking up the server");
  }
  return config;

});


// response interceptor -> runs before the response reaches the code
instance.interceptors.response.use(
  (response) => {

    //loadingToastId was present then that means request of backend was delayed and toast was shown -> so dismiss it 
    if (loadingToastId) {
      toast.dismiss(loadingToastId);
      loadingToastId = null;
    }
    return response;
  },
  (error) => {
    if (loadingToastId) {
      toast.dismiss(loadingToastId);
      loadingToastId = null;
    }
    return Promise.reject(error);
  }
);

export default instance;