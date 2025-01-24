import Commander from '../commander.js';
import Command from '../command.js';
import type Trigger from '../trigger.js';
import PrefixTrigger from '../triggers/prefix_trigger.js';

class Ping extends Command {
    constructor() {
        super('ping', 'Ping command');
    }
    public override async execute(commander: Commander): Promise<void> {
        commander.msg.reply('Pong!');
    }

    public override triggers(): Trigger[] {
        return [new PrefixTrigger(['ping', 'פינג', 'fo oo'])];
    }
}

export default Ping;
