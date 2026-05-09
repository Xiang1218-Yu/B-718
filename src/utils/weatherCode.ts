export type WeatherType = 'sunny' | 'cloudy' | 'fog' | 'rainy' | 'snowy' | 'thunder'
export type RainIntensity = 'none' | 'normal' | 'shower' | 'heavy'
export type SnowIntensity = 'none' | 'normal' | 'shower' | 'heavy'

export const getRainIntensity = (code: number): RainIntensity => {
	if (code === 65) return 'heavy'
	if (code >= 80 && code <= 82) return 'shower'
	if (code >= 51 && code <= 67) return 'normal'
	return 'none'
}

export const getSnowIntensity = (code: number): SnowIntensity => {
	if (code === 75) return 'heavy'
	if (code >= 85 && code <= 86) return 'shower'
	if (code >= 71 && code <= 77) return 'normal'
	return 'none'
}

export const getWeatherType = (code: number): WeatherType => {
	if (code === 0) return 'sunny'
	if (code >= 1 && code <= 3) return 'cloudy'
	if (code >= 45 && code <= 48) return 'fog'
	if (code >= 51 && code <= 67) return 'rainy'
	if (code >= 71 && code <= 77) return 'snowy'
	if (code >= 80 && code <= 82) return 'rainy'
	if (code >= 85 && code <= 86) return 'snowy'
	if (code >= 95 && code <= 99) return 'thunder'
	return 'cloudy'
}

export const getBgClass = (code: number) => {
	const type = getWeatherType(code)
	if (type === 'sunny') return 'bg-sunny'
	if (type === 'cloudy') return 'bg-cloudy'
	if (type === 'fog') return 'bg-fog'
	if (type === 'rainy') return 'bg-rainy'
	if (type === 'snowy') return 'bg-snowy'
	return 'bg-thunder'
}

export const getWeatherLabel = (code: number) => {
	if (code === 0) return '晴朗'
	if (code >= 1 && code <= 3) return '阴天'
	if (code >= 45 && code <= 48) return '有雾'
	if (code === 65) return '大雨'
	if (code >= 51 && code <= 67) return '降雨'
	if (code >= 71 && code <= 77) return '降雪'
	if (code === 82) return '暴雨'
	if (code >= 80 && code <= 82) return '阵雨'
	if (code >= 85 && code <= 86) return '阵雪'
	if (code >= 95 && code <= 99) return '雷暴'
	return '阴天'
}
