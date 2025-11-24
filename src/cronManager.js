import { getState, StateKeys, setState } from './state.js';
import { loadData } from './dataManager.js';

let cronIntervalId = null;

/**
 * Handles the cron job that runs every minute to update time inputs in realtime mode.
 * Updates the start and end timestamps based on the configured time window,
 * then triggers a data reload.
 * @returns {void}
 */
export function cronMinute() {
    const realtime = getState(StateKeys.REALTIME);
    if (!realtime) {
        return;
    }
    
    const now = new Date();
    const seconds = getState(StateKeys.SECONDS);
    if (typeof seconds !== 'number' || seconds <= 0) {
        console.error('Invalid seconds value in state:', seconds);
        return;
    }
    const windowStart = new Date(now.getTime() - seconds * 1000);
    
    setState(StateKeys.ETS, now);
    setState(StateKeys.STS, windowStart);
    
    loadData();
}

/**
 * Starts periodic tasks that run on a fixed interval.
 * Currently schedules the minute-based cron job for realtime updates.
 * @returns {void}
 */
export function startCronTasks() {
    if (cronIntervalId !== null) {
        return;
    }
    cronIntervalId = window.setInterval(cronMinute, 60000);
}

/**
 * Stops all periodic cron tasks.
 * @returns {void}
 */
export function stopCronTasks() {
    if (cronIntervalId !== null) {
        window.clearInterval(cronIntervalId);
        cronIntervalId = null;
    }
}
