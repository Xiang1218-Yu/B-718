import React from 'react'
import { format } from 'date-fns'
import type { HourlyForecast } from '../hooks/useWeather'

// 温度趋势图表组件属性接口
interface TempTrendChartProps {
	hourlyData: HourlyForecast[]
}

const TempTrendChart: React.FC<TempTrendChartProps> = ({ hourlyData }) => {
	if (!hourlyData || hourlyData.length < 2) {
		return null
	}

	// 图表尺寸配置
	const chartWidth = 800
	const chartHeight = 200
	const padding = { top: 30, right: 20, bottom: 40, left: 40 }
	const innerWidth = chartWidth - padding.left - padding.right
	const innerHeight = chartHeight - padding.top - padding.bottom

	// 计算温度范围
	const temperatures = hourlyData.map(h => h.temperature)
	const minTemp = Math.min(...temperatures) - 2
	const maxTemp = Math.max(...temperatures) + 2
	const tempRange = maxTemp - minTemp

	// 计算每个数据点的坐标
	const points = hourlyData.map((hour, index) => {
		const x = padding.left + (index / (hourlyData.length - 1)) * innerWidth
		const y = padding.top + ((maxTemp - hour.temperature) / tempRange) * innerHeight
		return { x, y, temp: hour.temperature, time: hour.time }
	})

	// 生成 SVG 路径数据 (平滑曲线)
	const generateSmoothPath = () => {
		if (points.length < 2) return ''

		let path = `M ${points[0].x} ${points[0].y}`

		for (let i = 0; i < points.length - 1; i++) {
			const current = points[i]
			const next = points[i + 1]
			const controlPointX = (current.x + next.x) / 2
			path += ` Q ${current.x + (next.x - current.x) * 0.5} ${current.y}, ${controlPointX} ${(current.y + next.y) / 2}`
		}

		// 连接到最后一个点
		const lastPoint = points[points.length - 1]
		path += ` Q ${lastPoint.x - 10} ${lastPoint.y}, ${lastPoint.x} ${lastPoint.y}`

		return path
	}

	// 生成填充区域路径
	const generateAreaPath = () => {
		const linePath = generateSmoothPath()
		const lastPoint = points[points.length - 1]
		const firstPoint = points[0]
		const areaPath = `${linePath} L ${lastPoint.x} ${padding.top + innerHeight} L ${firstPoint.x} ${padding.top + innerHeight} Z`
		return areaPath
	}

	// 生成Y轴刻度 (温度刻度)
	const yTicks = []
	const tickCount = 5
	for (let i = 0; i <= tickCount; i++) {
		const temp = maxTemp - (i / tickCount) * (maxTemp - minTemp)
		const y = padding.top + (i / tickCount) * innerHeight
		yTicks.push({ temp: Math.round(temp), y })
	}

	// 生成X轴刻度 (时间刻度 - 每4小时显示一个)
	const xTicks = []
	const xTickInterval = Math.max(1, Math.floor(hourlyData.length / 6))
	for (let i = 0; i < hourlyData.length; i += xTickInterval) {
		const point = points[i]
		xTicks.push({
			x: point.x,
			time: point.time,
			label: i === 0 ? '现在' : format(new Date(point.time), 'HH:mm'),
		})
	}

	return (
		<div className='temp-chart-container'>
			<h3 className='section-title'>温度变化趋势</h3>
			<div className='chart-wrapper'>
				<svg
					viewBox={`0 0 ${chartWidth} ${chartHeight}`}
					className='temp-chart'
					preserveAspectRatio='xMidYMid meet'
				>
					{/* 渐变定义 */}
					<defs>
						<linearGradient id='lineGradient' x1='0%' y1='0%' x2='100%' y2='0%'>
							<stop offset='0%' stopColor='#ff6b6b' />
							<stop offset='50%' stopColor='#ffd93d' />
							<stop offset='100%' stopColor='#6bcb77' />
						</linearGradient>
						<linearGradient id='areaGradient' x1='0%' y1='0%' x2='0%' y2='100%'>
							<stop offset='0%' stopColor='#ff6b6b' stopOpacity='0.3' />
							<stop offset='100%' stopColor='#ff6b6b' stopOpacity='0' />
						</linearGradient>
					</defs>

					{/* 网格线 */}
					{yTicks.map((tick, index) => (
						<line
							key={`grid-${index}`}
							x1={padding.left}
							y1={tick.y}
							x2={chartWidth - padding.right}
							y2={tick.y}
							stroke='rgba(255,255,255,0.1)'
							strokeDasharray='4,4'
						/>
					))}

					{/* Y轴 */}
					<line
						x1={padding.left}
						y1={padding.top}
						x2={padding.left}
						y2={padding.top + innerHeight}
						stroke='rgba(255,255,255,0.3)'
						strokeWidth='1'
					/>

					{/* X轴 */}
					<line
						x1={padding.left}
						y1={padding.top + innerHeight}
						x2={chartWidth - padding.right}
						y2={padding.top + innerHeight}
						stroke='rgba(255,255,255,0.3)'
						strokeWidth='1'
					/>

					{/* Y轴刻度标签 */}
					{yTicks.map((tick, index) => (
						<text
							key={`y-tick-${index}`}
							x={padding.left - 10}
							y={tick.y + 4}
							textAnchor='end'
							fill='rgba(255,255,255,0.7)'
							fontSize='12'
						>
							{tick.temp}°
						</text>
					))}

					{/* X轴刻度标签 */}
					{xTicks.map((tick, index) => (
						<text
							key={`x-tick-${index}`}
							x={tick.x}
							y={padding.top + innerHeight + 25}
							textAnchor='middle'
							fill='rgba(255,255,255,0.7)'
							fontSize='11'
						>
							{tick.label}
						</text>
					))}

					{/* 填充区域 */}
					<path
						d={generateAreaPath()}
						fill='url(#areaGradient)'
					/>

					{/* 温度曲线 */}
					<path
						d={generateSmoothPath()}
						fill='none'
						stroke='url(#lineGradient)'
						strokeWidth='3'
						strokeLinecap='round'
						strokeLinejoin='round'
					/>

					{/* 数据点 */}
					{points.filter((_, index) => index % 2 === 0).map((point, index) => (
						<g key={`point-${index}`}>
							{/* 外圈光晕 */}
							<circle
								cx={point.x}
								cy={point.y}
								r='8'
								fill='rgba(255,107,107,0.3)'
							/>
							{/* 内圈 */}
							<circle
								cx={point.x}
								cy={point.y}
								r='5'
								fill='#fff'
								stroke='#ff6b6b'
								strokeWidth='2'
							/>
							{/* 温度标签 - 显示在点上方 */}
							<text
								x={point.x}
								y={point.y - 12}
								textAnchor='middle'
								fill='#fff'
								fontSize='11'
								fontWeight='bold'
							>
								{Math.round(point.temp)}°
							</text>
						</g>
					))}
				</svg>
			</div>
		</div>
	)
}

export default TempTrendChart
