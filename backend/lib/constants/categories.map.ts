export interface CategoryConfig {
    viewName: string;
    redisKey: string;
}


export const CATEGORIES: { [key: string]: CategoryConfig } = {
    'top-500-revenue': {
        viewName: 'view_top_500_revenue',
        redisKey: 'redis_top_500_revenue'
    },
    'horrors': {
        viewName: 'view_horrors',
        redisKey: 'redis_horrors'
    },
    'cartoons': {
        viewName: 'view_cartoons',
        redisKey: 'redis_cartoons'
    }
};
