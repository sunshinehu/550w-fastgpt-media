# 550W FastGPT 媒体工具集

生成的独立社区源码候选，插件 ID：media550wCn，版本 0.0.1。

要求 Node >=22.12、pnpm 10.28.2、FastGPT >=4.15.0。

构建：

```sh
pnpm install --frozen-lockfile
pnpm run check
pnpm test
pnpm run build
pnpm run pack
```

六个工具：积分查询、分享链接解析、图片提交/查询、视频提交/查询。凭据由宿主 secretSchema 每次调用注入；处理前须用户确认发送素材及可能扣费。不含个人账号密钥。

vendor 是本工程共享 runtime 的生成快照，不在导出目录维护第二份源码；更新须由原工程重新生成。runtime-source.json 记录快照和依赖锁摘要。本适配器及交付中的550W自有代码采用 Apache-2.0，完整条款见 LICENSE，范围见 NOTICE；第三方组件保留各自许可，品牌素材和托管服务不属于此开源许可。保留 bundled 第三方许可证文本。

此候选未通过真实宿主安装、付费任务或社区审核。提交前完成宿主验收、独立仓库固定 commit 登记。

官方规则：https://github.com/labring/fastgpt-community-plugins
