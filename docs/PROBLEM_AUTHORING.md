# 出题与判题脚本实战手册

本文记录的是**实际踩过的坑**，不是理论。每条都注明了症状、根因与修法，目的是让下一道题
从"摸索半小时"变成"照流程走十分钟"。

---

## 一、标准流程（5 步，照做即可）

```
1. 写三个文件
   template/index.html     答案模板：结构 + 样式 + 待填 TODO（学生从这里开始）
   answer/index.html       参考解：必须能拿满分
   judge.js                判题脚本

2. 本地预检（关键！上传前必须做）
   直接用判题机容器里真实的 Chromium 跑判题脚本，确认：
     · 参考解 = 满分
     · 答案模板 = 明显低分（确认判题真的能抓错）
   → 没有预检就上传，等于把调试成本搬到线上，每轮都要等审计，极其浪费

3. 上传（admin.problem.upload）
4. 等审计 status=ready，看 audit 记录是否 success 且 score = totalScore
5. 发布（admin.problem.setStatus publish=true）→ 出现在题库
```

**实测耗时**：上传到审计完成约 20 秒（审计本身 2–4 秒），端到端提交到出分 3.5 秒。

---

## 二、判题脚本的坑（最容易白干的地方）

### 🔴 坑 1：检查点必须 `return` 分数，否则**即使断言全过也是 0 分**

```js
// ❌ 错：断言全过，但判题机记 0 分
$.defineCheckPoint('合计应为 10.50', 10, async () => {
   $.expect((await text('#total')) === '10.50', '合计错误');
});

// ✅ 对：必须把本检查点的得分返回
$.defineCheckPoint('合计应为 10.50', 10, async () => {
   $.expect((await text('#total')) === '10.50', '合计错误');
   return 10;
});
```

**为什么会这样**：`defineTestHandler` 里 `score = successScore ?? score`，而 `score` 初值是 0。
不返回就等于"这个检查点拿了 0 分"，同时 `status` 判为 `fail`。

**症状**：判题详情里 7 个检查点全部 `fail`、得分 0，但每条的 `details` 也没有报错原因
（因为确实没抛异常）——非常容易误判成"判题机坏了"。

**这个坑我第一次出题时踩到，整个预检白跑一轮。**

### 🟠 坑 2：`page.click()` 遇到 `disabled` 按钮会卡满 30 秒

Playwright 的 `click` 要求元素 visible + enabled + stable。禁用按钮会让它**反复重试到超时**。

```js
// 场景：数量为 1 时 - 按钮是 disabled，你想验证"再点也不会低于 1"
// ❌ await page.click('[data-id="apple"] .minus');   // 卡 30 秒后抛 timeout
// ✅ 派发合成事件：仍会走应用的委托监听器，等价于真实点击
await page.$eval('[data-id="apple"] .minus', (el) =>
   el.dispatchEvent(new MouseEvent('click', { bubbles: true })),
);
```

**反之**：如果某个点击**本就应该成功**（例如结算按钮应已启用），就该用真实 `click`，
并加短超时让它快速失败：

```js
await page.click('#checkout', { timeout: 3000 });   // 没启用则 3s 内报错，不白等 30s
```

### 🟠 坑 3：断言消息会**原样展示给学生**，要写清楚"期望 vs 实际"

```js
// ❌ 学生看不出问题
$.expect(total === '10.50', '合计错误');
// ✅ 一眼看懂
$.expect(total === '10.50', '合计应为 10.50，实际为 "' + total + '"');
```

### 🟡 坑 4：自己算错期望值

我曾把"苹果 1×3 + 牛奶 3×5.5 + 面包 1×2"算成 27.00（正确是 21.50），
结果参考解被判 85 分。**预检就是用来抓这个的**——不要凭脑算，让预检跑一遍。

### 🟡 坑 5：脚本里不要写 `export default`

判题机内部会把 `export default ` 文本替换成 `const run = `。
所以正确写法是**直接写 `export default defineTestHandler(...)`**（会被替换）；
如果自己写成裸函数声明，替换不生效反而多一层不确定性。照抄现有题目即可。

### 🟡 坑 6：浮点误差

`0.1 + 0.2 !== 0.3`。涉及金额时统一 `toFixed(2)` 后再比较，
并且**题面里要明确要求保留两位小数**，否则学生用 `Math.round` 也能"过"，
但显示会变成 `10.5` 而不是 `10.50`，此时判题会失败而学生不知道为什么。

---

## 三、题目封面的坑（本次又踩了一次）

### 🔴 坑 7：封面图由**调度器写**、由 **Web 应用读**，必须落在同一目录

- **写**：审计时调度器截取首屏 → `saveFirstScreen()` → `LocalStoreService.save()`
  → `LOCAL_STORE_PATH || './local_store'`
- **读**：Web 应用的 `/api/static/[filePath]`

两个进程的 **cwd 不同**（`packages/challenge-judge-scheduler` 与 `packages/challenge-web-app`），
所以同一句相对路径 `./local_store` 会变成两个目录 → **所有封面 404**，
页面只显示 `<img>` 的 alt 文本 `Cover Image`。

**修法**（已实施）：`packages/shared/utils/local-store-path.ts` 提供统一解析器，
规范目录固定为 `packages/challenge-web-app/local_store`：

1. `LOCAL_STORE_PATH` 为**绝对路径** → 采用（容器部署的正确做法）
2. **未配置或配了相对路径** → 一律用规范目录，并在相对路径会指向别处时打印警告

第 2 条刻意不兼容旧行为：宁可强制收敛，也不让文件静默写到别处。

### 🟠 坑 8：封面还是裂的？按这个顺序查

```bash
# 1. DB 里记的封面文件名
select i.name from problem_default_covers pdc
  join images i on i.id = pdc."imageId" where pdc."problemId" = <PID>;

# 2. 文件到底在哪个 local_store
ls packages/challenge-web-app/local_store
ls packages/challenge-judge-scheduler/local_store     # 这里出现封面文件就是踩了坑 7

# 3. 直接把 URL 打出来验证
curl -I http://localhost:3000/api/static/<name>
```

若文件在 scheduler 目录：复制到 web 目录即可立刻恢复
（**不要**只改数据库，文件才是真相）。

### 🟡 坑 9：首屏截图 = 封面，所以初始渲染必须"好看且稳定"

- 初始就是空白/加载态的题目，封面会截到空白
- 有动画、随机数、时间戳的初始态，封面每次都不一样
- 封面是**审计时**生成的；改了初始外观要重新审计才会更新封面

---

## 四、运行期配置的坑

### 🔴 坑 10：判题快照目录必须"容器内 == 宿主机"同一绝对路径

调度器把快照目录作为 **bind mount 的 Source** 交给宿主机的 Docker daemon，
而 **daemon 按宿主机文件系统解析该路径**。

- 容器内用 `/app/packages/.../tmp` 这类**容器私有路径** → 宿主机不存在 →
  `invalid mount config for type "bind": bind source path does not exist`
- 默认值写死 `/tmp` → Windows 上被 `path.isAbsolute` 判为绝对路径，却不是合法 Windows 路径 →
  `\tmp\<uuid> is not a valid Windows path`

**修法**（已实施）：
- `TempFileService` 默认用 `os.tmpdir()`（Linux `/tmp`、Windows `%TEMP%`）
- 绝对路径原样使用（`path.join(cwd, abs)` 会把 cwd 也拼进去，得到双重路径）
- compose 里配 `TEMP_DIR=/app/tmp` + 卷 `/app/tmp:/app/tmp`

### 🟠 坑 11：`initCommand` 必须让站点根目录 = 上传目录

`judgeUploadPath=project` + 快照键为 `/project/...` → 页面在 `<mount>/project/index.html`。
因此启动命令必须是 `npx serve -l 3000 project` 而不是 `npx serve -l 3000`
（后者把 `<mount>` 当根，找不到 index.html，判题脚本一直等选择器直到超时）。

### 🟡 坑 12：判题机长跑会劣化

实测：运行约 11 小时的判题机容器开始出现 `Judge Machine response timeout`，
排查后确认是容器内 Chromium 长期运行 + 大量失败页导航累积所致，
**删除容器让调度器重建后立即恢复**。生产环境需要考虑定期重启。

---

## 五、本机开发环境的坑

### 🔴 坑 13：dev server 运行时**不要**跑 `pnpm typecheck` / `nuxt build`

`pnpm typecheck` 的第一步是 `nuxt prepare`，它会重写 `.nuxt/` 目录。
而正在运行的 dev server 依赖 `.nuxt/dev/index.mjs` 与 `.nuxt/dist/server/*`。
两者同时写同一目录 → dev server 的产物被清掉，之后所有请求返回：

```
500 Cannot find module '.nuxt\dist\server\client.manifest.mjs'
```

**症状**：进程还在、端口看起来还在，但页面全崩。
这正是"页面崩了但终端没中断"的典型原因。

**处理**：先停 dev server 再 typecheck / build，跑完再重新 `pnpm dev`。

### 🟠 坑 14：端口只剩 `CLOSE_WAIT` 说明服务已"僵死"

```powershell
netstat -ano | Select-String ':3000'
# 若全是 CLOSE_WAIT 且没有 LISTENING → 进程活着但已不接受新连接
```

此时**刷新页面无效**，必须杀进程重启。

---

## 五、上传前的检查清单
- [ ] 答案模板跑预检 = **明显低分**（证明判题能抓错）
- [ ] 每个 `defineCheckPoint` handler **都 return 了分数**
- [ ] 所有 `page.click` 都已确认目标按钮在当下是**启用**状态，或已改用合成事件
- [ ] 断言消息包含"期望 vs 实际"
- [ ] 快照键统一为 `/project/...`，`judgeUploadPath = 'project'`
- [ ] `initCommand = 'npx serve -l 3000 project'`
- [ ] `totalScore` = 各检查点分值之和
- [ ] `tagIds` 用**已存在的** tag id（当前库里只有 `1 = Vue3`）
- [ ] `coverMode: 'default'` 时必须提供 `referenceAnswerSnapshot`
- [ ] 上传后确认 `status=ready` 且 audit 记录 `success`、`score = totalScore`
- [ ] 发布后打开题库确认**封面能加载**（不是 alt 文本）

---

## 六、判题脚本模板

```js
export default defineTestHandler(async ({ page, $ }) => {
   const text = async (sel) => {
      const el = await page.$(sel);
      if (!el) throw new Error(`找不到元素 ${sel}`);
      return (await el.textContent()).trim();
   };

   // 需要点击可能被禁用的按钮时用这个
   const clickMaybeDisabled = async (sel) => {
      await page.$eval(sel, (el) => el.dispatchEvent(new MouseEvent('click', { bubbles: true })));
      await page.waitForTimeout(150);
   };

   $.defineCheckPoint('检查点名称（会展示给学生）', 10, async () => {
      const actual = await text('#result');
      $.expect(actual === '期望值', `期望 #result 为 "期望值"，实际为 "${actual}"`);
      return 10; // ← 必须返回，否则 0 分
   });
});
```

---

## 七、一句话总结

> **判题的坑几乎全在"隐式约定"上**：分数要 return、路径要统一、按钮状态影响点击、
> 封面由另一个进程写。凡是约定，都要么写进文档、要么在代码里强制校验 ——
> 否则下一次还会以"图片又裂了 / 明明是满分却判 0 分"的形式重新出现。
