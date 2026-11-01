import { csrf } from 'hono/csrf';
import { secureHeaders } from 'hono/secure-headers';
import { createRoute } from 'honox/factory';

export default createRoute(secureHeaders(), csrf());
