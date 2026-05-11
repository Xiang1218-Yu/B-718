import React from 'react'
import type { WeatherDetails as WeatherDetailsType } from '../hooks/useWeather'

// 详细天气信息组件属性接口
interface WeatherDetailsProps {
	details: WeatherDetailsType
}

// 将风向角度转换为文字描述
const getWindDirectionText = (degree: number): string => {
	const directions = ['北', '东北', '东', '东南', '南', '西南', '西', '西北']
	const index = Math.round(degree / 45) % 8
	return directions[index]
}

const WeatherDetails: React.FC<WeatherDetailsProps> = ({ details }) => {
	if (!details) {
		return null
	}

	// 详细天气数据项配置
	const detailItems = [
		{
			icon: '💧',
			label: '湿度',
			value: `${details.humidity}%`,
			description: '相对湿度',
		},
		{
			icon: '🌡️',
			label: '气压',
			value: `${Math.round(details.pressure)} hPa`,
			description: '海平面气压',
		},
		{
			icon: '🌬️',
			label: '风速',
			value: `${details.windSpeed.toFixed(1)} km/h`,
			description: '10米高度风速',
		},
		{
			icon: '🧭',
			label: '风向',
			value: `${getWindDirectionText(details.windDirection)} ${Math.round(details.windDirection)}°`,
			description: '风向角度',
		},
		{
			icon: '👁️',
			label: '能见度',
			value: `${details.visibility.toFixed(1)} km`,
			description: '能见度距离',
		},
		{
			icon: '☀️',
			label: '紫外线指数',
			value: details.uvIndex.toFixed(1),
			description: details.uvIndex < 3 ? '低强度' : details.uvIndex < 6 ? '中等强度' : '高强度',
		},
		{
			icon: '❄️',
			label: '露点温度',
			value: `${Math.round(details.dewPoint)}°C`,
			description: '结露温度',
		},
		{
			icon: '☁️',
			label: '云量',
			value: `${details.cloudCover}%`,
			description: '天空云覆盖率',
		},
	]

	return (
		<div className='weather-details'>
			<h3 className='section-title'>详细信息</h3>
			<div className='details-grid'>
				{detailItems.map((item, index) => (
					<div key={index} className='detail-card'>
						<div className='detail-icon'>{item.icon}</div>
						<div className='detail-content'>
							<span className='detail-label'>{item.label}</span>
							<span className='detail-value'>{item.value}</span>
							<span className='detail-desc'>{item.description}</span>
						</div>
					</div>
				))}
			</div>
		</div>
	)
}

export default WeatherDetails
