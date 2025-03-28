import { defineConfig } from 'vite';
    import react from '@vitejs/plugin-react';
    import fs from 'fs';
    import path from 'path';

    export default defineConfig(() => {

      const configPath = path.resolve(__dirname, 'configPort.json');
      let config;
      try {
        const configFile = fs.readFileSync(configPath, 'utf-8');
        config = JSON.parse(configFile);
      } catch (error) {
        console.error('Error al leer config.json:', error);
        config = { port: 3000 };
      }

      return {
        plugins: [react()],
        optimizeDeps: {
          include: ['react-pdf', 'pdfjs-dist'],
        },
        server: {
          port: config.frontendPort,
        },
        
        
      };
    });