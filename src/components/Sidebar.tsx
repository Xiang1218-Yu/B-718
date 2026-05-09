import React, { useRef, useState } from 'react'
import type { FavoriteCity } from '../hooks/useFavorites'

interface SidebarProps {
	favorites: FavoriteCity[]
	currentCity: string
	onSelect: (name: string) => void
	onRemove: (name: string) => void
	onReorder: (from: number, to: number) => void
	isFavorite: boolean
	onAddFavorite: () => void
	open: boolean
	onToggle: () => void
}

const Sidebar: React.FC<SidebarProps> = ({
	favorites,
	currentCity,
	onSelect,
	onRemove,
	onReorder,
	isFavorite,
	onAddFavorite,
	open,
	onToggle,
}) => {
	const dragIndexRef = useRef<number | null>(null)
	const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

	const handleDragStart = (index: number) => {
		dragIndexRef.current = index
	}

	const handleDragOver = (e: React.DragEvent, index: number) => {
		e.preventDefault()
		setDragOverIndex(index)
	}

	const handleDrop = (toIndex: number) => {
		if (dragIndexRef.current !== null && dragIndexRef.current !== toIndex) {
			onReorder(dragIndexRef.current, toIndex)
		}
		dragIndexRef.current = null
		setDragOverIndex(null)
	}

	const handleDragEnd = () => {
		dragIndexRef.current = null
		setDragOverIndex(null)
	}

	return (
		<>
			<button className='sidebar-toggle' onClick={onToggle} title='收藏城市'>
				{open ? '✕' : '☰'}
			</button>
			<div className={`sidebar ${open ? 'sidebar-open' : ''}`}>
				<div className='sidebar-header'>
					<h3>收藏城市</h3>
					<button
						className={`fav-add-btn ${isFavorite ? 'fav-added' : ''}`}
						onClick={onAddFavorite}
						disabled={isFavorite}
						title={isFavorite ? '已收藏' : '收藏当前城市'}
					>
						{isFavorite ? '★' : '☆'} 添加
					</button>
				</div>
				{favorites.length === 0 && (
					<p className='sidebar-empty'>暂无收藏城市</p>
				)}
				<ul className='sidebar-list'>
					{favorites.map((fav, index) => (
						<li
							key={fav.name}
							className={`sidebar-item ${
								fav.name === currentCity ? 'sidebar-item-active' : ''
							} ${dragOverIndex === index ? 'sidebar-item-dragover' : ''}`}
							draggable
							onDragStart={() => handleDragStart(index)}
							onDragOver={(e) => handleDragOver(e, index)}
							onDrop={() => handleDrop(index)}
							onDragEnd={handleDragEnd}
						>
							<span className='sidebar-drag-handle' title='拖拽排序'>⠿</span>
							<span
								className='sidebar-city-name'
								onClick={() => {
									onSelect(fav.name)
									onToggle()
								}}
							>
								{fav.name}
							</span>
							<button
								className='sidebar-remove-btn'
								onClick={(e) => {
									e.stopPropagation()
									onRemove(fav.name)
								}}
								title='删除'
							>
								✕
							</button>
						</li>
					))}
				</ul>
			</div>
			{open && <div className='sidebar-overlay' onClick={onToggle} />}
		</>
	)
}

export default Sidebar
