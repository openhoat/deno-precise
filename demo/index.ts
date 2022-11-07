const name = Deno.args[0] ?? '1'

import(`./sample${name}.ts`)
