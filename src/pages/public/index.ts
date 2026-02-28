import { Hono } from 'hono'
import { publicLoginRoutes } from './login'
import { publicRegisterRoutes } from './register'
import { publicVerifyRoutes } from './verify'
import { publicOnboardingRoutes } from './onboarding'

type Bindings = { DB: D1Database }

export const publicPageRoutes = new Hono<{ Bindings: Bindings }>()

publicPageRoutes.route('/', publicLoginRoutes)
publicPageRoutes.route('/', publicRegisterRoutes)
publicPageRoutes.route('/', publicVerifyRoutes)
publicPageRoutes.route('/', publicOnboardingRoutes)
