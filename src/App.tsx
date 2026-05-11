import React, { useEffect, useRef, useState } from 'react'
import { useWeather } from './hooks/useWeather'
import { useFavoriteCities } from './hooks/useFavoriteCities'
import type { FavoriteCity } from './hooks/useFavoriteCities'
import WeatherIcon from './components/WeatherIcon'
import Sidebar from './components/Sidebar'
import HourlyForecast from './components/HourlyForecast'
import TempTrendChart from './components/TempTrendChart'
import WeatherDetails from './components/WeatherDetails'
import { format } from 'date-fns'
import { getBgClass, getRainIntensity, getSnowIntensity, getWeatherLabel, getWeatherType } from './utils/weatherCode'
import './index.css'

// 生成雨线动画数据
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

// 生成雪花动画数据
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

// 预生成雨雪动画数据
const BASE_RAIN_COUNT = 36
const RAIN_LINES = createRainLines(BASE_RAIN_COUNT)
const RAIN_LINES_SHOWER = createRainLines(BASE_RAIN_COUNT * 2)
const RAIN_LINES_HEAVY = createRainLines(BASE_RAIN_COUNT * 4)

const BASE_SNOW_COUNT = 28
const SNOW_FLAKES = createSnowFlakes(BASE_SNOW_COUNT)
const SNOW_FLAKES_HEAVY = createSnowFlakes(BASE_SNOW_COUNT * 2)

function App() {
	// 天气数据 Hook
	const { data, loading, error, fetchWeather, city } = useWeather()
	// 收藏城市 Hook
	const {
		favorites,
		activeCity,
		draggedIndex,
		addFavorite,
		removeFavorite,
		isFavorite,
		selectCity,
		handleDragStart,
		handleDragOver,
		handleDragEnd,
	} = useFavoriteCities()

	// 搜索输入框引用
	const inputRef = useRef<HTMLInputElement>(null)
	// 闪电动画引用
	const thunderRef = useRef<HTMLDivElement>(null)
	// 侧边栏开关状态
	const [sidebarOpen, setSidebarOpen] = useState(false)

	// 当城市变化时更新搜索框内容
	useEffect(() => {
		if (city && inputRef.current) {
			inputRef.current.value = city
		}
	}, [city])

	// 初始化闪电动画延迟
	useEffect(() => {
		const node = thunderRef.current
		if (!node) return
		node.style.animationDelay = `${-Math.random() * 6}s`
		node.style.animationDuration = `${5 + Math.random() * 4}s`
	}, [])

	// 搜索天气处理函数
	const handleSearch = (e: React.FormEvent) => {
		e.preventDefault()
		const value = inputRef.current?.value.trim() ?? ''
		fetchWeather(value)
	}

	// 收藏/取消收藏当前城市
	const handleToggleFavorite = () => {
		if (!data) return

		if (isFavorite(data.city)) {
			const fav = favorites.find(f => f.name === data.city)
			if (fav) {
				removeFavorite(fav.id)
			}
		} else {
			addFavorite({
				name: data.city,
				latitude: data.latitude,
				longitude: data.longitude,
			})
		}
	}

	// 从收藏列表选择城市
	const handleCitySelect = (favoriteCity: FavoriteCity) => {
		selectCity(favoriteCity.id)
		fetchWeather(favoriteCity.name)
		setSidebarOpen(false)
	}

	// 计算天气类型和相关效果
	const effectiveCode = data?.currentCode ?? 0
	const weatherType = getWeatherType(effectiveCode)
	const bgClass = getBgClass(effectiveCode)
	const weatherLabel = data ? getWeatherLabel(effectiveCode) : ''
	const isThunder = weatherType === 'thunder'
	const isRainy = weatherType === 'rainy' || isThunder
	const isSnowy = weatherType === 'snowy'
	const isCloudy = weatherType === 'cloudy'
	const isFog = weatherType === 'fog'

	// 计算雨雪强度
	const rainIntensity = isRainy ? getRainIntensity(effectiveCode) : 'none'
	const rainMultiplier = isThunder ? 2 : rainIntensity === 'heavy' ? 4 : rainIntensity === 'shower' ? 2 : 1
	const rainLines = rainMultiplier === 4 ? RAIN_LINES_HEAVY : rainMultiplier === 2 ? RAIN_LINES_SHOWER : RAIN_LINES

	const snowIntensity = isSnowy ? getSnowIntensity(effectiveCode) : 'none'
	const snowMultiplier = snowIntensity === 'shower' || snowIntensity === 'heavy' ? 2 : 1
	const snowFlakes = snowMultiplier === 2 ? SNOW_FLAKES_HEAVY : SNOW_FLAKES

	// 检查当前城市是否已收藏
	const cityIsFavorite = data ? isFavorite(data.city) : false

	return (
		<div
			className={`app-container ${bgClass} ${isRainy ? 'rain-active' : ''} ${
				isSnowy ? 'snow-active' : ''
			} ${isThunder ? 'thunder-active' : ''} ${isCloudy ? 'cloudy-active' : ''} ${isFog ? 'fog-active' : ''}`}>
			{/* 侧边栏组件 */}
			<Sidebar
				favorites={favorites}
				activeCity={activeCity}
				draggedIndex={draggedIndex}
				currentCity={city}
				onCitySelect={handleCitySelect}
				onRemoveFavorite={removeFavorite}
				onDragStart={handleDragStart}
				onDragOver={handleDragOver}
				onDragEnd={handleDragEnd}
				isOpen={sidebarOpen}
				onToggle={() => setSidebarOpen(!sidebarOpen)}
			/>

			{/* 背景动画层 */}
			<div className='cloud-layer' aria-hidden='true' />
			<div className='fog-layer' aria-hidden='true' />
			<div className='rain-drops' aria-hidden='true'>
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
			<div className='snow-drops' aria-hidden='true'>
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
			<div
				className='thunder-flash'
				aria-hidden='true'
				ref={thunderRef}
			/>

			{/* 主内容区域 */}
			<main className='main-content'>
				<div className='weather-card'>
					{/* 搜索表单 */}
					<form onSubmit={handleSearch} className='search-form'>
						<input
							type='text'
							placeholder='输入城市名称（如：北京）'
							ref={inputRef}
						/>
						<button type='submit'>查询</button>
					</form>

					{/* 加载和错误状态 */}
					{loading && <p className='status-text'>查询中...</p>}
					{error && <p className='status-text error'>{error}</p>}

					{/* 天气数据展示 */}
					{data && !loading && (
						<>
							{/* 城市名称和收藏按钮 */}
							<div className='city-header'>
								<h1 className='city-name'>{data.city}</h1>
								<button
									className={`favorite-btn ${cityIsFavorite ? 'favorited' : ''}`}
									onClick={handleToggleFavorite}
									title={cityIsFavorite ? '取消收藏' : '收藏城市'}
								>
									{cityIsFavorite ? '⭐' : '☆'}
								</button>
							</div>

							{/* 天气描述 */}
							<p className='weather-desc'>{weatherLabel}</p>

							{/* 当前天气图标和温度 */}
							<div className='current-weather'>
								<WeatherIcon code={effectiveCode} />
								<span className='current-temp'>{Math.round(data.currentTemp)}°</span>
							</div>

							{/* 温度趋势图表 */}
							<TempTrendChart hourlyData={data.hourly} />

							{/* 24小时预报 */}
							<HourlyForecast hourlyData={data.hourly} />

							{/* 每日预报 */}
							<div className='daily-forecast'>
								<h3 className='section-title'>未来3天</h3>
								<div className='daily-list'>
									{data.daily.map((day) => (
										<div key={day.date} className='day-item'>
											<span className='day-name'>{format(new Date(day.date), 'EEE')}</span>
											<div className='day-icon'>
												<WeatherIcon code={day.weatherCode} size='small' />
											</div>
											<span className='day-desc'>{getWeatherLabel(day.weatherCode)}</span>
											<span className='day-temp'>
												{Math.round(day.tempMin)}° / {Math.round(day.tempMax)}°
											</span>
										</div>
									))}
								</div>
							</div>

							{/* 详细天气信息 */}
							<WeatherDetails details={data.details} />
						</>
					)}
				</div>
			</main>
		</div>
	)
}

export default App
