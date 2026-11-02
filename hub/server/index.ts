import "dotenv/config"

import { startTelemetry } from "./integrations/opentelemetry/start-telemetry/index.ts"
import { logger } from "./integrations/pino/index.ts"
import { createAuthenticationRouteDependencies } from "./create-authentication-route-dependencies/index.ts"
import { runApi } from "./run-api/index.ts"

const port = Number(process.env.PORT ?? 3001)
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error("PORT must be an integer between 1 and 65535.")
}

try {
  const telemetry = startTelemetry(process.env, logger)
  try {
    const trustedProxyHops = Number(process.env.HUB_TRUSTED_PROXY_HOPS ?? 0)
    if (!Number.isInteger(trustedProxyHops) || trustedProxyHops < 0 || trustedProxyHops > 10) {
      throw new Error("HUB_TRUSTED_PROXY_HOPS must be an integer between 0 and 10.")
    }
    const authentication = process.env.HUB_APPLICATION_ORIGIN
      ? createAuthenticationRouteDependencies(process.env)
      : undefined
    await runApi({ port, logger, authentication, trustedProxyHops })
  } finally {
    await telemetry.shutdown()
  }
} catch {
  logger.fatal("Hub API failed; check API configuration, telemetry, and shutdown time.")
  process.exit(1)
}
