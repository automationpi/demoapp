import {
  createBackendModule,
  coreServices,
} from '@backstage/backend-plugin-api';
import { PassThrough } from 'stream';

// A simpler approach: Create a custom logger that enhances TechDocs output
export default createBackendModule({
  pluginId: 'techdocs',
  moduleId: 'enhanced-logging',
  register(env) {
    env.registerInit({
      deps: {
        logger: coreServices.logger,
      },
      async init({ logger }) {

        // Monkey patch the PassThrough stream to enhance logging
        const originalPassThrough = PassThrough.prototype.write;

        PassThrough.prototype.write = function(chunk: any, encoding?: any, callback?: any): boolean {
          // Check if this is a TechDocs build log by looking at the stack trace
          const stack = new Error().stack || '';
          if (stack.includes('techdocs') || stack.includes('mkdocs')) {
            const data = chunk.toString();

            // Enhance error messages
            if (data.toLowerCase().includes('error') ||
                data.toLowerCase().includes('failed') ||
                data.toLowerCase().includes('exception')) {

              const enhancedData = `🚨 ERROR DETECTED: ${data}`;
              return originalPassThrough.call(this, enhancedData, encoding, callback);

            } else if (data.toLowerCase().includes('warning')) {

              const enhancedData = `⚠️  WARNING: ${data}`;
              return originalPassThrough.call(this, enhancedData, encoding, callback);

            } else if (data.toLowerCase().includes('successfully') ||
                       data.toLowerCase().includes('done')) {

              const enhancedData = `✅ ${data}`;
              return originalPassThrough.call(this, enhancedData, encoding, callback);
            }
          }

          // Default behavior for non-TechDocs logs or regular messages
          return originalPassThrough.call(this, chunk, encoding, callback);
        };

        logger.info('✅ TechDocs Enhanced Logging module initialized (Stream Monkey Patch)');
      },
    });
  },
});
