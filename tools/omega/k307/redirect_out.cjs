/* K307: the K305 generator hard-codes /tmp/sweep_wide.json, and on this machine that
   path is a root-owned leftover that cannot be removed. Preloaded with --require, this
   redirects ONLY that write to $SWEEP_OUT. The generator's own bytes are untouched, so
   what the fixpoint measures is the artifact that ships. */
const fs = require("fs");
const TARGET = "/tmp/sweep_wide.json";
const OUT = process.env.SWEEP_OUT;
const real = fs.writeFileSync.bind(fs);
fs.writeFileSync = (p, ...rest) => real(p === TARGET && OUT ? OUT : p, ...rest);
