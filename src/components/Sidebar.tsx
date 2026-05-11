import React, { useState } from 'react'
import type { FavoriteCity } from '../hooks/useFavoriteCities'
import ConfirmDialog from './ConfirmDialog'

// 侧边栏组件属性接口
interface SidebarProps {
	favorites: FavoriteCity[]
	activeCity: string | null
	draggedIndex: number | null
	currentCity: string
	onCitySelect: (city: FavoriteCity) => void
	onRemoveFavorite: (cityId: string) => void
	onDragStart: (index: number) => void
	onDragOver: (e: React.DragEvent, index: number) => void
	onDragEnd: () => void
	isOpen: boolean
	onToggle: () => void
}

const Sidebar: React.FC<SidebarProps> = ({
	favorites,
	activeCity,
	draggedIndex,
	currentCity,
	onCitySelect,
	onRemoveFavorite,
	onDragStart,
	onDragOver,
	onDragEnd,
	isOpen,
	onToggle,
}) => {
	// 确认对话框状态
	const [confirmState, setConfirmState] = useState<{
		isOpen: boolean
		cityId: string | null
		cityName: string
	}>({
		isOpen: false,
		cityId: null,
		cityName: '',
	})

	// 格式化当前选中城市名称进行匹配
	const isCurrentCity = (cityName: string) => {
		return currentCity === cityName
	}

	// 点击删除按钮，显示确认对话框
	const handleDeleteClick = (city: FavoriteCity, e: React.MouseEvent) => {
		e.stopPropagation()
		setConfirmState({
			isOpen: true,
			cityId: city.id,
			cityName: city.name,
		})
	}

	// 确认删除
	const handleConfirmDelete = () => {
		if (confirmState.cityId) {
			onRemoveFavorite(confirmState.cityId)
		}
		handleCancelDelete()
	}

	// 取消删除
	const handleCancelDelete = () => {
		setConfirmState({
			isOpen: false,
			cityId: null,
			cityName: '',
		})
	}

	return (
		<>
			{/* 侧边栏切换按钮 - 移动端 */}
			<button
				className={`sidebar-toggle ${isOpen ? 'open' : ''}`}
				onClick={onToggle}
				aria-label='切换侧边栏'
			>
				<span />
				<span />
				<span />
			</button>

			{/* 侧边栏遮罩层 - 移动端 */}
			{isOpen && <div className='sidebar-overlay' onClick={onToggle} />}

			{/* 侧边栏主体 */}
			<aside className={`sidebar ${isOpen ? 'open' : ''}`}>
				<div className='sidebar-header'>
					<h2>收藏城市</h2>
					<span className='favorite-count'>{favorites.length} 个城市</span>
				</div>

				<div className='sidebar-content'>
					{favorites.length === 0 ? (
						<div className='empty-favorites'>
							<p>暂无收藏城市</p>
							<p className='hint'>搜索城市后点击收藏按钮添加</p>
						</div>
					) : (
						<ul className='city-list'>
							{favorites.map((city, index) => (
								<li
									key={city.id}
									className={`city-item ${
										activeCity === city.id ? 'active' : ''
									} ${isCurrentCity(city.name) ? 'current' : ''} ${
										draggedIndex === index ? 'dragging' : ''
									}`}
									draggable
									onDragStart={() => onDragStart(index)}
									onDragOver={e => onDragOver(e, index)}
									onDragEnd={onDragEnd}
								>
									{/* 拖拽手柄 */}
									<div className='drag-handle' title='拖拽排序'>
										<span />
										<span />
										<span />
									</div>

									{/* 城市信息 */}
									<button
										className='city-button'
										onClick={() => onCitySelect(city)}
										title={`查看${city.name}天气`}
									>
										<span className='city-name'>{city.name}</span>
										{isCurrentCity(city.name) && (
											<span className='current-badge'>当前</span>
										)}
									</button>

									{/* 删除按钮 */}
									<button
										className='delete-button'
										onClick={e => handleDeleteClick(city, e)}
										title={`删除${city.name}`}
									>
										×
									</button>
								</li>
							))}
						</ul>
					)}
				</div>

				<div className='sidebar-footer'>
					<p className='drag-hint'>💡 拖拽城市可调整顺序</p>
				</div>
			</aside>

			{/* 删除确认对话框 */}
			<ConfirmDialog
				isOpen={confirmState.isOpen}
				title='删除收藏城市'
				message={`确定要删除「${confirmState.cityName}」吗？此操作不可撤销。`}
				confirmText='删除'
				cancelText='取消'
				onConfirm={handleConfirmDelete}
				onCancel={handleCancelDelete}
			/>
		</>
	)
}

export default Sidebar
