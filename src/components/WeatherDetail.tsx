import React from 'react'
import type { WeatherDetail as WeatherDetailType } from '../hooks/useWeather'

interface WeatherDetailProps {
	detail: WeatherDetailType
}

/** 风向角度转中文方位 */
const windDirectionLabel = (deg: number): string => {
	const dirs = ['北', '东北', '东', '东南', '南', '西南', '西', '西北']
	const idx = Math.round(deg / 45) % 8
	return dirs[idx]
}

/** UV指数等级描述 */
const uvLevelLabel = (uv: number): string => {
	if (uv <= 2) return '低'
	if (uv <= 5) return '中等'
	if (uv <= 7) return '高'
	if (uv <= 10) return '很高'
	return '极高'
}

/** 能见度格式化 */
const formatVisibility = (m: number): string => {
	if (m >= 1000) return `${(m / 1000).toFixed(1)} km`
	return `${Math.round(m)} m`
}

/** 详细天气数据展示：湿度、气压、风速等多种指标 */
const WeatherDetailView: React.FC<WeatherDetailProps> = ({ detail }) => {
	const items = [
		{ icon: '💧', label: '湿度', value: `${detail.humidity}%` },
		{ icon: '🌡️', label: '气压', value: `${Math.round(detail.pressure)} hPa` },
		{ icon: '💨', label: '风速', value: `${detail.windSpeed} km/h` },
		{ icon: '🧭', label: '风向', value: `${windDirectionLabel(detail.windDirection)} (${detail.windDirection}°)` },
		{ icon: '☀️', label: 'UV指数', value: `${detail.uvIndex} ${uvLevelLabel(detail.uvIndex)}` },
		{ icon: '👁️', label: '能见度', value: formatVisibility(detail.visibility) },
		{ icon: '🤒', label: '体感温度', value: `${Math.round(detail.feelsLike)}°C` },
		{ icon: '🌧️', label: '露点', value: `${Math.round(detail.dewPoint)}°C` },
		{ icon: '☁️', label: '云量', value: `${detail.cloudCover}%` },
	]

	return (
		<div className='weather-detail-section'>
			<h3 className='section-title'>详细数据</h3>
			<div className='detail-grid'>
				{items.map((item) => (
					<div key={item.label} className='detail-item'>
						<span className='detail-icon'>{item.icon}</span>
						<span className='detail-label'>{item.label}</span>
						<span className='detail-value'>{item.value}</span>
					</div>
				))}
			</div>
		</div>
	)
}

export default WeatherDetailView
