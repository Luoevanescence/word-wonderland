# 贡献指南 🤝

感谢你考虑为 Word Wonderland 做出贡献！我们非常欢迎各种形式的贡献，无论是报告 Bug、提出新功能建议，还是提交代码，都能帮助这个项目变得更好。

## 🐛 报告问题

如果你发现了 Bug 或有新功能建议：

1. 在 [Issues](https://github.com/你的用户名/bread-dog-recite-words/issues) 中搜索，确认问题是否已存在
2. 如果没有相关 Issue，请创建一个新的，并提供：
   - 清晰的标题和描述
   - 复现步骤（尽可能详细）
   - 预期行为和实际行为
   - 截图或录屏（如果适用）
   - 环境信息：
     - 操作系统及版本
     - Node.js 版本
     - 浏览器及版本
     - 相关的错误日志

### Issue 标签说明

- `bug` - 程序错误
- `enhancement` - 新功能建议
- `documentation` - 文档相关
- `help wanted` - 需要帮助
- `good first issue` - 适合新手的任务

## 💻 提交代码

### 开发流程

#### 1. Fork 项目

点击 GitHub 页面右上角的 **Fork** 按钮，将项目 Fork 到你的账号下。

#### 2. 克隆你的 Fork

```bash
git clone https://github.com/你的用户名/bread-dog-recite-words.git
cd bread-dog-recite-words
```

#### 3. 添加上游仓库

```bash
git remote add upstream https://github.com/原作者用户名/bread-dog-recite-words.git
```

#### 4. 创建特性分支

```bash
# 从最新的 main 分支创建
git checkout main
git pull upstream main
git checkout -b feature/your-feature-name

# 分支命名建议：
# feature/xxx - 新功能
# fix/xxx - Bug修复
# docs/xxx - 文档更新
# refactor/xxx - 代码重构
```

#### 5. 安装依赖

```bash
# 后端
cd word-wonderland-backend
npm install
cd ..

# 管理员后台
cd word-wonderland-admin
npm install
cd ..

# 学生端应用
cd word-wonderland-app
npm install
cd ..
```

#### 6. 进行开发

- 编写清晰、可维护的代码
- 遵循项目的代码规范
- 添加必要的注释
- 测试你的更改

#### 7. 提交更改

```bash
git add .
git commit -m "feat: 添加新功能描述"
```

提交信息格式请参考下方的 **代码规范** 部分。

#### 8. 保持与上游同步

在提交 PR 之前，确保你的分支是最新的：

```bash
git fetch upstream
git rebase upstream/main
```

如果有冲突，请解决冲突后继续：

```bash
git add .
git rebase --continue
```

#### 9. 推送到你的 Fork

```bash
git push origin feature/your-feature-name

# 如果已经 rebase，可能需要强制推送
git push -f origin feature/your-feature-name
```

#### 10. 创建 Pull Request

1. 访问你的 Fork 页面
2. 点击 **New Pull Request** 按钮
3. 填写 PR 标题和描述：
   - 清楚地说明你的更改内容
   - 关联相关的 Issue（使用 `Closes #issue_number`）
   - 添加截图或演示（如果是 UI 更改）
   - 列出测试步骤
4. 等待代码审查和反馈

## 📋 代码规范

### 提交信息格式

我们使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Type 类型：**

- `feat` - 新功能
- `fix` - Bug 修复
- `docs` - 文档更新
- `style` - 代码格式调整（不影响代码运行）
- `refactor` - 代码重构（既不是新功能也不是 Bug 修复）
- `perf` - 性能优化
- `test` - 测试相关
- `chore` - 构建过程或辅助工具的变动
- `ci` - CI/CD 相关

**示例：**

```bash
feat(admin): 添加批量导入单词功能

添加了从 Excel 文件批量导入单词的功能，支持：
- xlsx 格式文件
- 数据验证
- 错误提示

Closes #123
```

```bash
fix(backend): 修复单词更新时词性丢失的问题
```

```bash
docs: 更新 API 文档和部署指南
```

### 代码风格

#### JavaScript/React

- 使用 **2 个空格** 缩进
- 使用 **单引号** 而不是双引号
- 使用 **分号** 结尾
- 使用 **ES6+** 语法
- 组件使用 **函数式** 写法
- 使用 **箭头函数**

```javascript
// ✅ 推荐
const fetchWords = async () => {
  try {
    const response = await axios.get('/api/words');
    return response.data;
  } catch (error) {
    console.error('Error:', error);
  }
};

// ❌ 不推荐
function fetchWords() {
  return axios.get("/api/words").then(function(response) {
    return response.data
  })
}
```

#### 命名规范

- **组件名**：使用 PascalCase - `WordList.jsx`
- **文件名**：使用 PascalCase（组件）或 camelCase（工具函数）
- **变量名**：使用 camelCase - `wordList`, `currentPage`
- **常量名**：使用 UPPER_SNAKE_CASE - `API_BASE_URL`
- **CSS 类名**：使用 kebab-case - `word-card`, `btn-primary`

#### 注释规范

```javascript
/**
 * 获取单词列表
 * @param {number} page - 页码
 * @param {number} limit - 每页数量
 * @returns {Promise<Array>} 单词列表
 */
const getWords = async (page = 1, limit = 20) => {
  // 实现代码
};
```

### 文件组织

```
src/
├── components/          # 可复用组件
│   ├── Button/
│   │   ├── Button.jsx
│   │   └── Button.css
│   └── Card/
│       ├── Card.jsx
│       └── Card.css
├── pages/              # 页面组件
│   ├── WordManage.jsx
│   └── PhraseManage.jsx
├── services/           # API 服务
│   └── api.js
├── hooks/              # 自定义 Hooks
│   └── useToast.js
└── utils/              # 工具函数
    └── helpers.js
```

## 🧪 测试

在提交 PR 之前，请确保：

- ✅ 所有现有功能正常运行
- ✅ 你的新功能或修复经过测试
- ✅ 在不同浏览器中测试（Chrome, Firefox, Safari）
- ✅ 在不同设备上测试响应式布局（桌面端、平板、手机）
- ✅ 检查控制台是否有错误或警告
- ✅ 后端 API 返回正确的数据

### 测试清单

**前端：**
- [ ] UI 显示正常
- [ ] 交互功能正常（点击、输入、表单提交等）
- [ ] 加载状态和错误处理正确
- [ ] 移动端适配良好
- [ ] 无控制台错误

**后端：**
- [ ] API 返回正确的状态码和数据格式
- [ ] 错误处理完善
- [ ] 数据验证正确
- [ ] 日志记录清晰

## 📝 改进文档

文档改进同样重要！你可以：

- 修正拼写或语法错误
- 改进说明的清晰度和准确性
- 添加更多使用示例和截图
- 完善 API 文档
- 翻译文档到其他语言
- 补充常见问题解答

## 💡 其他贡献方式

即使你不提交代码，也有很多方式可以帮助项目：

- ⭐ **Star 项目** - 让更多人看到这个项目
- 📢 **分享项目** - 推荐给朋友或在社交媒体分享
- 💬 **参与讨论** - 在 Issues 中分享你的想法和建议
- 📖 **编写教程** - 分享使用经验和技巧
- 🎨 **设计建议** - 提出 UI/UX 改进建议
- 🌍 **翻译** - 帮助翻译文档或界面

## 🎯 适合新手的任务

如果你是第一次贡献开源项目，可以从这些简单的任务开始：

- 修复文档中的拼写错误
- 改进代码注释
- 添加更多的示例
- 优化 CSS 样式
- 修复标记为 `good first issue` 的问题

## 📧 联系方式

如果你有任何问题或需要帮助，欢迎通过以下方式联系：

- 💬 提交 [Issue](https://github.com/你的用户名/bread-dog-recite-words/issues)
- 🗣️ 发起 [Discussion](https://github.com/你的用户名/bread-dog-recite-words/discussions)
- 📧 发送邮件给维护者

## 📜 代码审查

所有的 Pull Request 都会经过代码审查。审查者可能会：

- 提出改进建议
- 要求修改代码风格
- 询问设计决策
- 请求添加测试或文档

请不要气馁，这是为了保证代码质量。我们会尽快审查你的 PR，并提供建设性的反馈。

## ✅ PR 合并条件

你的 PR 需要满足以下条件才能被合并：

- [ ] 通过代码审查
- [ ] 符合代码规范
- [ ] 没有引入新的 Bug
- [ ] 功能测试通过
- [ ] 文档已更新（如需要）
- [ ] 提交信息格式正确

## 🙏 行为准则

为了营造一个友好、包容的社区环境，请遵守以下准则：

- ✅ 友善和尊重他人
- ✅ 欢迎不同的观点和经验
- ✅ 接受建设性的批评
- ✅ 关注对社区最有利的事情
- ✅ 对其他社区成员表示同理心

- ❌ 使用性别化语言或图像
- ❌ 人身攻击或政治攻击
- ❌ 公开或私下骚扰
- ❌ 未经许可发布他人的私人信息

---

## 🎉 感谢你的贡献！

每一个贡献都很重要，无论大小。感谢你花时间帮助改进 Word Wonderland！

如果你的 PR 被合并，你的名字将会出现在项目的贡献者列表中。让我们一起打造一个更好的英语学习平台！✨

---

**再次感谢！** 💖

如有任何疑问，请随时在 Issues 中提问。

