# 极简天气 Minimalist Weather

一个基于 React + Vite 的极简天气应用，支持中文城市查询、动态天气背景与 CSS 图标。

## 功能

- 城市搜索，展示当前温度与天气描述
- 未来 3 天预报（低温/高温）
- 动态背景：晴天/阴天/有雾/降雨/降雪/雷暴
- CSS 绘制极简天气图标（太阳/云/雨/雪/雾）
- 记住上次查询城市（localStorage）

## 技术栈

- React 19 + TypeScript + Vite 7
- axios、date-fns
- ESLint (react-hooks / react-refresh)

## 数据来源

- Open-Meteo 地理编码 + 天气预报
- 无需 API Key

## 本地运行

```bash
pnpm install
pnpm dev
```

## 其他脚本

- `pnpm lint`
- `pnpm build`
- `pnpm preview`

## 代码架构

项目采用扁平化结构，核心逻辑分离为 UI 组件、自定义 Hooks 和工具函数。

```text
src/
├── App.tsx                 # 主入口组件，包含核心布局与状态消费
├── main.tsx                # 应用渲染入口
├── components/
│   └── WeatherIcon.tsx     # 纯 CSS 实现的动态天气图标组件
├── hooks/
│   └── useWeather.ts       # 核心业务逻辑 Hook (数据获取、缓存、状态管理)
├── utils/
│   └── weatherCode.ts      # 天气代码映射与背景样式配置
└── assets/                 # 静态资源目录
```

### 架构说明

1. **表现层 (View Layer)**
   - `App.tsx`: 负责整体布局、背景动效渲染（云/雨/雾/雷层）以及用户交互界面。
   - `components/WeatherIcon.tsx`: 独立的展示型组件，根据天气代码渲染对应的 CSS 图标。

2. **逻辑层 (Logic Layer)**
   - `hooks/useWeather.ts`: 封装所有非 UI 逻辑。
     - **数据获取**: 集成 Open-Meteo API。
     - **状态管理**: 处理 Loading、Error、Weather Data 状态。
     - **持久化**: 自动同步最后一次查询的城市到 localStorage。

3. **工具层 (Utils Layer)**
   - `utils/weatherCode.ts`: 维护天气状态的单一数据源。
     - 映射 WMO 天气代码到中文描述。
     - 映射天气代码到 CSS 背景类名。
     - 映射天气代码到图标类型。

## 工程细节

- 数据流：`useWeather` 统一处理查询、状态管理与 localStorage 恢复
- 天气映射：`weatherCode.ts` 负责类型、强度与背景类名的集中映射
- 动效分层：云/雾/雨/雪/雷暴为独立层，互不干扰叠加展示
- 雷暴效果：使用随机化的闪烁延迟与时长，避免节奏固定
- 展示细节：预报为低/高温，卡片阴影随背景色变化
