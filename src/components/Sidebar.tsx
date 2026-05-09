import React from 'react'
import {
	DndContext,
	closestCenter,
	KeyboardSensor,
	PointerSensor,
	useSensor,
	useSensors,
} from '@dnd-kit/core'
import type { DragEndEvent } from '@dnd-kit/core'
import {
	arrayMove,
	SortableContext,
	sortableKeyboardCoordinates,
	useSortable,
	verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { FavoriteCity } from '../hooks/useWeather'

// 可拖拽城市项组件
interface SortableItemProps {
	city: FavoriteCity
	isActive: boolean
	onSelect: (city: FavoriteCity) => void
	onRemove: (id: string) => void
}

const SortableItem: React.FC<SortableItemProps> = ({ city, isActive, onSelect, onRemove }) => {
	const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
		id: city.id,
	})

	const style: React.CSSProperties = {
		transform: CSS.Transform.toString(transform),
		transition,
		opacity: isDragging ? 0.5 : 1,
		zIndex: isDragging ? 1000 : 1,
	}

	return (
		<div
			ref={setNodeRef}
			style={style}
			className={`favorite-item ${isActive ? 'active' : ''}`}
		>
			<div
				className="drag-handle"
				{...attributes}
				{...listeners}
				title="拖拽排序"
			>
				⋮⋮
			</div>
			<div
				className="city-name"
				onClick={() => onSelect(city)}
			>
				{city.name}
			</div>
			<button
				className="remove-btn"
				onClick={() => onRemove(city.id)}
				title="删除收藏"
			>
				×
			</button>
		</div>
	)
}

// 侧边栏组件
interface SidebarProps {
	favorites: FavoriteCity[]
	activeCityId: string
	onSelect: (city: FavoriteCity) => void
	onRemove: (id: string) => void
	onReorder: (newOrder: FavoriteCity[]) => void
}

const Sidebar: React.FC<SidebarProps> = ({
	favorites,
	activeCityId,
	onSelect,
	onRemove,
	onReorder,
}) => {
	const sensors = useSensors(
		useSensor(PointerSensor),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		})
	)

	// 处理拖拽结束
	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event

		if (over && active.id !== over.id) {
			const oldIndex = favorites.findIndex((item) => item.id === active.id)
			const newIndex = favorites.findIndex((item) => item.id === over.id)
			onReorder(arrayMove(favorites, oldIndex, newIndex))
		}
	}

	return (
		<div className="sidebar">
			<div className="sidebar-header">
				<h3>收藏城市</h3>
				<span className="favorites-count">{favorites.length}</span>
			</div>
			<div className="sidebar-content">
				{favorites.length === 0 ? (
					<p className="empty-hint">暂无收藏城市</p>
				) : (
					<DndContext
						sensors={sensors}
						collisionDetection={closestCenter}
						onDragEnd={handleDragEnd}
					>
						<SortableContext items={favorites} strategy={verticalListSortingStrategy}>
							{favorites.map((city) => (
								<SortableItem
									key={city.id}
									city={city}
									isActive={activeCityId === city.id}
									onSelect={onSelect}
									onRemove={onRemove}
								/>
							))}
						</SortableContext>
					</DndContext>
				)}
			</div>
		</div>
	)
}

export default Sidebar
