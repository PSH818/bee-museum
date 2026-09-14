/** 静态资源路径:部署在子路径(如 GitHub Pages 的 /bee-museum/)时自动加前缀。
 *  开发与根路径部署下 BASE_URL 为 "/",行为不变。 */
export const asset = (path: string): string =>
  import.meta.env.BASE_URL.replace(/\/$/, "") + path;
