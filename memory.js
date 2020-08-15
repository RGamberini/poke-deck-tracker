const robot = require('robot-js');
class MemoryError extends Error {
    constructor(message) {
        super(message);
        this.name = "MemoryError"
    }
}

const SEARCH_STRING = "? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? 00 00 ? ? ? ? 00 ? 00 00 ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? 00 00 ? 00 00 00 ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? 04";
let LOWER_BOUND = 0x1456D6900;
let UPPER_BOUND = 0x1456d6FFF;
class Memory {
    constructor() {
        this.emulator = undefined;
        this.memory = undefined;
        this.base_offset = 0;
    }

    ready() {
        return this.emulator !== undefined && this.memory !== undefined && this.base_offset !== 0;
    }

    attach() {
        let processes = robot.Process.getList();
        this.emulator = processes.find(process => process.getName() === "DeSmuME_0.9.11_x64.exe");
        if (this.emulator === undefined)
            throw new MemoryError("Emulator is not started silly!");
        this.memory = robot.Memory(this.emulator);
        console.debug("Memory: Attached to emulator.")
    }

    query() {
        if (this.emulator === undefined) throw new MemoryError("Not attached to emulator.");
        if (this.base_offset === 0) {
            console.debug("Memory: No known Base Offset, looking...");
            let result = this.memory.find(SEARCH_STRING, LOWER_BOUND, UPPER_BOUND);
            if (result.length > 0) {
                result = parseInt(result);
                console.debug(`Memory: Found base offset 0x${result.toString(16).toUpperCase()}`)
                this.base_offset = result;
            } else throw new MemoryError("Memory: Can't read memory no base offset found.");
        }
        return this.memory.readInt16(this.base_offset);
    }
}

module.exports = {Memory, MemoryError};