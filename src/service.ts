import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { axiosRequest } from './common';
import { HOYOLAB_DAILY_API_URL, REPORT_BORDER_RESIN_RECOVERY_TIME, REPORT_BORDER_HOME_COIN_RECOVERY_TIME, DAILY_REWARD_NOTIFY_OCLOCK } from './const';
import { HoyoLabDailyApiResponse, HoyoLabDailyApiTransformer, HoyoLabDailyApiExpeditions } from './types';

export async function requestHoyoLabApi (): Promise<HoyoLabDailyApiResponse | void> {
    const headers = buildHoyoLabCookie();
    const requestOptions = {
      url: HOYOLAB_DAILY_API_URL,
      method: 'GET',
      params: {
          role_id: process.env['USER_ID'] ?? '',
          server: 'os_asia',
          schedule_type: 1,
      },
      headers: headers
    };

    return await axiosRequest<HoyoLabDailyApiResponse>(requestOptions);
}

export async function report (hoyoLabDailyApiResponse: HoyoLabDailyApiResponse): Promise<void | String> {
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

    return await requestDidcordWebhook({ reportResin, reportHomeCoin, reportTransformer, reportExpeditions, reportDailyTask });
}

function buildHoyoLabCookie () {
    return {
        Cookie: `ltoken_v2=${process.env['HOYOLAB_COOKIE_LTOKEN']}; ltuid_v2=${process.env['HOYOLAB_COOKIE_LUID']}`,
    };
}

function reportForResinRecoveryTime (resinRecoveryTime: string): boolean {
    if (REPORT_BORDER_RESIN_RECOVERY_TIME < 0) return false;

    return REPORT_BORDER_RESIN_RECOVERY_TIME > Number(resinRecoveryTime);
}

function reportForHomeCoinRecoveryTime (homeCoinRecoveryTime: string): boolean {
    if (REPORT_BORDER_HOME_COIN_RECOVERY_TIME < 0) return false;

    return REPORT_BORDER_HOME_COIN_RECOVERY_TIME > Number(homeCoinRecoveryTime);
}

function reportAvailableOnTransformer (transformer: HoyoLabDailyApiTransformer): boolean {
    return transformer.recovery_time.reached;
}

function reportExpeditionsFinished (expeditions: HoyoLabDailyApiExpeditions[]): boolean {
    const finishedExpeditions = expeditions.filter(ele => ele.status === 'Finished');
    return finishedExpeditions.length > 0;
}

function reportDailyTaskRewardNotObtained (isExtraTaskRewardReceived: boolean): boolean {
    // こんなところでやるな
    dayjs.extend(utc);
    dayjs.extend(timezone);
    dayjs.tz.setDefault("Asia/Tokyo");

    // 指定した時刻以降
    const now = dayjs().tz();
    return !isExtraTaskRewardReceived && now.hour() >= DAILY_REWARD_NOTIFY_OCLOCK;
}

async function requestDidcordWebhook (
    params: {
        reportResin: boolean;
        reportHomeCoin: boolean;
        reportTransformer: boolean;
        reportExpeditions: boolean;
        reportDailyTask: boolean
    },
): Promise<void | string> {
    if (!Object.values(params).filter(v => v).length) {
        return;
    }

    const {
        reportResin,
        reportHomeCoin,
        reportTransformer,
        reportExpeditions,
        reportDailyTask,
    } = params;

    const content = buildNotifyMessage({ reportResin, reportHomeCoin, reportTransformer, reportExpeditions, reportDailyTask });

    const requestOptions = {
        url    : process.env['DISCORD_WEBHOOK_URL']!,
        method : 'POST',
        data   : { content },
        headers: { 'Content-Type': 'application/json' },
    };

    return await axiosRequest<void | string>(requestOptions);
}

function buildNotifyMessage (
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