# babyfs-wxapp-test

> babyfs wxapp test helper

## 工程结构

```javascript
babyfs-mina-purejs
├── miniprogram_dist      // Production环境下的构建文件
├── miniprogram_npm       // 工程依赖的npm包资源
├── node_modules          // 项目依赖
├── official              // 三方依赖(runtime...)
├── pages                 // pages
├── src
│    ├── components       // 微信小程序自定义组件
│    ├── miniprogram_npm  // npm包资源
│    ├── images           // 页面中的图片和icon
│    ├── pages            // 小程序page文件
│    ├── styles           // ui框架，公共样式
│    ├── template         // 模板
│    ├── utils            // 公共js文件
│    ├── app.js
│    ├── app.json
│    ├── app.less
│    ├── project.config.json // 项目配置文件
├── .editorconfig.js
├── .eslintrc.js
├── .gitignore
├── gulpfile.js    // gulp配置文件
├── package-lock.json
├── package.json
└── README.md
```

## How to use

```javascript
  import test from "../babyfs-wxapp-test/index.js";
```
