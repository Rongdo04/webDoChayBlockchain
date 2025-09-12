// config/index.js
/**
 * Configuration exports
 * Centralized export for all configuration files
 */

import config from "./environment.js";
import constants from "./constants.js";

export { config, config as environment };
export { constants };
export * from "./constants.js";

// Export combined configuration
export const appConfig = {
  environment: config,
  constants,
};

export default appConfig;
