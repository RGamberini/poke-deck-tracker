const robot = require('robot-js');
const {generateSearchString} = require('../tools/tools');
function hexFormat(address) {
    return `0x${address.toString(16).toUpperCase()}`;
}
class MemoryError extends Error {
    constructor(message) {
        super(message);
        this.name = "MemoryError"
    }
}

const SEARCH_STRING = generateSearchString();
let LOWER_BOUND = 0x1456D6900;
let UPPER_BOUND = 0x1456d6FFF;
class Memory {
    constructor() {
        this.emulator = undefined;
        this.memory = undefined;
        this.base_offsets = [];
    }

    clearOffset() {
        this.base_offsets = [];
    }

    readUnsignedInt16(address) {
        let result = this.memory.readInt16(address);
        return result < -1 ? result + 2^16 + 1: result;
    }

    checkOffset(address) {
        console.debug(`Checking ${hexFormat(address)}`);
        let national_dex = this.readUnsignedInt16(address);

        if (national_dex > 0 && national_dex <= 493) {
            console.debug(`Memory: Check successful found base offset ${hexFormat(address)}. National Dex #${national_dex} is inside range 0 < n <= 493`);
            return true;
        } else console.debug(`Memory: Check failed for base offset ${hexFormat(address)}. National Dex #${national_dex} is outside range 0 < n <= 493`);
        return false;
    }

    ready() {
        return this.emulator !== undefined && this.memory !== undefined && this.base_offsets.length !== 0;
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
        if (this.base_offsets.length === 0) {
            console.debug("Memory: No known base offsets, looking...");
            let addresses = this.memory.find(SEARCH_STRING, LOWER_BOUND, UPPER_BOUND);
            console.debug(`Memory: Found ${addresses.length} address(es): ${addresses.map(address => hexFormat(parseInt(address)))}`);

            for (let address of addresses) {
                address = parseInt(address);

                if (this.checkOffset(address))
                    this.base_offsets.push(address);
            }
            if (this.base_offsets.length === 0) throw new MemoryError("Memory: Can't read memory no base offset found.");
        }

        let result = [];
        this.base_offsets.forEach(address => {
            let national_dex = this.readUnsignedInt16(address);
            result.push(national_dex);
        });
        return result;
    }
}

module.exports = {Memory, MemoryError};