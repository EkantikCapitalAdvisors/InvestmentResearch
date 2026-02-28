import { Hono } from 'hono'
import { subscriberFeedRoutes } from './feed'
import { subscriberWatchlistRoutes } from './watchlist'
import { subscriberTrendsRoutes } from './trends'
import { subscriberResearchRoutes } from './research'
import { subscriberMarketRoutes } from './market'
import { subscriberAvoidRoutes } from './avoid'
import { subscriberMag7Routes } from './mag7'
import { subscriberMethodologyRoutes } from './methodology'
import { subscriberAccountRoutes } from './account'
import { subscriberSubscribeRoutes } from './subscribe'

type Bindings = { DB: D1Database }

export const subscriberPageRoutes = new Hono<{ Bindings: Bindings }>()

subscriberPageRoutes.route('/', subscriberFeedRoutes)
subscriberPageRoutes.route('/', subscriberWatchlistRoutes)
subscriberPageRoutes.route('/', subscriberTrendsRoutes)
subscriberPageRoutes.route('/', subscriberResearchRoutes)
subscriberPageRoutes.route('/', subscriberMarketRoutes)
subscriberPageRoutes.route('/', subscriberAvoidRoutes)
subscriberPageRoutes.route('/', subscriberMag7Routes)
subscriberPageRoutes.route('/', subscriberMethodologyRoutes)
subscriberPageRoutes.route('/', subscriberAccountRoutes)
subscriberPageRoutes.route('/', subscriberSubscribeRoutes)
