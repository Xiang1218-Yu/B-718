import React, { useMemo } from 'react'
import type { HourlyForecast } from '../hooks/useWeather'

interface TemperatureChartProps {
	hourly: HourlyForecast[]
}

/** 温度变化趋势SVG图表：平滑曲线展示24小时温度走势 */
const TemperatureChart: React.FC<TemperatureChartProps> = ({ hourly }) => {
	const chartWidth = 680
	const chartHeight = 160
	const paddingX = 32
	const paddingY = 28

	/** 生成平滑贝塞尔曲线路径 */
	const buildSmoothPath = useMemo(() => {
		if (hourly.length < 2) return ''

		const temps = hourly.map((h) => h.temperature)
		const minTemp = Math.min(...temps) - 2
		const maxTemp = Math.max(...temps) + 2
		const range = maxTemp - minTemp || 1

		const drawWidth = chartWidth - paddingX * 2
		const drawHeight = chartHeight - paddingY * 2
		const stepX = drawWidth / (hourly.length - 1)

		// 将温度映射为 SVG 坐标
		const points = hourly.map((h, i) => ({
			x: paddingX + i * stepX,
			y: paddingY + drawHeight - ((h.temperature - minTemp) / range) * drawHeight,
		}))

		// 使用三次贝塞尔曲线生成平滑路径
		let d = `M ${points[0].x} ${points[0].y}`
		for (let i = 1; i < points.length; i++) {
			const prev = points[i - 1]
			const curr = points[i]
			const cpx = (prev.x + curr.x) / 2
			d += ` C ${cpx} ${prev.y}, ${cpx} ${curr.y}, ${curr.x} ${curr.y}`
		}
		return d
	}, [hourly])

	/** 渐变填充区域路径 */
	const areaPath = useMemo(() => {
		if (hourly.length < 2) return ''
		const temps = hourly.map((h) => h.temperature)
		const minTemp = Math.min(...temps) - 2
		const maxTemp = Math.max(...temps) + 2
		const range = maxTemp - minTemp || 1

		const drawWidth = chartWidth - paddingX * 2
		const drawHeight = chartHeight - paddingY * 2
		const stepX = drawWidth / (hourly.length - 1)
		const bottomY = chartHeight - paddingY

		const points = hourly.map((h, i) => ({
			x: paddingX + i * stepX,
			y: paddingY + drawHeight - ((h.temperature - minTemp) / range) * drawHeight,
		}))

		let d = `M ${points[0].x} ${points[0].y}`
		for (let i = 1; i < points.length; i++) {
			const prev = points[i - 1]
			const curr = points[i]
			const cpx = (prev.x + curr.x) / 2
			d += ` C ${cpx} ${prev.y}, ${cpx} ${curr.y}, ${curr.x} ${curr.y}`
		}
		d += ` L ${points[points.length - 1].x} ${bottomY} L ${points[0].x} ${bottomY} Z`
		return d
	}, [hourly])

	/** 温度标注点 */
	const dataPoints = useMemo(() => {
		if (hourly.length < 2) return []
		const temps = hourly.map((h) => h.temperature)
		const minTemp = Math.min(...temps) - 2
		const maxTemp = Math.max(...temps) + 2
		const range = maxTemp - minTemp || 1

		const drawWidth = chartWidth - paddingX * 2
		const drawHeight = chartHeight - paddingY * 2
		const stepX = drawWidth / (hourly.length - 1)

		return hourly.map((h, i) => ({
			x: paddingX + i * stepX,
			y: paddingY + drawHeight - ((h.temperature - minTemp) / range) * drawHeight,
			temp: h.temperature,
			hour: new Date(h.time).getHours(),
		}))
	}, [hourly])

	if (hourly.length < 2) return null

	// 选取关键标注点（每4小时标注一次）
	const labelPoints = dataPoints.filter((_, i) => i % 4 === 0 || i === dataPoints.length - 1)

	return (
		<div className='temperature-chart-section'>
			<h3 className='section-title'>温度变化趋势</h3>
			<div className='chart-container'>
				<svg
					viewBox={`0 0 ${chartWidth} ${chartHeight}`}
					preserveAspectRatio='xMidYMid meet'
					className='temp-chart-svg'
				>
					<defs>
						{/* 渐变填充 */}
						<linearGradient id='tempGradient' x1='0' y1='0' x2='0' y2='1'>
							<stop offset='0%' stopColor='rgba(255,255,255,0.4)' />
							<stop offset='100%' stopColor='rgba(255,255,255,0.02)' />
						</linearGradient>
						{/* 线条发光效果 */}
						<filter id='glow'>
							<feGaussianBlur stdDeviation='2' result='blur' />
							<feMerge>
								<feMergeNode in='blur' />
								<feMergeNode in='SourceGraphic' />
							</feMerge>
						</filter>
					</defs>

					{/* 渐变填充区域 */}
					<path d={areaPath} fill='url(#tempGradient)' />

					{/* 温度曲线 */}
					<path
						d={buildSmoothPath}
						fill='none'
						stroke='rgba(255,255,255,0.9)'
						strokeWidth='2.5'
						strokeLinecap='round'
						filter='url(#glow)'
					/>

					{/* 数据点 */}
					{dataPoints.map((pt, i) => (
						<circle
							key={i}
							cx={pt.x}
							cy={pt.y}
							r='3'
							fill='rgba(255,255,255,0.85)'
							stroke='rgba(255,255,255,0.5)'
							strokeWidth='1'
						/>
					))}

					{/* 温度数值和小时标注 */}
					{labelPoints.map((pt, i) => (
						<React.Fragment key={i}>
							<text
								x={pt.x}
								y={pt.y - 10}
								textAnchor='middle'
								fill='rgba(255,255,255,0.9)'
								fontSize='11'
								fontWeight='bold'
							>
								{Math.round(pt.temp)}°
							</text>
							<text
								x={pt.x}
								y={chartHeight - 6}
								textAnchor='middle'
								fill='rgba(255,255,255,0.6)'
								fontSize='10'
							>
								{pt.hour}:00
							</text>
						</React.Fragment>
					))}
				</svg>
			</div>
		</div>
	)
}

export default TemperatureChart
