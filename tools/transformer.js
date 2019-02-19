const path = require('path');
export default function transformer(file, api) {
  const j = api.jscodeshift;
  const source = j(file.source);
  const arr = source.find(j.ImportDefaultSpecifier);

  const relative = path.relative(path.dirname(file.path), 'miniprogram_npm');
  let runtimeDeclared = false;
  let runtimePath;
  if (path.dirname(file.path) === 'src') {
    runtimePath = `import regeneratorRuntime from '@/babyfs-wxapp-runningtime/index.js';`;
  } else {
    runtimePath = `import regeneratorRuntime from '${relative}/babyfs-wxapp-runningtime/index.js';`;
  }

  if (arr.length) {
    arr.forEach((path) => {
      if (path.node.local.name === 'regeneratorRuntime') {
        runtimeDeclared = true;
      }
    });
    if (!runtimeDeclared) {
      return source
        .find(j.ImportDeclaration)
        .at(0)
        .insertBefore(runtimePath)
        .toSource();
    }
  } else {
    const type = source.find(j.Program).nodes()[0].body[0].type;
    return source
      .find(j[type])
      .at(0)
      .insertBefore(runtimePath)
      .toSource();
  }
}
