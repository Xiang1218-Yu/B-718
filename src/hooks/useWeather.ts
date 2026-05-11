import { useState, useEffect } from 'react'
import axios from 'axios'

// 地理编码结果接口
interface GeocodingResult {
	id: number
	name: string
	latitude: number
	longitude: number
	country: string
}

// 24小时逐小时预报接口
export interface HourlyForecast {
	time: string
	temperature: number
	weatherCode: number
	humidity: number
	windSpeed: number
}

// 每日预报接口
export interface DailyForecast {
	date: string
	weatherCode: number
	tempMax: number
	tempMin: number
}

// 详细天气数据接口
export interface WeatherDetails {
	humidity: number
	pressure: number
	windSpeed: number
	windDirection: number
	visibility: number
	uvIndex: number
	dewPoint: number
	cloudCover: number
}

// 完整天气数据接口
export interface WeatherData {
	currentTemp: number
	currentCode: number
	daily: DailyForecast[]
	hourly: HourlyForecast[]
	details: WeatherDetails
	city: string
	latitude: number
	longitude: number
}

const STORAGE_KEY = 'last_city_weather'

export const useWeather = () => {
	const [data, setData] = useState<WeatherData | null>(null)
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [city, setCity] = useState<string>('')

	// 组件挂载时从LocalStorage加载上次查询的城市
	useEffect(() => {
		const saved = localStorage.getItem(STORAGE_KEY)
		if (saved) {
			setCity(saved)
			fetchWeather(saved)
		} else {
			// 默认加载北京天气
			setCity('Beijing')
			fetchWeather('Beijing')
		}
	}, [])

	// 获取天气数据主函数
	const fetchWeather = async (query: string) => {
		if (!query) return
		setLoading(true)
		setError(null)
		try {
			// 第一步：地理编码，获取城市经纬度
			const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${query}&count=1&language=zh&format=json`
			const geoRes = await axios.get(geoUrl)

			if (!geoRes.data.results || geoRes.data.results.length === 0) {
				throw new Error('未找到该城市')
			}

			const location: GeocodingResult = geoRes.data.results[0]

			// 保存有效查询到本地存储
			localStorage.setItem(STORAGE_KEY, location.name)
			setCity(location.name)

			// 第二步：获取详细天气数据
			// 包含：当前天气、24小时逐小时预报、每日预报、详细气象数据
			const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,pressure_msl,wind_speed_10m,wind_direction_10m,weathercode,cloud_cover,visibility&hourly=temperature_2m,relative_humidity_2m,weathercode,wind_speed_10m,dew_point_2m,uv_index&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=4`

			const weatherRes = await axios.get(weatherUrl)
			const w = weatherRes.data

			const current = w.current
			const hourly = w.hourly
			const daily = w.daily

			// 解析当前时间，用于获取24小时预报数据
			const currentTime = new Date(current.time)
			const currentHour = currentTime.getHours()

			// 解析24小时逐小时预报数据（从当前时间开始）
			const hourlyParsed: HourlyForecast[] = []
			for (let i = 0; i < 24; i++) {
				const index = currentHour + i
				if (index < hourly.time.length) {
					hourlyParsed.push({
						time: hourly.time[index],
						temperature: hourly.temperature_2m[index],
						weatherCode: hourly.weathercode[index],
						humidity: hourly.relative_humidity_2m[index],
						windSpeed: hourly.wind_speed_10m[index],
					})
				}
			}

			// 解析每日预报数据（未来3天）
			const dailyParsed: DailyForecast[] = []
			for (let i = 1; i < 4; i++) {
				dailyParsed.push({
					date: daily.time[i],
					weatherCode: daily.weathercode[i],
					tempMax: daily.temperature_2m_max[i],
					tempMin: daily.temperature_2m_min[i],
				})
			}

			// 解析详细天气信息
			const details: WeatherDetails = {
				humidity: current.relative_humidity_2m,
				pressure: current.pressure_msl,
				windSpeed: current.wind_speed_10m,
				windDirection: current.wind_direction_10m,
				visibility: current.visibility / 1000,
				uvIndex: hourly.uv_index[currentHour] || 0,
				dewPoint: hourly.dew_point_2m[currentHour] || 0,
				cloudCover: current.cloud_cover,
			}

			// 设置完整的天气数据
			setData({
				currentTemp: current.temperature_2m,
				currentCode: current.weathercode,
				daily: dailyParsed,
				hourly: hourlyParsed,
				details,
				city: location.name,
				latitude: location.latitude,
				longitude: location.longitude,
			})
		} catch (err: unknown) {
			setError((err as Error).message || '获取天气数据失败')
		} finally {
			setLoading(false)
		}
	}

	return { data, loading, error, fetchWeather, city }
}
