import React from 'react'
import type { WeatherDetails as WeatherDetailsType } from '../hooks/useWeather'

// 风向转换函数
const getWindDirection = (degrees: number) => {
	const directions = ['北', '东北', '东', '东南', '南', '西南', '西', '西北']
	const index = Math.round(degrees / 45) % 8
	return directions[index]
}

// UV 指数描述
const getUvDescription = (uvIndex: number) => {
	if (uvIndex <= 2) return { label: '低', color: '#4ecdc4' }
	if (uvIndex <= 5) return { label: '中等', color: '#ffd93d' }
	if (uvIndex <= 7) return { label: '高', color: '#ff6b6b' }
	if (uvIndex <= 10) return { label: '很高', color: '#c44eff' }
	return { label: '极高', color: '#990000' }
}

// 能见度描述
const getVisibilityDescription = (visibility: number) => {
	const km = visibility / 1000
	if (km < 1) return '很差'
	if (km < 5) return '一般'
	if (km < 10) return '良好'
	if (km < 20) return '很好'
	return '极好'
}

// 详细天气信息组件
interface WeatherDetailsProps {
	details: WeatherDetailsType
}

const WeatherDetails: React.FC<WeatherDetailsProps> = ({ details }) => {
	const uvInfo = getUvDescription(details.uvIndex)

	// 定义所有数据项
	const detailItems = [
		{
			icon: '💧',
			label: '湿度',
			value: `${Math.round(details.humidity)}%`,
			description: details.humidity > 70 ? '潮湿' : details.humidity < 30 ? '干燥' : '舒适',
		},
		{
			icon: '🌡️',
			label: '气压',
			value: `${Math.round(details.pressure)} hPa`,
			description: details.pressure > 1013 ? '高气压' : '低气压',
		},
		{
			icon: '💨',
			label: '风速',
			value: `${details.windSpeed.toFixed(1)} km/h`,
			description: `风向: ${getWindDirection(details.windDirection)}`,
		},
		{
			icon: '👁️',
			label: '能见度',
			value: `${(details.visibility / 1000).toFixed(1)} km`,
			description: getVisibilityDescription(details.visibility),
		},
		{
			icon: '☀️',
			label: '紫外线指数',
			value: details.uvIndex.toFixed(1),
			description: uvInfo.label,
			color: uvInfo.color,
		},
		{
			icon: '❄️',
			label: '露点温度',
			value: `${Math.round(details.dewPoint)}°`,
			description: '空气饱和时的温度',
		},
		{
			icon: '☁️',
			label: '云量',
			value: `${Math.round(details.cloudCover)}%`,
			description:
				details.cloudCover < 20
					? '晴朗'
					: details.cloudCover < 50
					? '少云'
					: details.cloudCover < 80
					? '多云'
					: '阴天',
		},
		{
			icon: '🧭',
			label: '风向',
			value: `${Math.round(details.windDirection)}°`,
			description: getWindDirection(details.windDirection) + '风',
		},
	]

	return (
		<div className="weather-details">
			<h3 className="section-title">详细信息</h3>
			<div className="details-grid">
				{detailItems.map((item, index) => (
					<div key={index} className="detail-item">
						<div className="detail-header">
							<span className="detail-icon">{item.icon}</span>
							<span className="detail-label">{item.label}</span>
						</div>
						<div className="detail-value" style={{ color: item.color }}>
							{item.value}
						</div>
						<div className="detail-description">{item.description}</div>
					</div>
				))}
			</div>
		</div>
	)
}

export default WeatherDetails
