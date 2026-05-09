import React, { useRef, useEffect } from 'react'
import type { HourlyForecast } from '../hooks/useWeather'
import WeatherIcon from './WeatherIcon'
import { getWeatherLabel } from '../utils/weatherCode'

interface HourlyForecastProps {
	hourly: HourlyForecast[]
}

/** 小时级预报组件：横向滚动展示24小时逐小时温度和天气状况 */
const HourlyForecastView: React.FC<HourlyForecastProps> = ({ hourly }) => {
	const scrollRef = useRef<HTMLDivElement>(null)

	// 自动滚动到当前小时
	useEffect(() => {
		if (scrollRef.current) {
			scrollRef.current.scrollLeft = 0
		}
	}, [hourly])

	if (!hourly.length) return null

	return (
		<div className='hourly-forecast-section'>
			<h3 className='section-title'>逐小时预报</h3>
			<div className='hourly-scroll' ref={scrollRef}>
				{hourly.map((h, idx) => {
					// 从 ISO 时间字符串提取小时
					const hour = new Date(h.time).getHours()
					const isNow = idx === 0
					return (
						<div key={h.time} className={`hourly-item ${isNow ? 'hourly-item-now' : ''}`}>
							<span className='hourly-time'>{isNow ? '现在' : `${hour}:00`}</span>
							<div className='hourly-icon'>
								<WeatherIcon code={h.weatherCode} size='small' />
							</div>
							<span className='hourly-desc'>{getWeatherLabel(h.weatherCode)}</span>
							<span className='hourly-temp'>{Math.round(h.temperature)}°</span>
						</div>
					)
				})}
			</div>
		</div>
	)
}

export default HourlyForecastView
