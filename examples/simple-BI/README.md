## Simple-BI

基于 BI 为原型开发的 redux-with-domain 例子。演示了如何使用 redux-with-domain 解决复杂前端项目的架构问题。

### 启动

```bash
npm i
npm run start
// 自动打开 localhost:3000
```

注意：如果是本地 redux-with-domain 时，启动之后出现 invalid hooks 的报错，需要在 kop 项目下 link 这里的 React。
比如，假设 redux-with-domain 和 example 同级： `tnpm link ../kop-example/examples/simple-BI/node_modules/react`

如果提示babel的版本问题，请删除根目录下的 node_module， 回到 sinple-BI 下重试
