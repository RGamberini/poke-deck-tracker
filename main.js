const { app, BrowserWindow, screen } = require('electron');
const {Memory, MemoryError} = require('./memory');
const robot = require('robot-js');

const Pokedex = require('./pokedex');
const memory = new Memory();

function start() {
    try {
        memory.attach();
        memory.query();
    } catch (e) {}

    if (memory.ready()) createWindow();
    else setTimeout(start, 1000);
}

function createWindow () {
    // Create the browser window.
    const { width, height } = screen.getPrimaryDisplay().workAreaSize;
    const win = new BrowserWindow({
        width: width - 30,
        height: 154,
        x: 15,
        y: 15,
        frame: false,
        alwaysOnTop: true,
        webPreferences: {
            nodeIntegration: true
        },
        backgroundColor: '#000000'
    });

    win.setAlwaysOnTop(true, 'screen-saver');
    win.setMenuBarVisibility(false);

    // and load the index.html of the app.
    win.loadFile('index.html');

    // Open the DevTools.
    // win.webContents.openDevTools();
    win.webContents.on('did-finish-load', ()=> {
        main(win);
    });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(start);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
});

app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow()
    }
});

// In main process.
const { ipcMain } = require('electron');

ipcMain.on('asynchronous-message', (event, arg) => {
    console.log(arg); // prints "ping"
    event.reply('asynchronous-reply', 'pong')
});

function main(win) {
    let pokedex = new Pokedex();

    function poll() {
        try {
            let national_dex = memory.query();
            console.debug(`Found what could be a pokemon, National Dex #: ${national_dex}`);
            win.webContents.send("enemy_pokemon", {
                "national_dex": national_dex,
                "types": pokedex.getType(national_dex),
                "effectiveness": pokedex.getAllEffectiveness(national_dex)
            });
        } catch (exception) {
            console.log(`${exception.name}: ${exception.message}`);
            if (exception.name === "TypeError")
                if (exception.message === "Cannot read property '0' of undefined")
                    memory.clearOffset();
                else app.quit();
        }

        // let active_window = robot.Window.getActive().getProcess().getName();
        // // if (active_window === "electron.exe" || active_window === "DeSmuME_0.9.11_x64.exe") {
        // //     win.setAlwaysOnTop(true, 'screen-saver');
        // //     win.show();
        // // }
        // // else {
        // //     win.setAlwaysOnTop(false);
        // //     win.hide();
        // // }
    }
    setInterval(poll, 1000);
    // let national_dex = 200;
    // win.webContents.send("enemy_pokemon", {
    //     "national_dex": national_dex,
    //     "types": pokedex.getType(national_dex),
    //     "effectiveness": pokedex.getAllEffectiveness(national_dex)
    // });
    //
    // setTimeout(() => {
    //     national_dex = 350;
    //     win.webContents.send("enemy_pokemon", {
    //         "national_dex": national_dex,
    //         "types": pokedex.getType(national_dex),
    //         "effectiveness": pokedex.getAllEffectiveness(national_dex)
    //     });
    // }, 3000)
}