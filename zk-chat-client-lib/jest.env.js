// To workaround "ReferenceError: setImmediate is not defined"
// Ref: https://github.com/prisma/prisma/issues/8558#issuecomment-1102176746
global.setImmediate = global.setImmediate || ((fn, ...args) => global.setTimeout(fn, 0, ...args));
