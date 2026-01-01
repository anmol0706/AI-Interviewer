import dailyQuestionsService from './dailyQuestionsService.js';
import logger from '../utils/logger.js';

class DailyScheduler {
    constructor() {
        this.intervalId = null;
        this.lastCheckDate = null;
    }

    /**
     * Start the scheduler
     */
    start() {
        logger.info('🕐 Starting Daily Practice scheduler...');

        // Check immediately on start
        this.checkAndGenerateQuestions();

        // Check every minute for date change
        // This is more reliable than trying to schedule exactly at midnight
        this.intervalId = setInterval(() => {
            this.checkForDateChange();
        }, 60000); // Check every minute

        logger.info('✅ Daily Practice scheduler started - will generate new questions at midnight');
    }

    /**
     * Stop the scheduler
     */
    stop() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
            logger.info('Daily Practice scheduler stopped');
        }
    }

    /**
     * Check if date has changed and trigger reset
     */
    checkForDateChange() {
        const today = new Date().toISOString().split('T')[0];

        if (this.lastCheckDate && this.lastCheckDate !== today) {
            logger.info(`📅 Date changed from ${this.lastCheckDate} to ${today} - triggering daily reset`);
            this.performDailyReset();
        }

        this.lastCheckDate = today;
    }

    /**
     * Check and generate questions if needed
     */
    async checkAndGenerateQuestions() {
        try {
            const today = new Date().toISOString().split('T')[0];
            this.lastCheckDate = today;

            const DailyQuestion = (await import('../models/DailyQuestion.js')).default;
            const exists = await DailyQuestion.questionsExistForToday();

            if (!exists) {
                logger.info(`No questions found for ${today} - generating...`);
                await dailyQuestionsService.generateDailyQuestions();
            } else {
                logger.info(`✅ Daily questions already exist for ${today}`);
            }
        } catch (error) {
            logger.error('Error checking/generating daily questions:', error);
        }
    }

    /**
     * Perform the daily reset at midnight
     */
    async performDailyReset() {
        try {
            logger.info('🔄 Performing daily reset...');
            await dailyQuestionsService.resetDailyProgress();
            logger.info('✅ Daily reset completed successfully');
        } catch (error) {
            logger.error('Error performing daily reset:', error);

            // Retry after 5 minutes if failed
            setTimeout(() => {
                this.performDailyReset();
            }, 300000);
        }
    }

    /**
     * Get scheduler status
     */
    getStatus() {
        return {
            isRunning: !!this.intervalId,
            lastCheckDate: this.lastCheckDate,
            currentServerTime: new Date().toISOString()
        };
    }
}

const dailyScheduler = new DailyScheduler();

export default dailyScheduler;
