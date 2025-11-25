const { FusesPlugin } = require('@electron-forge/plugin-fuses');
const { FuseV1Options, FuseVersion } = require('@electron/fuses');

const path = require('path');

module.exports = {
  packagerConfig: {
    asar: true,
    name: 'Autodesk Fusion Data Client',
    // Icon paths - Electron will automatically use the correct format:
    // macOS: icon.icns, Windows: icon.ico, Linux: icon.png
    // Icons are located in assets/ folder:
    // - assets/icon.icns (macOS) - created from autodesk-fusion-product-icon-400.png
    // - assets/icon.png (Linux/fallback) - 400x400px version
    // - Windows: Electron Forge will auto-convert PNG to ICO if icon.ico doesn't exist
    icon: path.resolve(__dirname, 'assets', 'icon'),
  },
  rebuildConfig: {},
  makers: [
    // Windows installer
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        name: 'Autodesk Fusion Data Client',
      },
    },
    // macOS - ZIP archive (use maker-dmg for DMG installer if needed)
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin'],
    },
    // Linux DEB package (Debian/Ubuntu)
    {
      name: '@electron-forge/maker-deb',
      config: {
        options: {
          maintainer: 'Kevin Schneider',
          homepage: 'https://www.autodesk.com',
        },
      },
    },
    // Linux RPM package (Fedora/Red Hat)
    {
      name: '@electron-forge/maker-rpm',
      config: {
        options: {
          maintainer: 'Kevin Schneider',
          homepage: 'https://www.autodesk.com',
        },
      },
    },
  ],
  plugins: [
    {
      name: '@electron-forge/plugin-auto-unpack-natives',
      config: {},
    },
    {
      name: '@electron-forge/plugin-webpack',
      config: {
        loggerPort: 9002,
        mainConfig: './webpack.main.config.js',
        renderer: {
          config: './webpack.renderer.config.js',
          entryPoints: [
            {
              html: './src/index.html',
              js: './src/renderer.js',
              name: 'main_window',
              preload: {
                js: './src/preload.js',
              },
            },
          ],
        },
      },
    },
    // Fuses are used to enable/disable various Electron functionality
    // at package time, before code signing the application
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
};
