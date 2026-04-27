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
    },
    'polish': {
        viewName: 'view_polish_movies',
        redisKey: 'redis_polish_movies'
    },
    'oscar-winners': {
        viewName: 'view_oscar_winners',
        redisKey: 'redis_oscar_winners'
    },
    'top-rotten-tomatoes': {
        viewName: 'view_top_rotten_tomatoes',
        redisKey: 'redis_top_rotten_tomatoes'
    }
};
