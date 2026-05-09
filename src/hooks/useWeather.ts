import { useState, useEffect } from 'react'
import axios from 'axios'

interface GeocodingResult {
	id: number
	name: string
	latitude: number
	longitude: number
	country: string
}

export interface DailyForecast {
	date: string
	weatherCode: number
	tempMax: number
	tempMin: number
}

/** 逐小时预报数据 */
export interface HourlyForecast {
	time: string
	temperature: number
	weatherCode: number
	humidity: number
	windSpeed: number
}

/** 详细天气指标 */
export interface WeatherDetail {
	humidity: number
	pressure: number
	windSpeed: number
	windDirection: number
	uvIndex: number
	visibility: number
	feelsLike: number
	dewPoint: number
	cloudCover: number
}

export interface WeatherData {
	currentTemp: number
	currentCode: number
	daily: DailyForecast[]
	hourly: HourlyForecast[]
	detail: WeatherDetail
	city: string
}

const STORAGE_KEY = 'last_city_weather'

export const useWeather = () => {
	const [data, setData] = useState<WeatherData | null>(null)
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [city, setCity] = useState<string>('')

	useEffect(() => {
		const saved = localStorage.getItem(STORAGE_KEY)
		if (saved) {
			setCity(saved)
			fetchWeather(saved)
		} else {
			setCity('Beijing')
			fetchWeather('Beijing')
		}
	}, [])

	const fetchWeather = async (query: string) => {
		if (!query) return
		setLoading(true)
		setError(null)
		try {
			// 第一步：地理编码
			const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${query}&count=1&language=zh&format=json`
			const geoRes = await axios.get(geoUrl)

			if (!geoRes.data.results || geoRes.data.results.length === 0) {
				throw new Error('City not found')
			}

			const location: GeocodingResult = geoRes.data.results[0]
			localStorage.setItem(STORAGE_KEY, location.name)
			setCity(location.name)

			// 第二步：获取完整天气数据（使用 current= 替代 current_weather=true 以获取详细指标）
			const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&daily=weathercode,temperature_2m_max,temperature_2m_min&hourly=temperature_2m,weathercode,relative_humidity_2m,windspeed_10m&current=temperature_2m,weathercode,relative_humidity_2m,surface_pressure,wind_speed_10m,wind_direction_10m,uv_index,visibility,apparent_temperature,dew_point_2m,cloud_cover&timezone=auto&forecast_days=4`

			const weatherRes = await axios.get(weatherUrl)
			const w = weatherRes.data
			const current = w.current
			const daily = w.daily

			// 解析未来3天日预报
			const dailyParsed: DailyForecast[] = []
			for (let i = 1; i < 4; i++) {
				dailyParsed.push({
					date: daily.time[i],
					weatherCode: daily.weathercode[i],
					tempMax: daily.temperature_2m_max[i],
					tempMin: daily.temperature_2m_min[i],
				})
			}

			// 解析24小时逐小时预报
			const now = new Date()
			const currentHourStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}T${String(now.getHours()).padStart(2, '0')}:00`
			const startIdx = w.hourly.time.findIndex((t: string) => t >= currentHourStr)
			const hourStart = startIdx >= 0 ? startIdx : 0
			const hourlyParsed: HourlyForecast[] = []
			for (let i = hourStart; i < Math.min(hourStart + 24, w.hourly.time.length); i++) {
				hourlyParsed.push({
					time: w.hourly.time[i],
					temperature: w.hourly.temperature_2m[i],
					weatherCode: w.hourly.weathercode[i],
					humidity: w.hourly.relative_humidity_2m[i],
					windSpeed: w.hourly.windspeed_10m[i],
				})
			}

			// 解析当前详细天气指标（数据来源为 current 对象）
			const detailParsed: WeatherDetail = {
				humidity: current.relative_humidity_2m ?? 0,
				pressure: current.surface_pressure ?? 0,
				windSpeed: current.wind_speed_10m ?? 0,
				windDirection: current.wind_direction_10m ?? 0,
				uvIndex: current.uv_index ?? 0,
				visibility: current.visibility ?? 0,
				feelsLike: current.apparent_temperature ?? current.temperature_2m,
				dewPoint: current.dew_point_2m ?? 0,
				cloudCover: current.cloud_cover ?? 0,
			}

			setData({
				currentTemp: current.temperature_2m,
				currentCode: current.weathercode,
				daily: dailyParsed,
				hourly: hourlyParsed,
				detail: detailParsed,
				city: location.name,
			})
		} catch (err: unknown) {
			setError((err as Error).message || 'Failed to fetch weather')
		} finally {
			setLoading(false)
		}
	}

	return { data, loading, error, fetchWeather, city }
}
