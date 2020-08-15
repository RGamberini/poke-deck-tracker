const robot = require('robot-js');
let processes = robot.Process.getList();
let emulator = processes.find(process => process.getName() === "DeSmuME_0.9.11_x64.exe");
if (emulator === undefined) {
    console.error("Emulator is not started silly!");
    return
}
// List is an array
const memory = robot.Memory(emulator);
const baseOffset = 0x1456D6A8C;
const poke_in_RAM = new Array(0x80);
for (let i = 0x00; i < 0x80; i++) {
    let result = memory.readInt8(baseOffset + i);
    poke_in_RAM[i] = result.toString(16).padStart(2, '0');
    // console.log(`0x${i.toString(16)}: 0x${result.toString(16)}`)
}
// console.log(memory.readInt16(baseOffset));

function generateSearchString() {
    let addresses = [
        [[0x22, 0x23], 0],
        [[0x28, 0x28], 0],
        [[0x2A, 0x2B], 0],
        [[0x4E, 0x4F], 0],
        [[0x51, 0x53], 0],
        [[0x7f, 0x7f], 0x04]
    ];
    let address_index = 0;
    let search_string = new Array(0x80);
    for (let i = 0, address = addresses[address_index]; i < 0x80; i++) {
        let result = '?';
        if (i >= address[0][0]) {
            if (i > address[0][1]) {
                address_index++;
                address = addresses[address_index]
            } else {
                result = address[1].toString(16).padStart(2, '0');
            }
        }
        search_string[i] = result;
        // console.log(`0x${i.toString(16)}: ${result}`)
    }
    return search_string.join(" ");
}
// let search_string = generateSearchString();
// for (let i = 0x00; i < 0x80; i++) {
//     console.log(`0x${i.toString(16)}: ${poke_in_RAM[i]}, ${search_string[i]}`)
// }
console.log(generateSearchString());
let lower_bound = 0x1456D6900;
let upper_bound = 0x1456d6FFF;
let memory_address = memory.find(generateSearchString(), lower_bound, upper_bound);
console.log(memory_address);
memory_address = parseInt(memory_address);
console.log(memory_address.toString(16));
console.log(memory.readInt16(memory_address));
var list = memory.find("04 08 ? 16 23 42");
console.log(list);
