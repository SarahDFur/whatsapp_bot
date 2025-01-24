import winston from 'winston';
import { Client, type Message } from 'whatsapp-web.js';

import Config from './config.js';
import Commander from './commander.js';
import CommandSetting from './command_setting.js';
import Utils from './utils.js';
import type Trigger from './trigger.js';

abstract class Command {
    config: Config;
    name: string;
    description: string;
    setting: CommandSetting;
    logger: winston.Logger;

    constructor(name: string, description: string, setting: CommandSetting | null = null) {
        this.logger = Utils.logger;
        this.config = Config.getInstance();
        this.name = name;
        this.description = description;
        this.setting = setting || new CommandSetting();
        if (!name || !description) {
            throw new Error('Command name and description are required');
        }
    }

    static async run(commands: Command[], msg: Message, client: Client): Promise<void> {
        const commander = new Commander(msg, client);
        const message = msg.body.split(' ')[0].toLowerCase();
        const logger: winston.Logger = Utils.logger;
        logger.debug(`Message received after fix: ${message}`);

        for (const command of commands) {
            const correctTrigger = command.triggers().some((trigger) => trigger.check(commander));
            if (!correctTrigger) {
                continue;
            }
            const correctAccess =
                (!command.setting.adminOnly || (await commander.authorIsAdmin())) &&
                (!command.setting.ownerOnly || commander.authorIsOwner());
            if (!correctAccess) {
                logger.debug('Access denied, author is not admin or owner');
                continue;
            }
            const isGroupChat = await commander.groupChat();

            if (!command.setting.onPrivateChat || !command.setting.onGroupChat) {
                if (command.setting.onGroupChat && !isGroupChat) {
                    logger.debug('Command is only for group chat');
                    continue;
                }

                if (command.setting.onPrivateChat && isGroupChat) {
                    logger.debug('Command is only for private chat');
                    continue;
                }
            }

            if (command.setting.adminPrivileges && !(await commander.botIsAdmin())) {
                logger.debug('Command requires admin privileges');
                continue;
            }

            try {
                command.initialize(commander);
                command.execute(commander);
                return;
            } catch (e) {
                logger.error(e);
            }
        }
    }

    /**
     * Initialize the command.
     *
     * @param {commander} commander The Commander instance to help achive common functionallity.
     */
    public initialize(_commander: Commander): void {}

    /**
     * Execute the command.
     *
     * @param {commander} commander The Commander instance to help achive common functionallity.
     */
    abstract execute(helper: Commander): void;

    /**
     * Return all the triggers the commands start from.
     *
     * @returns {Trigger[]} An array of triggers.
     */
    abstract triggers(): Trigger[];
}

export default Command;
