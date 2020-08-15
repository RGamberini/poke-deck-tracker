const robot = require('robot-js');
function hexFormat(address) {
    return `0x${address.toString(16).toUpperCase()}`;
}
class MemoryError extends Error {
    constructor(message) {
        super(message);
        this.name = "MemoryError"
    }
}

const SEARCH_STRING = "? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? 00 00 ? ? ? ? 00 ? 00 00 ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? 00 00 ? 00 00 00 ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? ? 04";
let LOWER_BOUND = 0x1456D6A00;
let UPPER_BOUND = 0x1456d6FFF;
class Memory {
    constructor() {
        this.emulator = undefined;
        this.memory = undefined;
        this.base_offset = 0;
    }

    clearOffset() {
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
            let addresses = this.memory.find(SEARCH_STRING, LOWER_BOUND, UPPER_BOUND);
            console.debug(`Memory: Found ${addresses.length} address(es): ${addresses.map(address => hexFormat(parseInt(address)))}`);
            for (let address of addresses) {
                address = parseInt(address);
                console.debug(`Checking ${hexFormat(address)}`);
                let national_dex = this.memory.readInt16(address);
                if (national_dex > 0 && national_dex <= 493) {
                    this.base_offset = address;
                    console.debug(`Memory: Check successful found base offset ${hexFormat(address)}`);
                } else console.debug(`Memory: Check failed for base offset ${hexFormat(address)}. National Dex #${national_dex} is outside range 0 < n <= 493`);
            }
            throw new MemoryError("Memory: Can't read memory no base offset found.");
        }
        return this.memory.readInt16(this.base_offset);
    }
}

module.exports = {Memory, MemoryError};