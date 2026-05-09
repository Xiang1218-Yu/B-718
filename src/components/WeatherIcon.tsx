import React from 'react'
import { getWeatherType } from '../utils/weatherCode'

interface Props {
	code: number
	size?: 'small' | 'large'
}

const WeatherIcon: React.FC<Props> = ({ code, size = 'large' }) => {
	const type = getWeatherType(code)
	const scale = size === 'small' ? 0.5 : 1

	// CSS Styles inline for simplicity in this file, or we could use classes.
	// Using pure CSS shapes.

	const containerStyle: React.CSSProperties = {
		position: 'relative',
		width: 100 * scale,
		height: 100 * scale,
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
	}

	return (
		<div style={containerStyle} className={`weather-icon ${type}`}>
			{type === 'sunny' && <div className='sun' />}
			{type === 'cloudy' && <div className='cloud' />}
			{type === 'fog' && (
				<>
					<div className='cloud fog' />
					<div className='fog-lines'>
						<span /> <span /> <span />
					</div>
				</>
			)}
			{type === 'rainy' && (
				<>
					<div className='cloud dark' />
					<div className='rain-drops'>
						<i /> <i /> <i />
					</div>
				</>
			)}
			{type === 'snowy' && <div className='snow-flake large'>❄</div>}
			{type === 'thunder' && (
				<>
					<div className='cloud dark' />
					<div className='lightning'>⚡</div>
				</>
			)}
		</div>
	)
}

export default WeatherIcon
