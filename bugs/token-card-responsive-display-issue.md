# 代币信息卡片响应式显示问题

## 问题描述

在ElizaOS界面上，代币信息卡片在窄屏幕设备或窄容器中显示被挤压，布局错乱，信息无法正常显示。

## 错误详情

代币信息卡片在窄屏幕环境下出现以下问题：
1. 表格列宽固定导致内容溢出
2. Flex布局元素在小屏幕上挤压
3. 字体和间距在窄容器中显示不当

## 根本原因

`src/actions/gecko-token-info.ts` 文件中HTML格式化的CSS样式没有考虑响应式设计：
1. 表格中固定列宽设置（如`width: 80px`）
2. 缺乏媒体查询适配窄屏幕
3. Flex布局没有设置合适的换行和最小宽度

## 具体问题位置

**文件**: `src/actions/gecko-token-info.ts`

### 问题代码段（185-325行）

1. **第228-233行**: 地址行设置了固定列宽
```html
<td style="padding: 6px; border: 1px solid #374151; font-weight: 500; color: #d1d5db; width: 80px; font-size: 11px;">地址</td>
```

2. **第200-224行**: 头部Flex布局没有考虑窄屏换行
```html
<div class="token-header" style="
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #374151;
">
```

3. **第227行**: 表格宽度设置为100%但内部单元格固定宽度
```html
<table style="width: 100%; border-collapse: collapse; margin-bottom: 12px; font-size: 12px;">
```

## 解决方案

### 1. 改进表格布局 - 移除固定列宽，使用响应式单位

```css
/* 使用百分比宽度和弹性布局 */
table { width: 100%; border-collapse: collapse; margin-bottom: 12px; font-size: 12px; table-layout: auto; }
td:first-child { min-width: 70px; width: 30%; word-break: keep-all; white-space: nowrap; }
td:last-child { width: 70%; word-wrap: break-word; }
```

### 2. 添加媒体查询适应窄屏幕

```css
/* 窄屏幕适配 */
@media screen and (max-width: 480px) {
  .token-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  table {
    font-size: 11px;
  }

  td {
    padding: 4px;
  }

  .token-card {
    padding: 8px;
  }
}
```

### 3. 优化Flex布局适应性

```css
.token-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start; /* 改为flex-start适应窄屏 */
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #374151;
  flex-wrap: wrap; /* 允许换行 */
  gap: 8px; /* 添加间距 */
}
```

## 修复措施

1. **移除固定宽度**: 将固定像素宽度改为百分比或最小宽度
2. **添加响应式断点**: 为窄屏幕添加媒体查询
3. **优化字体大小**: 在小屏幕上使用更合适的字体大小
4. **表格布局改进**: 使用`table-layout: auto`和`word-wrap: break-word`

## 测试验证

- [x] 在窄容器中测试代币信息显示
- [x] 验证表格内容不会溢出
- [x] 确保所有信息在窄屏上可读
- [x] 测试各种屏幕尺寸下的显示效果

## 相关文件

- `src/actions/gecko-token-info.ts` - 主要修复文件

## 修复详情

本次修复主要针对代币信息卡片在窄屏幕设备上的显示问题，通过以下方式优化了响应式显示效果：

1. **移除固定宽度**: 将表格中的固定像素宽度（如`width: 80px`）改为百分比宽度和最小宽度设置
2. **优化Flex布局**: 在头部信息中添加`flex-wrap: wrap`和`gap`属性，确保元素在窄屏上能正确换行
3. **改进文本换行**: 为所有可能溢出的文本元素添加`word-wrap: break-word`和`word-break: break-all`属性
4. **增强容器适应性**: 为卡片容器添加`max-width: 100%`和`overflow-wrap: break-word`确保整体适应性
5. **优化细节显示**: 为按钮和标签添加`flex-shrink: 0`防止在窄屏上被压缩

## 修复日期

2025-01-25

## 修复人

Claude Code