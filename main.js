const electron = require("electron");
const url = require("url");
const path = require("path");

const {app, BrowserWindow, Menu, ipcMain} = electron;

// Set ENV
process.env.NODE_ENV = 'production';

let mainWindow;
let addWindow;

// Listen for app to be ready
app.on("ready", function() {
    // Create new window
    mainWindow = new BrowserWindow({
        webPreferences: {nodeIntegration: true}
    });
    // Load html into window
    mainWindow.loadURL(url.format({
        // passing "file: <dirname>/mainWindow.html" into loadURL
        pathname: path.join(__dirname, "mainWindow.html"),
        protocol: "file",
        slashes: true
    }));

    // Quit app when mainWindow is closed
    mainWindow.on("closed", function(){
        app.quit();
    });

    // Build menu from template
    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
    // Insert menu
    Menu.setApplicationMenu(mainMenu);
});

// Handle create "add window"
function createAddWindow() {
    addWindow = new BrowserWindow({
        width: 300,
        height: 200,
        title: "Add Shopping List Item",
        webPreferences: {nodeIntegration: true} 
    });
    addWindow.loadURL(url.format({
        // passing "file: <dirname>/mainWindow.html" into loadURL
        pathname: path.join(__dirname, "addWindow.html"),
        protocol: "file",
        slashes: true
    }));

    // Garbage collection handle
    addWindow.on("close", function() {
        addWindow = null;
    })
}

// Catch item:add; receives item from addWindow
ipcMain.on('item:add', function(e, item) {
    mainWindow.webContents.send('item:add', item);
    addWindow.close();
});

// Create menu template
const mainMenuTemplate = [
    {
        label: "File",
        submenu: [
            {
                label: "Add Item",
                accelerator: "CmdOrCtrl+Shift+A",
                click(){
                    createAddWindow();
                }
            },
            {
                label: "Clear Items",
                accelerator: "CmdOrCtrl+Shift+C",
                click() {
                    mainWindow.webContents.send("item:clear");
                }
            },
            {
                label: "Quit",
                accelerator: "CmdOrCtrl+Q",//process.platform == "darwin" ? "Command+Q" : "Ctrl+Q",
                click(){
                    app.quit(); 
                }
            }
        ]
    }
];

// If Mac, then add empty object to menu
if (process.platform == "darwin") {
    // Adds {} to the zeroeth index of mainMenuTemplate list
    mainMenuTemplate.unshift({});
}

// Add developer tools item if not in production
if(process.env.NODE_ENV !== "production") {
    mainMenuTemplate.push({
        label: "Developer Tools",
        submenu: [
            {
                label: "Toggle DevTools",
                accelerator: "CmdOrCtrl+I",
                click(item, focusedWindow){
                    // If clicked on mainWindow, we want to open toggle for main window
                    // If clicked on addWindow, we want to open toggle for add window
                    // focusedWindow is whichever of these windows gets passed in
                    focusedWindow.toggleDevTools();
                }
            },
            {
                role: "reload"
            }
        ]
    })
}