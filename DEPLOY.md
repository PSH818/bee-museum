# 部署说明

蜂之境是纯前端静态站点(前端方案 §16)。构建产物在 `dist/`,任何静态托管都能放;
唯一要求是 **SPA 路由回退**(所有未知路径返回 `index.html`),仓库已为主流平台准备好配置。

## 发布前检查

```bash
npm run build:release   # = 内容发布门禁(任何 draft 条目阻断) + 单测 + 类型检查 + vite build
npm run test:e2e        # 53 条:42 张视觉基线 + 11 条路由冒烟(需已安装 Playwright 浏览器)
npm run preview         # 本地预览 dist(自带 SPA 回退),打开 http://127.0.0.1:4173
```

## 方案 A:Cloudflare Pages(推荐,免费额度充足)

1. 把仓库推到 GitHub / GitLab。
2. Cloudflare Dashboard → Workers & Pages → Create → Pages → Connect to Git。
3. 构建设置:
   - Framework preset: `Vite`
   - Build command: `npm run build:release`
   - Build output directory: `dist`
   - 环境变量:`NODE_VERSION` = `22`
4. 部署完成后得到 `https://<project>.pages.dev`;自定义域名在 Custom domains 里绑定。

`public/_redirects`(SPA 回退)与 `public/_headers`(缓存/安全头)会随构建进入 `dist/` 并自动生效。

也可以不连 Git,用命令行直接上传:

```bash
npm run build:release
npx wrangler pages deploy dist --project-name bee-museum
```

## 方案 B:Vercel

仓库根目录的 `vercel.json` 已包含构建命令、输出目录、SPA rewrites 和缓存头。

```bash
npx vercel          # 首次:登录并按提示创建项目
npx vercel --prod   # 正式发布
```

或在 vercel.com 导入 Git 仓库,配置会自动读取。

## 方案 C:Netlify

同样读取 `public/_redirects` / `public/_headers`。Build command `npm run build:release`,Publish directory `dist`。

## 方案 D:自有服务器(Nginx)

```nginx
server {
  listen 80;
  server_name bee.example.com;
  root /var/www/bee/dist;
  index index.html;
  location /assets/ { add_header Cache-Control "public, max-age=31536000, immutable"; }
  location /models/ { add_header Cache-Control "public, max-age=86400"; }
  location / { try_files $uri $uri/ /index.html; }
}
```

## 关于 GitHub Pages

GitHub Pages 不支持服务端 SPA 回退,且项目页带 `/<repo>/` 前缀,需要额外设置 Vite `base` 与 404.html 跳转技巧。
不推荐;若必须使用,请先在 `vite.config.ts` 设置 `base: "/<repo>/"` 并将 `dist/index.html` 复制为 `dist/404.html`。

## 资产体积提示

`public/models/` 共约 22 MB(每个标本高/低精度各一份 GLB,单个 1–3 MB)。
标本按需加载,序厅与信息页不会下载模型;首次打开标本馆约需下载 2–3 MB。
后续优化方向:Draco / meshopt 压缩 GLB(预计缩小 60–80%),并给文件名加内容哈希以便永久缓存。
