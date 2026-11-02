import express from "express"

import { handleError } from "../integrations/express/handle-error/index.ts"
import { respondNotFound } from "../integrations/express/respond-not-found/index.ts"
import { createRequestLogger } from "../integrations/pino/create-request-logger/index.ts"
import { authenticationRoutes } from "../routes/api/authentication/index.ts"
import { authenticationSecurity } from "../routes/api/authentication/security/index.ts"
import { routes } from "../routes/index.ts"

import type { CreateAppOptions } from "./types.ts"

/** Give every endpoint the same request logging and safe error responses. */
export function createApp({
  authentication,
  broadcast,
  logger,
  trustedProxyHops = 0,
}: CreateAppOptions = {}) {
  const app = express()
  app.disable("x-powered-by")
  app.set("trust proxy", trustedProxyHops)
  app.use(createRequestLogger(logger))
  app.use("/api/auth", authenticationSecurity())
  if (authentication) authenticationRoutes(app, authentication)
  app.use(express.json())

  routes(app, { broadcast })
  app.use(respondNotFound)
  app.use(handleError)

  return app
}
