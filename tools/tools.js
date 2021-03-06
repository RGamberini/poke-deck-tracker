module.exports.generateSearchString = function(profile) {
    let addresses = [
        [[0x22, 0x23], 0],
        [[0x28, 0x28], 0],
        [[0x2A, 0x2B], 0],
        [[0x4E, 0x4F], 0],
        [[0x52, 0x61], 0],
        [[0x62, 0x63], 0xFF],
        [[0x7f, 0x7f], 0x04]
    ];
    let address_index = 0;
    let search_string = new Array(0x80).fill('?');

    addresses.forEach(address => {
        address_index++;
        let [range, value] = address;
        for (let i = range[0]; i <= range[1]; i++) {
            search_string[i] = value.toString(16).padStart(2, '0');
        }
    });

    // for (let i = 0, address = addresses[address_index]; i < 0x80; i++) {
    //     let result = '?';
    //     if (i >= address[0][0]) {
    //         if (i > address[0][1]) {
    //             address_index++;
    //             address = addresses[address_index]
    //         } else {
    //             result = address[1].toString(16).padStart(2, '0');
    //         }
    //     }
    //     search_string[i] = result;
    //     // console.log(`0x${i.toString(16)}: ${result}`)
    // }
    return search_string.join(" ");
};