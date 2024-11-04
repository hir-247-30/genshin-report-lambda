import dayjs from 'dayjs'
import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { HoyoLabDailyApiResponse, LineNotifyResponse, HoyoLabDailyApiTransformer, HoyoLabDailyApiExpeditions } from './types';

const REPORT_BORDER_RESIN_RECOVERY_TIME = 7200;
const REPORT_BORDER_HOME_COIN_RECOVERY_TIME = 36000;
const DAILY_REWARD_NOTIFY_OCLOCK = 21;

export function buildHoyoLabCookie() {
    return {
        Cookie: `ltoken_v2=${process.env['HOYOLAB_COOKIE_LTOKEN']}; ltuid_v2=${process.env['HOYOLAB_COOKIE_LUID']}`,
    };
  }
  
export async function axiosRequest<T>(requestOptions: {
    url: string;
    method: string;
    params?: { [key: string]: string | number; };
    headers?: { [key: string]: string; };
}) {
    const {
        url,
        method,
        params,
        headers,
    } = requestOptions;
  
    const options: AxiosRequestConfig = {
        url,
        method,
        params,
        headers,
    };
  
    return axios(options)
        .then((res: AxiosResponse<T>) => {
            return res.data;
        })
        .catch((e: AxiosError<{ error: string; }>) => {
            console.log(e.message);
            return undefined;
        });
  }

  export async function checkAndReport(hoyoLabDailyApiResponse: HoyoLabDailyApiResponse): Promise<void | LineNotifyResponse> {
    const {
        retcode,
        message,
        data,
    } = hoyoLabDailyApiResponse;

    if(retcode !== 0){
        throw new Error(`Irregular response retcode : ${retcode}`);
    }

    if(message !== 'OK'){
       throw new Error(`Irregular response message : ${message}`);
    }

    if(data == null){
        throw new Error(`Irregular response data : is null`);
    }

    // 樹脂
    const reportResin = reportForResinRecoveryTime(data.resin_recovery_time);
    // 洞天集宝盆
    const reportHomeCoin = reportForHomeCoinRecoveryTime(data.home_coin_recovery_time);
    // 参量物質変化器
    const reportTransformer = reportAvailableOnTransformer(data.transformer);
    // 探索派遣
    const reportExpeditions = reportExpeditionsFinished(data.expeditions);
    // デイリー任務
    const reportDailyTask = reportDailyTaskRewardNotObtained(data.is_extra_task_reward_received);

    return await executeReport({ reportResin, reportHomeCoin, reportTransformer, reportExpeditions, reportDailyTask });
}

async function executeReport(
    params: {
        reportResin: boolean;
        reportHomeCoin: boolean;
        reportTransformer: boolean;
        reportExpeditions: boolean;
        reportDailyTask: boolean
    },
): Promise<void | LineNotifyResponse> {
    const {
        reportResin,
        reportHomeCoin,
        reportTransformer,
        reportExpeditions,
        reportDailyTask,
    } = params;

    if (!reportResin && !reportHomeCoin && !reportTransformer && !reportExpeditions && !reportDailyTask) {
        return;
    }

    const message = buildNotifyMessage({ reportResin, reportHomeCoin, reportTransformer, reportExpeditions, reportDailyTask });

    const requestOptions = {
        url: 'https://notify-api.line.me/api/notify',
        method: 'POST',
        params: {
            message,
        },
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Bearer ${process.env['PERSONAL_LINE_ACCESS_TOKEN']}`,
        },
    };

    return await axiosRequest<LineNotifyResponse>(requestOptions);
}

function reportForResinRecoveryTime(resinRecoveryTime: string): boolean {
    if (REPORT_BORDER_RESIN_RECOVERY_TIME < 0) return false;

    return REPORT_BORDER_RESIN_RECOVERY_TIME > Number(resinRecoveryTime);
}

function reportForHomeCoinRecoveryTime(homeCoinRecoveryTime: string): boolean {
    if (REPORT_BORDER_HOME_COIN_RECOVERY_TIME < 0) return false;

    return REPORT_BORDER_HOME_COIN_RECOVERY_TIME > Number(homeCoinRecoveryTime);
}

function reportAvailableOnTransformer(transformer: HoyoLabDailyApiTransformer): boolean {
    return transformer.recovery_time.reached;
}

function reportExpeditionsFinished(expeditions: HoyoLabDailyApiExpeditions[]): boolean {
    const finishedExpeditions = expeditions.filter(ele => ele.status === 'Finished');
    return finishedExpeditions.length > 0;
}

function reportDailyTaskRewardNotObtained(isExtraTaskRewardReceived: boolean): boolean {
    // 指定した時刻以降
    const now = dayjs();
    return !isExtraTaskRewardReceived && now.hour() >= DAILY_REWARD_NOTIFY_OCLOCK;
}

function buildNotifyMessage(
    params: {
        reportResin: boolean;
        reportHomeCoin: boolean;
        reportTransformer: boolean;
        reportExpeditions: boolean;
        reportDailyTask: boolean
    }): string {
    const {
        reportResin,
        reportHomeCoin,
        reportTransformer,
        reportExpeditions,
        reportDailyTask,
    } = params;

    const resinMessage = reportResin ? '\n樹脂があふれそうだぞ！' : '';
    const homeCoinMessage = reportHomeCoin ? '\n洞天集宝盆があふれそうだぞ！' : '';
    const transformerMessage = reportTransformer ? '\n参量物質変化器が使用可能になったぞ！' : '';
    const expeditionsMessage = reportExpeditions ? '\n探索派遣が終わったぞ！' : '';
    const dailyTaskMessage = reportDailyTask ? '\nデイリー任務の報告がまだ終わってないぞ！' : '';

    return `\nおい！${resinMessage}${homeCoinMessage}${transformerMessage}${expeditionsMessage}${dailyTaskMessage}`;
}