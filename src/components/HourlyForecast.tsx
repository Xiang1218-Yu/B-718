import React, { useMemo } from 'react'
import type { HourlyForecast as HourlyForecastType } from '../hooks/useWeather'
import WeatherIcon from './WeatherIcon'
import { getWeatherLabel } from '../utils/weatherCode'

// 小时预报组件
interface HourlyForecastProps {
	hourlyData: HourlyForecastType[]
}

const HourlyForecast: React.FC<HourlyForecastProps> = ({ hourlyData }) => {
	// 计算 SVG 图表的路径和坐标
	const { pathData, points, minTemp, maxTemp, yAxisTicks, xAxisLabels } = useMemo(() => {
		const temps = hourlyData.map((h) => h.temperature)
		const minTemp = Math.min(...temps) - 2
		const maxTemp = Math.max(...temps) + 2
		const tempRange = maxTemp - minTemp

		const width = 720
		const height = 200
		const paddingLeft = 45
		const paddingRight = 15
		const paddingTop = 25
		const paddingBottom = 35
		const innerWidth = width - paddingLeft - paddingRight
		const innerHeight = height - paddingTop - paddingBottom

		// 计算每个点的坐标
		const points = hourlyData.map((h, index) => {
			const x = paddingLeft + (index / (hourlyData.length - 1)) * innerWidth
			const y = paddingTop + innerHeight - ((h.temperature - minTemp) / tempRange) * innerHeight
			return { x, y, temp: h.temperature, time: h.time, code: h.weatherCode }
		})

		// 生成平滑的贝塞尔曲线路径
		let pathData = `M ${points[0].x} ${points[0].y}`
		for (let i = 0; i < points.length - 1; i++) {
			const xMid = (points[i].x + points[i + 1].x) / 2
			pathData += ` Q ${points[i].x} ${points[i].y}, ${xMid} ${(points[i].y + points[i + 1].y) / 2}`
		}
		pathData += ` L ${points[points.length - 1].x} ${points[points.length - 1].y}`

		// 计算 Y 轴刻度（5个刻度）
		const yAxisTicks = []
		const tickCount = 5
		for (let i = 0; i <= tickCount; i++) {
			const ratio = i / tickCount
			const temp = minTemp + ratio * tempRange
			const y = paddingTop + innerHeight - ratio * innerHeight
			yAxisTicks.push({ temp: Math.round(temp), y })
		}

		// 计算 X 轴标签（每3小时一个）
		const xAxisLabels = []
		for (let i = 0; i < hourlyData.length; i += 3) {
			const date = new Date(hourlyData[i].time)
			const label = `${date.getHours().toString().padStart(2, '0')}:00`
			xAxisLabels.push({
				label,
				x: paddingLeft + (i / (hourlyData.length - 1)) * innerWidth,
			})
		}

		return { pathData, points, minTemp, maxTemp, yAxisTicks, xAxisLabels }
	}, [hourlyData])

	// 格式化时间（只显示小时）
	const formatHour = (timeStr: string) => {
		const date = new Date(timeStr)
		return `${date.getHours().toString().padStart(2, '0')}:00`
	}

	// 判断是否为当前小时（用于高亮）
	const isCurrentHour = (timeStr: string) => {
		const date = new Date(timeStr)
		const now = new Date()
		return date.getHours() === now.getHours() && date.getDate() === now.getDate()
	}

	return (
		<div className="hourly-forecast">
			<h3 className="section-title">24小时预报</h3>

			{/* SVG 温度曲线图表 */}
			<div className="chart-container">
				<svg
					viewBox="0 0 720 200"
					className="temperature-chart"
					preserveAspectRatio="xMidYMid meet"
				>
					{/* 背景渐变定义 */}
					<defs>
						<linearGradient id="tempGradient" x1="0%" y1="0%" x2="0%" y2="100%">
							<stop offset="0%" stopColor="#ff6b6b" stopOpacity="0.4" />
							<stop offset="50%" stopColor="#ffd93d" stopOpacity="0.3" />
							<stop offset="100%" stopColor="#4ecdc4" stopOpacity="0.2" />
						</linearGradient>
						<linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
							<stop offset="0%" stopColor="#ff6b6b" />
							<stop offset="50%" stopColor="#ffd93d" />
							<stop offset="100%" stopColor="#4ecdc4" />
						</linearGradient>
					</defs>

					{/* Y 轴网格线和刻度标签 */}
					{yAxisTicks.map((tick, index) => (
						<g key={index}>
							{/* 网格线 */}
							<line
								x1={45}
								y1={tick.y}
								x2={705}
								y2={tick.y}
								stroke={index === yAxisTicks.length - 1 ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)'}
								strokeWidth={index === yAxisTicks.length - 1 ? 2 : 1}
								strokeDasharray={index === yAxisTicks.length - 1 ? 'none' : '4,4'}
							/>
							{/* Y 轴温度标签 */}
							<text
								x={40}
								y={tick.y + 4}
								fill="rgba(255,255,255,0.7)"
								fontSize="11"
								textAnchor="end"
							>
								{tick.temp}°
							</text>
						</g>
					))}

					{/* X 轴时间标签 */}
					{xAxisLabels.map((item, index) => (
						<text
							key={index}
							x={item.x}
							y={195}
							fill="rgba(255,255,255,0.7)"
							fontSize="11"
							textAnchor="middle"
						>
							{item.label}
						</text>
					))}

					{/* 温度曲线 */}
					<path
						d={pathData}
						fill="none"
						stroke="url(#lineGradient)"
						strokeWidth={3}
						strokeLinecap="round"
						strokeLinejoin="round"
					/>

					{/* 填充区域 */}
					<path
						d={`${pathData} L ${points[points.length - 1].x} 165 L ${points[0].x} 165 Z`}
						fill="url(#tempGradient)"
						opacity={0.3}
					/>

					{/* 数据点 */}
					{points.map((point, index) => {
						const isCurrent = isCurrentHour(point.time)
						return (
							<g key={index}>
								{/* 数据圆点 - 当前时间的点更大更亮 */}
								<circle
									cx={point.x}
									cy={point.y}
									r={isCurrent ? 7 : 4}
									fill={isCurrent ? '#4ecdc4' : '#fff'}
									stroke={isCurrent ? '#4ecdc4' : '#ff6b6b'}
									strokeWidth={2}
								/>
								{/* 当前时间的光晕效果 */}
								{isCurrent && (
									<circle
										cx={point.x}
										cy={point.y}
										r={12}
										fill="none"
										stroke="#4ecdc4"
										strokeWidth={2}
										opacity={0.5}
									>
										<animate
											attributeName="r"
											values="7;15;7"
											dur="2s"
											repeatCount="indefinite"
										/>
										<animate
											attributeName="opacity"
											values="0.8;0.2;0.8"
											dur="2s"
											repeatCount="indefinite"
										/>
									</circle>
								)}
							</g>
						)
					})}

					{/* Y 轴标签 */}
					<text
						x={15}
						y={100}
						fill="rgba(255,255,255,0.6)"
						fontSize="10"
						textAnchor="middle"
						transform="rotate(-90, 15, 100)"
					>
						温度(°C)
					</text>
				</svg>
			</div>

			{/* 小时列表 */}
			<div className="hourly-list">
				{hourlyData.map((hour) => {
					const isCurrent = isCurrentHour(hour.time)
					return (
						<div
							key={hour.time}
							className={`hour-item ${isCurrent ? 'current' : ''}`}
						>
							<span className="hour-time">{formatHour(hour.time)}</span>
							{isCurrent && <span className="current-badge">现在</span>}
							<div className="hour-icon">
								<WeatherIcon code={hour.weatherCode} size="small" />
							</div>
							<span className="hour-weather">{getWeatherLabel(hour.weatherCode)}</span>
							<span className="hour-temp">{Math.round(hour.temperature)}°</span>
						</div>
					)
				})}
			</div>

			{/* 温度范围信息 */}
			<div className="temp-range">
				<span>最低: {Math.round(minTemp)}°</span>
				<span>最高: {Math.round(maxTemp)}°</span>
			</div>
		</div>
	)
}

export default HourlyForecast
