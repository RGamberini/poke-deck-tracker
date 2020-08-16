const {Memory, MemoryError} = require('../memory');
const {generateSearchString} = require('../tools/tools');
const SEARCH_STRING = generateSearchString().split(" ");
let memory = new Memory();
function hex(num, pad) {
    if (pad) return num.toString(16).toUpperCase().padStart(pad, '0');
    return num.toString(16).toUpperCase();
}

function pass(num, search) {
    return search === '?' ? true : hex(num, 2) === search;
}
function debugOffset(address) {
    let result = true;
    for (let i = 0; i < 0x80; i+=1) {
        let read = memory.memory.readInt8(address + i);
        let search = SEARCH_STRING[i];
        if (read < 0)
            read += 0x100;
        // console.log(`0x${(address + i).toString(16).toUpperCase()}: ${read.toString(16)}, ${read}, 0b${read.toString(2)}`);
        console.log(`0x${hex(i, 2)}: 0x${hex(read, 2)}==${search} ${pass(read, search)}`);
        // console.log(`Byte 0x${hexPad(i,2)}: 0x${hexPad(read, 2)}`);
        result &= pass(read, search);
    }
    console.log(`Offset ${hex(address)} ${result ? 'has passed' : 'has failed'}`);

}
memory.attach();
debugOffset(0x1456D69B0);