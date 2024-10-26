const MAX_RESIN = 200;
const MAX_HOME_COIN = 1200;
const DAILY_TASK_NUMBER = 4;

export type HoyoLabDailyApiResponse = {
    retcode: number;
    message: string;
    data: HoyoLabDailyApiData | null;
};

type HoyoLabDailyApiData = {
    // 現在の樹脂
    current_resin: number;
    // 樹脂の上限
    max_resin: typeof MAX_RESIN;
    // 樹脂があふれるまでの時間
    resin_recovery_time: string;
    finished_task_num: number;
    total_task_num: number;
    is_extra_task_reward_received: boolean;
    remain_resin_discount_num: number;
    resin_discount_num_limit: number;
    current_expedition_num: number;
    max_expedition_num: number;
    // 探索派遣
    expeditions: HoyoLabDailyApiExpeditions[];
    // 現在の洞天集宝盆
    current_home_coin: number;
    // 洞天集宝盆の上限
    max_home_coin: typeof MAX_HOME_COIN;
    // 洞天集宝盆があふれるまでの時間
    home_coin_recovery_time: string;
    calendar_url: string;
    // 参量物質変化器
    transformer: HoyoLabDailyApiTransformer;
    daily_task: HoyoLabDailyApiDailyTask;
};

// 探索派遣
export type HoyoLabDailyApiExpeditions = {
    avatar_side_icon: string;
    status: string;
    remained_time: string;
};

// 参量物質変化器
export type HoyoLabDailyApiTransformer = {
    obtained: boolean;
    // 再使用可能までの時間情報
    recovery_time: {
        Day: number;
        Hour: number;
        Minute: number;
        Second: number;
        // 再使用可能かどうか
        reached: boolean;
    };
    wiki: string;
    noticed: boolean;
    latest_job_id: string;
};

// デイリー任務
type HoyoLabDailyApiDailyTask = {
    // 総数
    total_num: typeof DAILY_TASK_NUMBER;
    // 今日終わった数
    finished_num: number;
    // デイリー任務完了報告の有無
    is_extra_task_reward_received: boolean;
};

export type LineNotifyResponse = {
    status: string;
    message: string;
};