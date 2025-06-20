// src/utils/rateLimiter.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Config } from '../config';

const RATE_LIMIT_KEY = 'API_RATE_LIMITS';

interface RateLimitData {
    amazon: {
        count: number;
        weekNumber: number;
    };
    lastReset: string;
}

export const checkRateLimit = async (apiName: 'AMAZON' | 'GOOGLE'): Promise<boolean> => {
    const now = new Date();
    const currentWeek = getWeekNumber(now);
    const apiConfig = Config.API_RATE_LIMITS[apiName];

    if (apiConfig.WEEKLY_LIMIT === 0) return true;

    try {
        const savedData = await AsyncStorage.getItem(RATE_LIMIT_KEY);
        let rateLimitData: RateLimitData = savedData
            ? JSON.parse(savedData)
            : { amazon: { count: 0, weekNumber: currentWeek }, lastReset: now.toISOString() };

        if (shouldResetCounter(rateLimitData, currentWeek)) {
            rateLimitData = {
                amazon: { count: 0, weekNumber: currentWeek },
                lastReset: now.toISOString()
            };
        }

        if (apiName === 'AMAZON') {
            if (rateLimitData.amazon.count >= apiConfig.WEEKLY_LIMIT) {
                return false;
            }

            rateLimitData.amazon.count += 1;
            await AsyncStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(rateLimitData));
        }

        return true;
    } catch (error) {
        console.error('Error checking rate limit:', error);
        return true;
    }
};

const getWeekNumber = (date: Date): number => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
};

const shouldResetCounter = (rateLimitData: RateLimitData, currentWeek: number): boolean => {
    const resetDay = Config.API_RATE_LIMITS.AMAZON.RESET_DAY;
    const lastResetDate = new Date(rateLimitData.lastReset);
    const now = new Date();

    return (
        rateLimitData.amazon.weekNumber !== currentWeek ||
        (now.getDay() === resetDay && lastResetDate.getDay() !== resetDay)
    );
};