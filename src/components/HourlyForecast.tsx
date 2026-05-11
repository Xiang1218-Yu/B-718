import React from 'react'
import { format } from 'date-fns'
import type { HourlyForecast as HourlyForecastType } from '../hooks/useWeather'
import WeatherIcon from './WeatherIcon'
import { getWeatherLabel } from '../utils/weatherCode'

// 小时级预报组件属性接口
interface HourlyForecastProps {
	hourlyData: HourlyForecastType[]
}

const HourlyForecast: React.FC<HourlyForecastProps> = ({ hourlyData }) => {
	if (!hourlyData || hourlyData.length === 0) {
		return null
	}

	return (
		<div className='hourly-forecast'>
			<h3 className='section-title'>24小时预报</h3>
			<div className='hourly-scroll'>
				{hourlyData.map((hour, index) => {
					const time = new Date(hour.time)
					const isNow = index === 0

					return (
						<div
							key={hour.time}
							className={`hourly-item ${isNow ? 'now' : ''}`}
						>
							{/* 时间显示 */}
							<span className='hour-time'>
								{isNow ? '现在' : format(time, 'HH:mm')}
							</span>

							{/* 天气图标 */}
							<div className='hour-icon'>
								<WeatherIcon code={hour.weatherCode} size='small' />
							</div>

							{/* 天气描述 */}
							<span className='hour-desc'>
								{getWeatherLabel(hour.weatherCode)}
							</span>

							{/* 温度显示 */}
							<span className='hour-temp'>
								{Math.round(hour.temperature)}°
							</span>

							{/* 湿度显示 */}
							<span className='hour-humidity'>
								💧 {hour.humidity}%
							</span>

							{/* 风速显示 */}
							<span className='hour-wind'>
								🌬️ {hour.windSpeed.toFixed(1)} km/h
							</span>
						</div>
					)
				})}
			</div>
		</div>
	)
}

export default HourlyForecast
