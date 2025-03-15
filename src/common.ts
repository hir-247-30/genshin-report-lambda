import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';

export async function axiosRequest<T> (requestOptions: AxiosRequestConfig) {
    return axios(requestOptions)
        .then((res: AxiosResponse<T>) => {
            return res.data;
        })
        .catch((e: AxiosError<{ error: string; }>) => {
            console.log(e.message);
        }
    );
}