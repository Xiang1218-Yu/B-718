import { useState, useEffect } from 'react'
import axios from 'axios'

// Interfaces for Open-Meteo Response
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

export interface WeatherData {
	currentTemp: number
	currentCode: number
	daily: DailyForecast[]
	city: string
}

const STORAGE_KEY = 'last_city_weather'

export const useWeather = () => {
	const [data, setData] = useState<WeatherData | null>(null)
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [city, setCity] = useState<string>('')

	// Load from LocalStorage on mount
	useEffect(() => {
		const saved = localStorage.getItem(STORAGE_KEY)
		if (saved) {
			setCity(saved)
			fetchWeather(saved)
		} else {
			// Default to Beijing if nothing saved
			setCity('Beijing')
			fetchWeather('Beijing')
		}
	}, [])

	const fetchWeather = async (query: string) => {
		if (!query) return
		setLoading(true)
		setError(null)
		try {
			// 1. Geocoding
			const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${query}&count=1&language=zh&format=json`
			const geoRes = await axios.get(geoUrl)

			if (!geoRes.data.results || geoRes.data.results.length === 0) {
				throw new Error('City not found')
			}

			const location: GeocodingResult = geoRes.data.results[0]

			// Save valid search to storage
			localStorage.setItem(STORAGE_KEY, location.name)
			setCity(location.name)

			// 2. Weather Data
			// weathercode, temperature_2m_max, temperature_2m_min on daily
			// temperature_2m, weathercode on current_weather
			const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&daily=weathercode,temperature_2m_max,temperature_2m_min&current_weather=true&timezone=auto&forecast_days=4`

			const weatherRes = await axios.get(weatherUrl)
			const w = weatherRes.data

			const current = w.current_weather
			const daily = w.daily

			// Transform Daily Data
			const dailyParsed: DailyForecast[] = []
			for (let i = 1; i < 4; i++) {
				// Next 3 days (index 1 to 3)
				dailyParsed.push({
					date: daily.time[i],
					weatherCode: daily.weathercode[i],
					tempMax: daily.temperature_2m_max[i],
					tempMin: daily.temperature_2m_min[i],
				})
			}

			setData({
				currentTemp: current.temperature,
				currentCode: current.weathercode,
				daily: dailyParsed,
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
