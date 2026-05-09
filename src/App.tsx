import React, { useEffect, useRef } from 'react'
import { useWeather } from './hooks/useWeather'
import WeatherIcon from './components/WeatherIcon'
import Sidebar from './components/Sidebar'
import HourlyForecast from './components/HourlyForecast'
import WeatherDetails from './components/WeatherDetails'
import { format } from 'date-fns'
import { getBgClass, getRainIntensity, getSnowIntensity, getWeatherLabel, getWeatherType } from './utils/weatherCode'
import './index.css'

// 创建雨线动画数据
const createRainLines = (count: number) =>
	Array.from({ length: count }, (_, index) => {
		const ratio = index / count
		const jitter = Math.sin(index * 12.9898) * 43758.5453
		const frac = jitter - Math.floor(jitter)
		const left = Math.min(98, Math.max(2, ratio * 96 + 2 + (frac - 0.5) * 12))
		const duration = 3.2 + (index % 6) * 0.35
		const delay = -((index % 7) * 0.45)
		const opacity = 0.25 + (index % 4) * 0.08
		const length = 10 + (index % 5) * 3
		return { left, duration, delay, opacity, length }
	})

// 创建雪花动画数据
const createSnowFlakes = (count: number) =>
	Array.from({ length: count }, (_, index) => {
		const ratio = index / count
		const jitter = Math.sin(index * 78.233) * 43758.5453
		const frac = jitter - Math.floor(jitter)
		const left = Math.min(98, Math.max(2, ratio * 96 + 2 + (frac - 0.5) * 18))
		const size = 2 + (index % 4) * 1.4
		const duration = 7 + (index % 6) * 0.8
		const delay = -((index % 8) * 0.65)
		const opacity = 0.4 + (index % 4) * 0.12
		return { left, size, duration, delay, opacity }
	})

// 预生成动画数据（避免每次渲染重新计算）
const BASE_RAIN_COUNT = 36
const RAIN_LINES = createRainLines(BASE_RAIN_COUNT)
const RAIN_LINES_SHOWER = createRainLines(BASE_RAIN_COUNT * 2)
const RAIN_LINES_HEAVY = createRainLines(BASE_RAIN_COUNT * 4)

const BASE_SNOW_COUNT = 28
const SNOW_FLAKES = createSnowFlakes(BASE_SNOW_COUNT)
const SNOW_FLAKES_HEAVY = createSnowFlakes(BASE_SNOW_COUNT * 2)

function App() {
	// 使用天气 hook 获取所有功能
	const {
		data,
		loading,
		error,
		fetchWeather,
		city,
		favorites,
		addFavorite,
		removeFavorite,
		reorderFavorites,
		selectFavorite,
		activeCityId,
	} = useWeather()

	const inputRef = useRef<HTMLInputElement>(null)
	const thunderRef = useRef<HTMLDivElement>(null)

	// 更新搜索框中的城市名
	useEffect(() => {
		if (city && inputRef.current) {
			inputRef.current.value = city
		}
	}, [city])

	// 随机设置闪电动画参数
	useEffect(() => {
		const node = thunderRef.current
		if (!node) return
		node.style.animationDelay = `${-Math.random() * 6}s`
		node.style.animationDuration = `${5 + Math.random() * 4}s`
	}, [])

	// 处理搜索提交
	const handleSearch = (e: React.FormEvent) => {
		e.preventDefault()
		const value = inputRef.current?.value.trim() ?? ''
		fetchWeather(value)
	}

	// 检查当前城市是否已收藏
	const isFavorite = data ? favorites.some((f) => f.name === data.city) : false

	// 根据天气代码计算背景和动画效果
	const effectiveCode = data?.currentCode ?? 0
	const weatherType = getWeatherType(effectiveCode)
	const bgClass = getBgClass(effectiveCode)
	const weatherLabel = data ? getWeatherLabel(effectiveCode) : ''
	const isThunder = weatherType === 'thunder'
	const isRainy = weatherType === 'rainy' || isThunder
	const isSnowy = weatherType === 'snowy'
	const isCloudy = weatherType === 'cloudy'
	const isFog = weatherType === 'fog'

	// 计算雨量强度和对应动画
	const rainIntensity = isRainy ? getRainIntensity(effectiveCode) : 'none'
	const rainMultiplier = isThunder ? 2 : rainIntensity === 'heavy' ? 4 : rainIntensity === 'shower' ? 2 : 1
	const rainLines = rainMultiplier === 4 ? RAIN_LINES_HEAVY : rainMultiplier === 2 ? RAIN_LINES_SHOWER : RAIN_LINES

	// 计算雪量强度和对应动画
	const snowIntensity = isSnowy ? getSnowIntensity(effectiveCode) : 'none'
	const snowMultiplier = snowIntensity === 'shower' || snowIntensity === 'heavy' ? 2 : 1
	const snowFlakes = snowMultiplier === 2 ? SNOW_FLAKES_HEAVY : SNOW_FLAKES

	return (
		<div
			className={`app-container ${bgClass} ${isRainy ? 'rain-active' : ''} ${
				isSnowy ? 'snow-active' : ''
			} ${isThunder ? 'thunder-active' : ''} ${isCloudy ? 'cloudy-active' : ''} ${isFog ? 'fog-active' : ''}`}
		>
			{/* 背景动画层 */}
			<div className="cloud-layer" aria-hidden="true" />
			<div className="fog-layer" aria-hidden="true" />
			<div className="rain-drops" aria-hidden="true">
				{rainLines.map((line, index) => (
					<i
						key={index}
						style={{
							left: `${line.left}%`,
							height: `${line.length}vh`,
							opacity: line.opacity,
							animationDuration: `${line.duration}s`,
							animationDelay: `${line.delay}s`,
						}}
					/>
				))}
			</div>
			<div className="snow-drops" aria-hidden="true">
				{snowFlakes.map((flake, index) => (
					<i
						key={index}
						style={{
							left: `${flake.left}%`,
							width: `${flake.size}px`,
							height: `${flake.size}px`,
							opacity: flake.opacity,
							animationDuration: `${flake.duration}s`,
							animationDelay: `${flake.delay}s`,
						}}
					/>
				))}
			</div>
			<div className="thunder-flash" aria-hidden="true" ref={thunderRef} />

			{/* 主布局 */}
			<div className="main-layout">
				{/* 侧边栏 */}
				<Sidebar
					favorites={favorites}
					activeCityId={activeCityId}
					onSelect={selectFavorite}
					onRemove={removeFavorite}
					onReorder={reorderFavorites}
				/>

				{/* 主内容区 */}
				<div className="weather-card">
					{/* 搜索和收藏按钮 */}
					<div className="search-row">
						<form onSubmit={handleSearch} className="search-form">
							<input
								type="text"
								placeholder="输入城市名称（如：北京）"
								ref={inputRef}
							/>
							<button type="submit">查询</button>
						</form>
						{data && (
							<button
								className={`favorite-btn ${isFavorite ? 'is-favorite' : ''}`}
								onClick={addFavorite}
								disabled={isFavorite}
								title={isFavorite ? '已收藏' : '添加到收藏'}
							>
								{isFavorite ? '⭐' : '☆'}
							</button>
						)}
					</div>

					{/* 加载和错误状态 */}
					{loading && <p className="loading-text">查询中...</p>}
					{error && <p className="error-text">{error}</p>}

					{/* 天气数据展示 */}
					{data && !loading && (
						<>
							{/* 当前天气基本信息 */}
							<div className="current-weather">
								<h1 style={{ margin: '0 0 10px' }}>{data.city}</h1>
								<p className="weather-desc">{weatherLabel}</p>
								<div className="temperature-display">
									<WeatherIcon code={effectiveCode} />
									<span className="current-temp">{Math.round(data.currentTemp)}°</span>
								</div>
							</div>

							{/* 每日预报 */}
							<div className="daily-forecast">
								{data.daily.map((day) => (
									<div key={day.date} className="day-item">
										<span>{format(new Date(day.date), 'EEE')}</span>
										<div className="day-icon">
											<WeatherIcon code={day.weatherCode} size="small" />
										</div>
										<span className="day-desc">{getWeatherLabel(day.weatherCode)}</span>
										<span className="day-temp">
											{Math.round(day.tempMin)}° / {Math.round(day.tempMax)}°
										</span>
									</div>
								))}
							</div>

							{/* 24小时预报 */}
							<HourlyForecast hourlyData={data.hourly} />

							{/* 详细天气信息 */}
							<WeatherDetails details={data.details} />
						</>
					)}
				</div>
			</div>
		</div>
	)
}

export default App
