import Commander from '../commander.js';
import Trigger from '../trigger.js';
import Config from '../config.js';

class PrefixTrigger extends Trigger {
    private prefixes: string[];

    constructor(prefixes: string[], includePrefixCmd: boolean = true) {
        super();
        this.prefixes = [];
        includePrefixCmd = includePrefixCmd || true;
        const commandPrefix = Config.getInstance().commandPrefix;
        if (includePrefixCmd) {
            prefixes.map((prefix) => this.prefixes.push(commandPrefix + prefix));
        } else {
            this.prefixes = prefixes;
        }
    }

    public check(commander: Commander): boolean {
        const msg = commander.msg;
        return this.prefixes.some((prefix) => msg.body.startsWith(prefix));
    }
}

export default PrefixTrigger;
