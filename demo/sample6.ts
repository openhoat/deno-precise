import WebServer from '../mod.ts'

void new WebServer({
  handlers: [
    {
      handler: function allRoutesHandler(req) {
        this.logger.warn(`The request '${req.method} ${req.url}' was here!`)
        // Do something useful with the request
      },
    },
  ],
}).start()