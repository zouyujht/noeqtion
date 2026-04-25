# Noeqtion Extension Test Cases (Noeqtion 插件测试用例)

> **使用说明 / Instructions:**
> 1. 将本文档的内容全部复制并粘贴到一个新的 Notion 页面中。
> 2. 粘贴后，选中“测试折叠列表”部分的无序列表（包含子层级），将它们转换为 Notion 的 **“折叠列表” (Toggle list)**，然后**将它们折叠（闭合）起来**。
> 3. 使用快捷键 `Ctrl+Alt+M` (或通过插件图标点击 Convert) 运行插件进行测试。

---

## 1. 测试用例 1: 括号内的公式不应换行分离 (Issue #1 Test)

### 英文文本 (English Text)
This is a normal inline equation $O(n)$ in the text.
Here is an equation enclosed in English parentheses ($E=mc^2$) to test if it renders correctly without breaking the line.
Another sequence test ($x_1, x_2, \dots, x_n$) inside parentheses.

### 中文文本 (Chinese Text)
这是一个普通的行内公式 $y = ax + b$ 测试。
这是在中文全角括号内的公式（$E_0 = \frac{1}{2}h\nu$），用于测试转换后是否会单独成块。
另一个序列示例（$n=0, 1, 2...$）测试。

---

## 2. 测试用例 2: 折叠列表中的公式转换 (Issue #2 Test)

*请在 Notion 中将下面的无序列表转换为“折叠列表（Toggle list）”，并确保测试前处于**折叠状态**：*

- Toggle List Item 1 (第一层折叠列表，请点击展开我)
  - Inside the folded list, we have an equation $A = \pi r^2$.
  - 这是一个隐藏在折叠列表中的公式，并且在中文括号内（$\int_0^\infty e^{-x^2}dx$），用于同时测试两个修复。
  - Nested Toggle (嵌套的第二层折叠列表)
    - Deeply nested equation $F = ma$.
    - 深度嵌套的中文括号公式（$\sum_{i=1}^{n} i = \frac{n(n+1)}{2}$）。
