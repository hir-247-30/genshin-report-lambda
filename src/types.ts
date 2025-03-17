import { MAX_RESIN, MAX_HOME_COIN, DAILY_TASK_NUMBER } from './const';

export type HoyoLabDailyApiResponse = {
    retcode: number;
    message: string;
    data   : HoyoLabDailyApiData | null;
};

type HoyoLabDailyApiData = {
    current_resin                : number; // 現在の樹脂
    max_resin                    : typeof MAX_RESIN; // 樹脂の上限
    resin_recovery_time          : string; // 樹脂があふれるまでの時間
    finished_task_num            : number;
    total_task_num               : number;
    is_extra_task_reward_received: boolean;
    remain_resin_discount_num    : number;
    resin_discount_num_limit     : number;
    current_expedition_num       : number; // 探索派遣
    max_expedition_num           : number;
    expeditions                  : HoyoLabDailyApiExpeditions[];
    current_home_coin            : number; // 現在の洞天集宝盆
    max_home_coin                : typeof MAX_HOME_COIN; // 洞天集宝盆の上限
    home_coin_recovery_time      : string; // 洞天集宝盆があふれるまでの時間
    calendar_url                 : string; 
    transformer                  : HoyoLabDailyApiTransformer; // 参量物質変化器
    daily_task                   : HoyoLabDailyApiDailyTask;
};

// 探索派遣
export type HoyoLabDailyApiExpeditions = {
    avatar_side_icon: string;
    status          : string;
    remained_time   : string;
};

// 参量物質変化器
export type HoyoLabDailyApiTransformer = {
    obtained     : boolean;
    recovery_time: { // 再使用可能までの時間情報
        Day    : number;
        Hour   : number;
        Minute : number;
        Second : number;
        reached: boolean; // 再使用可能かどうか
    };
    wiki         : string;
    noticed      : boolean;
    latest_job_id: string;
};

// デイリー任務
type HoyoLabDailyApiDailyTask = {
    total_num                    : typeof DAILY_TASK_NUMBER; // 総数
    finished_num                 : number; // 今日終わった数
    is_extra_task_reward_received: boolean; // デイリー任務完了報告の有無
};