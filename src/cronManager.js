import { getState, StateKeys, setState } from './state.js';
import { loadData } from './dataManager.js';

/**
 * Handles the cron job that runs every minute to update time inputs in realtime mode
 */
export function cronMinute() {
    const realtime = getState(StateKeys.REALTIME);
    if (!realtime) return;
    
    const now = new Date();
    const fourHoursAgo = new Date(now.getTime() - 4 * 60 * 60 * 1000);
    
    // Update state with new times
    setState(StateKeys.ETS, now);
    setState(StateKeys.STS, fourHoursAgo);
    
    // Load data with new time window
    setTimeout(loadData, 0);
}

/**
 * Start periodic tasks
 */
export function startCronTasks() {
    window.setInterval(() => cronMinute(), 60000);
}
