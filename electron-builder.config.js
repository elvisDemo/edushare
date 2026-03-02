/**
 * electron-builder.config.js
 * Windows .exe installer configuration
 */
module.exports = {
  appId: 'com.edushare.app',
  productName: 'EduShare',
  directories: {
    output: 'release'
  },
  files: [
    'main/**/*',
    'renderer/dist/**/*',
    'node_modules/**/*',
    'package.json'
  ],
  win: {
    target: [{ target: 'nsis', arch: ['x64'] }],
    icon: 'assets/icon.ico'
  },
  nsis: {
    oneClick: false,
    allowToChangeInstallationDirectory: true,
    createDesktopShortcut: true,
    createStartMenuShortcut: true
  },
  extraResources: [],
  asar: true
};
