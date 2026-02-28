import { Hono } from 'hono'
import { homeRoutes } from './home'
import { feedRoutes } from './feed'
import { watchlistRoutes } from './watchlist'
import { tickerDetailRoutes } from './ticker-detail'
import { mag7Routes } from './mag7'
import { aomgRoutes } from './aomg'
import { heatRoutes } from './heat'
import { observationsRoutes } from './observations'
import { journalRoutes } from './journal'
import { settingsRoutes } from './settings'
import { uploadRoutes } from './upload'
import { queueRoutes } from './queue'
import { subscribersPageRoutes } from './subscribers'

type Bindings = { DB: D1Database }

export const adminPageRoutes = new Hono<{ Bindings: Bindings }>()

adminPageRoutes.route('/', homeRoutes)
adminPageRoutes.route('/', feedRoutes)
adminPageRoutes.route('/', watchlistRoutes)
adminPageRoutes.route('/', tickerDetailRoutes)
adminPageRoutes.route('/', mag7Routes)
adminPageRoutes.route('/', aomgRoutes)
adminPageRoutes.route('/', heatRoutes)
adminPageRoutes.route('/', observationsRoutes)
adminPageRoutes.route('/', journalRoutes)
adminPageRoutes.route('/', settingsRoutes)
adminPageRoutes.route('/', uploadRoutes)
adminPageRoutes.route('/', queueRoutes)
adminPageRoutes.route('/', subscribersPageRoutes)
