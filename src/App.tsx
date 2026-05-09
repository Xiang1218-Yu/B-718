import React, { useEffect, useRef, useState } from 'react'
import { useWeather } from './hooks/useWeather'
import { useFavorites } from './hooks/useFavorites'
import Sidebar from './components/Sidebar'
import WeatherIcon from './components/WeatherIcon'
import HourlyForecastView from './components/HourlyForecast'
import TemperatureChart from './components/TemperatureChart'
import WeatherDetailView from './components/WeatherDetail'
import { format } from 'date-fns'
import { getBgClass, getRainIntensity, getSnowIntensity, getWeatherLabel, getWeatherType } from './utils/weatherCode'
import './index.css'

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

const BASE_RAIN_COUNT = 36
const RAIN_LINES = createRainLines(BASE_RAIN_COUNT)
const RAIN_LINES_SHOWER = createRainLines(BASE_RAIN_COUNT * 2)
const RAIN_LINES_HEAVY = createRainLines(BASE_RAIN_COUNT * 4)

const BASE_SNOW_COUNT = 28
const SNOW_FLAKES = createSnowFlakes(BASE_SNOW_COUNT)
const SNOW_FLAKES_HEAVY = createSnowFlakes(BASE_SNOW_COUNT * 2)

function App() {
	const { data, loading, error, fetchWeather, city } = useWeather()
	const { favorites, addFavorite, removeFavorite, reorderFavorites, isFavorite } = useFavorites()
	const inputRef = useRef<HTMLInputElement>(null)
	const thunderRef = useRef<HTMLDivElement>(null)
	const [sidebarOpen, setSidebarOpen] = useState(false)

	// 同步输入框与当前城市
	useEffect(() => {
		if (city && inputRef.current) {
			inputRef.current.value = city
		}
	}, [city])

	useEffect(() => {
		const node = thunderRef.current
		if (!node) return
		node.style.animationDelay = `${-Math.random() * 6}s`
		node.style.animationDuration = `${5 + Math.random() * 4}s`
	}, [])

	const handleSearch = (e: React.FormEvent) => {
		e.preventDefault()
		const value = inputRef.current?.value.trim() ?? ''
		fetchWeather(value)
	}

	/** 侧边栏切换城市 */
	const handleSelectCity = (name: string) => {
		fetchWeather(name)
	}

	/** 收藏当前城市 */
	const handleAddFavorite = () => {
		if (city && !isFavorite(city)) {
			addFavorite(city)
		}
	}

	const effectiveCode = data?.currentCode ?? 0
	const weatherType = getWeatherType(effectiveCode)
	const bgClass = getBgClass(effectiveCode)
	const weatherLabel = data ? getWeatherLabel(effectiveCode) : ''
	const isThunder = weatherType === 'thunder'
	const isRainy = weatherType === 'rainy' || isThunder
	const isSnowy = weatherType === 'snowy'
	const isCloudy = weatherType === 'cloudy'
	const isFog = weatherType === 'fog'
	const rainIntensity = isRainy ? getRainIntensity(effectiveCode) : 'none'
	const rainMultiplier = isThunder ? 2 : rainIntensity === 'heavy' ? 4 : rainIntensity === 'shower' ? 2 : 1
	const rainLines = rainMultiplier === 4 ? RAIN_LINES_HEAVY : rainMultiplier === 2 ? RAIN_LINES_SHOWER : RAIN_LINES
	const snowIntensity = isSnowy ? getSnowIntensity(effectiveCode) : 'none'
	const snowMultiplier = snowIntensity === 'shower' || snowIntensity === 'heavy' ? 2 : 1
	const snowFlakes = snowMultiplier === 2 ? SNOW_FLAKES_HEAVY : SNOW_FLAKES

	return (
		<div
			className={`app-container ${bgClass} ${isRainy ? 'rain-active' : ''} ${
				isSnowy ? 'snow-active' : ''
			} ${isThunder ? 'thunder-active' : ''} ${isCloudy ? 'cloudy-active' : ''} ${isFog ? 'fog-active' : ''}`}>
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

			{/* 侧边栏：收藏城市管理 */}
			<Sidebar
				favorites={favorites}
				currentCity={city}
				onSelect={handleSelectCity}
				onRemove={removeFavorite}
				onReorder={reorderFavorites}
				isFavorite={isFavorite(city)}
				onAddFavorite={handleAddFavorite}
				open={sidebarOpen}
				onToggle={() => setSidebarOpen((v) => !v)}
			/>

			{/* 主内容区 */}
			<div className='weather-card'>
				<form onSubmit={handleSearch} className='search-form'>
					<input
						type='text'
						placeholder='输入城市名称（如：北京）'
						ref={inputRef}
					/>
					<button type='submit'>查询</button>
				</form>

				{loading && <p>查询中...</p>}
				{error && <p style={{ color: '#ff6b6b' }}>{error}</p>}

				{data && !loading && (
					<>
						<h1 style={{ margin: '0 0 10px' }}>{data.city}</h1>
						<p className='weather-desc'>{weatherLabel}</p>
						<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '20px 0' }}>
							<WeatherIcon code={effectiveCode} />
							<span style={{ fontSize: '4rem', marginLeft: '20px' }}>{Math.round(data.currentTemp)}°</span>
						</div>

						{/* 未来3天日预报 */}
						<div className='daily-forecast'>
							{data.daily.map((day) => (
								<div key={day.date} className='day-item'>
									<span>{format(new Date(day.date), 'EEE')}</span>
									<div style={{ transform: 'scale(0.5)', margin: '-10px 0' }}>
										<WeatherIcon code={day.weatherCode} size='small' />
									</div>
									<span className='day-desc'>{getWeatherLabel(day.weatherCode)}</span>
									<span>
										{Math.round(day.tempMin)}° / {Math.round(day.tempMax)}°
									</span>
								</div>
							))}
						</div>

						{/* 24小时逐小时预报 */}
						<HourlyForecastView hourly={data.hourly} />

						{/* 温度变化趋势SVG图表 */}
						<TemperatureChart hourly={data.hourly} />

						{/* 详细天气数据 */}
						<WeatherDetailView detail={data.detail} />
					</>
				)}
			</div>
		</div>
	)
}

export default App
