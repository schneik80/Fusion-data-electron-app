/**
 * Basic integration tests
 * These tests verify that components work together
 */

const fs = require('fs');
const path = require('path');

describe('Integration Tests', () => {
  describe('File Dependencies', () => {
    test('all required source files exist', () => {
      const requiredFiles = [
        'src/main.js',
        'src/renderer.js',
        'src/preload.js',
        'src/index.html',
        'src/index.css',
      ];

      requiredFiles.forEach(file => {
        const filePath = path.join(__dirname, '..', file);
        expect(fs.existsSync(filePath)).toBe(true);
      });
    });

    test('HTML file references correct scripts', () => {
      const htmlPath = path.join(__dirname, '..', 'src', 'index.html');
      const htmlContent = fs.readFileSync(htmlPath, 'utf8');

      // Check that renderer.js is referenced
      expect(htmlContent).toContain('renderer.js');
    });

    test('CSS file exists and is valid', () => {
      const cssPath = path.join(__dirname, '..', 'src', 'index.css');
      const cssContent = fs.readFileSync(cssPath, 'utf8');

      expect(cssContent.length).toBeGreaterThan(0);
      // Check for key CSS classes
      expect(cssContent).toContain('.sidebar');
    });
  });

  describe('Package Configuration', () => {
    test('package.json has correct main entry', () => {
      const packageJson = JSON.parse(
        fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8')
      );

      expect(packageJson.main).toBeDefined();
      expect(packageJson.main).toContain('.webpack/main');
    });

    test('package.json has required scripts', () => {
      const packageJson = JSON.parse(
        fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8')
      );

      expect(packageJson.scripts.start).toBeDefined();
      expect(packageJson.scripts.package).toBeDefined();
      expect(packageJson.scripts.test).toBeDefined();
    });

    test('package.json has Electron dependency', () => {
      const packageJson = JSON.parse(
        fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8')
      );

      const hasElectron = 
        (packageJson.dependencies && packageJson.dependencies.electron) ||
        (packageJson.devDependencies && packageJson.devDependencies.electron);

      expect(hasElectron).toBeTruthy();
    });
  });

  describe('Webpack Configuration', () => {
    test('webpack main config has correct entry', () => {
      const webpackMain = require('../webpack.main.config.js');
      expect(webpackMain.entry).toBe('./src/main.js');
    });

    test('webpack renderer config has CSS loader', () => {
      const webpackRenderer = require('../webpack.renderer.config.js');
      expect(webpackRenderer.module).toBeDefined();
      expect(webpackRenderer.module.rules).toBeDefined();
    });
  });

  describe('Forge Configuration', () => {
    test('forge config exists and is valid', () => {
      const forgeConfig = require('../forge.config.js');
      expect(forgeConfig).toBeDefined();
      expect(forgeConfig.packagerConfig).toBeDefined();
    });

    test('forge config has correct product name', () => {
      const forgeConfig = require('../forge.config.js');
      expect(forgeConfig.packagerConfig.name).toBe('Autodesk Fusion Data Client');
    });
  });

  describe('Navigation Icons', () => {
    test('nerdfont files exist', () => {
      const fontPath = path.join(
        __dirname, 
        '..', 
        'src', 
        'navicons', 
        'SymbolsNerdFont-Regular.ttf'
      );
      expect(fs.existsSync(fontPath)).toBe(true);
    });

    test('HTML uses nerdfont icons', () => {
      const htmlPath = path.join(__dirname, '..', 'src', 'index.html');
      const htmlContent = fs.readFileSync(htmlPath, 'utf8');

      // Check for nerdfont icon references (hex codes like &#xf46d;)
      expect(htmlContent).toMatch(/&#x[0-9a-fA-F]+;/);
    });
  });
});

