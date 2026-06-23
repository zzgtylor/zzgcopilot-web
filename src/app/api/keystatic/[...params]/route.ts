import { makeRouteHandler } from '@keystatic/next/route-handler'
import config from '../../../../../keystatic.config'

// Keystatic's API handler performs filesystem/git operations and must run on
// the Node.js runtime, not the edge/Workers runtime.
export const runtime = 'nodejs'

export const { POST, GET } = makeRouteHandler({ config })
