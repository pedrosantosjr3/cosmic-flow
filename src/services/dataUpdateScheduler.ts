import { enhancedNasaAPI } from './enhancedNasaAPI';
import { globalWeatherAPI } from './globalWeatherAPI';

interface ScheduledTask {
  id: string;
  name: string;
  interval: number;
  lastRun: Date | null;
  nextRun: Date;
  task: () => Promise<void>;
}

class DataUpdateScheduler {
  private tasks: Map<string, ScheduledTask> = new Map();
  private timers: Map<string, NodeJS.Timeout> = new Map();
  private readonly STORAGE_KEY = 'universal-sim-update-schedule';

  constructor() {
    this.loadScheduleFromStorage();
    this.initializeTasks();
    this.startScheduler();
  }

  private initializeTasks() {
    // NEO data update task - runs daily at 3 AM
    this.registerTask({
      id: 'neo-update',
      name: 'Near Earth Objects Update',
      interval: 24 * 60 * 60 * 1000, // 24 hours
      task: async () => {
        console.log('Running daily NEO update...');
        try {
          const neoData = await enhancedNasaAPI.getCurrentNEOs();
          this.saveToLocalStorage('neo-data', neoData);
          this.updateLastRunTime('neo-update');
          console.log('NEO update completed successfully');
        } catch (error) {
          console.error('Failed to update NEO data:', error);
        }
      }
    });

    // Weather data update task - runs every 6 hours (weather changes more frequently)
    this.registerTask({
      id: 'weather-update',
      name: 'Earth Weather Update',
      interval: 6 * 60 * 60 * 1000, // 6 hours
      task: async () => {
        console.log('Running weather update...');
        try {
          // Force refresh to get latest global weather data
          const weatherData = await enhancedNasaAPI.getCurrentWeatherData(true);
          this.saveToLocalStorage('weather-data', weatherData);
          this.updateLastRunTime('weather-update');
          console.log(`Weather update completed successfully. ${weatherData.alerts.length} alerts, ${weatherData.globalEvents.length} catastrophic events.`);
        } catch (error) {
          console.error('Failed to update weather data:', error);
        }
      }
    });
    
    // Catastrophic events update task - runs every 4 hours for critical events
    this.registerTask({
      id: 'catastrophic-update',
      name: 'Catastrophic Events Update',
      interval: 4 * 60 * 60 * 1000, // 4 hours
      task: async () => {
        console.log('Running catastrophic events update...');
        try {
          // Check which events need updates based on their individual intervals
          const eventsNeedingUpdate = await globalWeatherAPI.getEventsNeedingUpdate();
          if (eventsNeedingUpdate.length > 0) {
            // Force refresh global weather data to get latest catastrophic event updates
            const globalData = await globalWeatherAPI.getGlobalWeatherData();
            this.saveToLocalStorage('catastrophic-events', globalData.catastrophicEvents);
            this.updateLastRunTime('catastrophic-update');
            console.log(`Catastrophic events update completed. ${eventsNeedingUpdate.length} events updated.`);
          } else {
            console.log('No catastrophic events require updates at this time.');
          }
        } catch (error) {
          console.error('Failed to update catastrophic events:', error);
        }
      }
    });
  }

  private registerTask(config: Omit<ScheduledTask, 'lastRun' | 'nextRun'>) {
    const savedSchedule = this.getSavedSchedule();
    const savedTask = savedSchedule[config.id];
    
    const lastRun = savedTask?.lastRun ? new Date(savedTask.lastRun) : null;
    const nextRun = this.calculateNextRun(lastRun, config.interval);

    const task: ScheduledTask = {
      ...config,
      lastRun,
      nextRun
    };

    this.tasks.set(config.id, task);
  }

  private calculateNextRun(lastRun: Date | null, interval: number): Date {
    if (!lastRun) {
      // If never run, schedule for next 3 AM
      const next = new Date();
      next.setHours(3, 0, 0, 0);
      if (next <= new Date()) {
        next.setDate(next.getDate() + 1);
      }
      return next;
    }

    // Calculate next run based on last run + interval
    return new Date(lastRun.getTime() + interval);
  }

  private startScheduler() {
    // Check and run tasks every minute
    const checkInterval = setInterval(() => {
      this.checkAndRunTasks();
    }, 60 * 1000); // Check every minute

    // Run immediate check
    this.checkAndRunTasks();

    // Store the interval for cleanup
    this.timers.set('main-scheduler', checkInterval);
  }

  private async checkAndRunTasks() {
    const now = new Date();

    for (const [, task] of this.tasks) {
      if (now >= task.nextRun) {
        console.log(`Running scheduled task: ${task.name}`);
        try {
          await task.task();
          task.lastRun = new Date();
          task.nextRun = this.calculateNextRun(task.lastRun, task.interval);
          this.saveScheduleToStorage();
        } catch (error) {
          console.error(`Failed to run task ${task.name}:`, error);
        }
      }
    }
  }

  private updateLastRunTime(taskId: string) {
    const task = this.tasks.get(taskId);
    if (task) {
      task.lastRun = new Date();
      task.nextRun = this.calculateNextRun(task.lastRun, task.interval);
      this.saveScheduleToStorage();
    }
  }

  private saveToLocalStorage(key: string, data: any) {
    try {
      const storageData = {
        data,
        timestamp: new Date().toISOString(),
        version: '1.0'
      };
      localStorage.setItem(`universal-sim-${key}`, JSON.stringify(storageData));
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  }

  private loadScheduleFromStorage() {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.error('Failed to load schedule from storage:', error);
    }
    return {};
  }

  private getSavedSchedule(): Record<string, { lastRun: string | null }> {
    return this.loadScheduleFromStorage();
  }

  private saveScheduleToStorage() {
    try {
      const schedule: Record<string, { lastRun: string | null; nextRun: string }> = {};
      
      for (const [taskId, task] of this.tasks) {
        schedule[taskId] = {
          lastRun: task.lastRun?.toISOString() || null,
          nextRun: task.nextRun.toISOString()
        };
      }

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(schedule));
    } catch (error) {
      console.error('Failed to save schedule to storage:', error);
    }
  }

  public getScheduleInfo() {
    const info: Array<{
      id: string;
      name: string;
      lastRun: Date | null;
      nextRun: Date;
    }> = [];

    for (const [_, task] of this.tasks) {
      info.push({
        id: task.id,
        name: task.name,
        lastRun: task.lastRun,
        nextRun: task.nextRun
      });
    }

    return info;
  }

  public async forceUpdate(taskId: string) {
    const task = this.tasks.get(taskId);
    if (task) {
      console.log(`Force updating ${task.name}...`);
      await task.task();
    }
  }

  public cleanup() {
    for (const [_, timer] of this.timers) {
      clearInterval(timer);
    }
    this.timers.clear();
  }
}

export const dataUpdateScheduler = new DataUpdateScheduler();