import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'

// 地理编码结果接口
interface GeocodingResult {
	id: number
	name: string
	latitude: number
	longitude: number
	country: string
}

// 每日预报接口
export interface DailyForecast {
	date: string
	weatherCode: number
	tempMax: number
	tempMin: number
}

// 小时预报接口
export interface HourlyForecast {
	time: string
	temperature: number
	weatherCode: number
}

// 详细天气信息接口
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

// 收藏城市接口
export interface FavoriteCity {
	id: string
	name: string
	latitude: number
	longitude: number
}

// 完整天气数据接口
export interface WeatherData {
	currentTemp: number
	currentCode: number
	daily: DailyForecast[]
	hourly: HourlyForecast[]
	details: WeatherDetails
	city: string
}

// 本地存储键常量
const STORAGE_KEY = 'last_city_weather'
const FAVORITES_KEY = 'favorite_cities'

// 从本地存储加载收藏城市
const loadFavoritesFromStorage = (): FavoriteCity[] => {
	try {
		const saved = localStorage.getItem(FAVORITES_KEY)
		if (saved) {
			const parsed = JSON.parse(saved)
			if (Array.isArray(parsed)) {
				return parsed
			}
		}
	} catch (error) {
		console.error('Failed to load favorites from storage:', error)
	}
	return []
}

// 保存收藏城市到本地存储
const saveFavoritesToStorage = (favorites: FavoriteCity[]) => {
	try {
		localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites))
	} catch (error) {
		console.error('Failed to save favorites to storage:', error)
	}
}

export const useWeather = () => {
	// 天气数据状态
	const [data, setData] = useState<WeatherData | null>(null)
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [city, setCity] = useState<string>('')

	// 收藏城市状态 - 从本地存储初始化
	const [favorites, setFavorites] = useState<FavoriteCity[]>(() => loadFavoritesFromStorage())
	const [activeCityId, setActiveCityId] = useState<string>('')

	// 初始化时加载默认城市天气
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

	// 获取天气数据主函数
	const fetchWeather = async (query: string) => {
		if (!query) return
		setLoading(true)
		setError(null)
		try {
			// 1. 地理编码获取城市坐标
			const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${query}&count=1&language=zh&format=json`
			const geoRes = await axios.get(geoUrl)

			if (!geoRes.data.results || geoRes.data.results.length === 0) {
				throw new Error('City not found')
			}

			const location: GeocodingResult = geoRes.data.results[0]

			localStorage.setItem(STORAGE_KEY, location.name)
			setCity(location.name)

			// 2. 获取完整天气数据（包含小时、详细信息）
			const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,cloud_cover,pressure_msl,wind_speed_10m,wind_direction_10m,dew_point_2m,weathercode,uv_index&hourly=temperature_2m,weathercode,relative_humidity_2m,visibility,uv_index&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=4`

			const weatherRes = await axios.get(weatherUrl)
			const w = weatherRes.data

			const current = w.current
			const daily = w.daily
			const hourly = w.hourly

			// 解析每日预报
			const dailyParsed: DailyForecast[] = []
			for (let i = 1; i < 4; i++) {
				dailyParsed.push({
					date: daily.time[i],
					weatherCode: daily.weathercode[i],
					tempMax: daily.temperature_2m_max[i],
					tempMin: daily.temperature_2m_min[i],
				})
			}

			// 解析24小时预报
			const hourlyParsed: HourlyForecast[] = []
			for (let i = 0; i < 24; i++) {
				hourlyParsed.push({
					time: hourly.time[i],
					temperature: hourly.temperature_2m[i],
					weatherCode: hourly.weathercode[i],
				})
			}

			// 解析详细天气信息
			const details: WeatherDetails = {
				humidity: current.relative_humidity_2m,
				pressure: current.pressure_msl,
				windSpeed: current.wind_speed_10m,
				windDirection: current.wind_direction_10m,
				visibility: hourly.visibility?.[0] ?? 0,
				uvIndex: current.uv_index,
				dewPoint: current.dew_point_2m,
				cloudCover: current.cloud_cover,
			}

			setData({
				currentTemp: current.temperature_2m,
				currentCode: current.weathercode,
				daily: dailyParsed,
				hourly: hourlyParsed,
				details,
				city: location.name,
			})
		} catch (err: unknown) {
			setError((err as Error).message || 'Failed to fetch weather')
		} finally {
			setLoading(false)
		}
	}

	// 添加收藏城市
	const addFavorite = useCallback(() => {
		if (!data) return

		// 检查是否已存在
		const exists = favorites.some((f) => f.name === data.city)
		if (exists) return

		// 创建新的收藏城市
		const newFavorite: FavoriteCity = {
			id: `city-${Date.now()}`,
			name: data.city,
			latitude: 0, // 简化处理，实际应用中应保存坐标
			longitude: 0,
		}

		// 更新状态并立即保存到本地存储
		const newFavorites = [...favorites, newFavorite]
		setFavorites(newFavorites)
		saveFavoritesToStorage(newFavorites)

		// 自动将新添加的城市设为激活状态
		setActiveCityId(newFavorite.id)
	}, [data, favorites])

	// 删除收藏城市
	const removeFavorite = useCallback((id: string) => {
		// 更新状态并立即保存到本地存储
		const newFavorites = favorites.filter((f) => f.id !== id)
		setFavorites(newFavorites)
		saveFavoritesToStorage(newFavorites)

		if (activeCityId === id) {
			setActiveCityId('')
		}
	}, [favorites, activeCityId])

	// 重新排序收藏城市
	const reorderFavorites = useCallback((newOrder: FavoriteCity[]) => {
		setFavorites(newOrder)
		saveFavoritesToStorage(newOrder)
	}, [])

	// 切换到收藏城市
	const selectFavorite = useCallback((favorite: FavoriteCity) => {
		setActiveCityId(favorite.id)
		fetchWeather(favorite.name)
	}, [])

	return {
		data,
		loading,
		error,
		fetchWeather,
		city,
		favorites,
		addFavorite,
		removeFavorite,
		reorderFavorites,
		selectFavorite,
		activeCityId,
	}
}
