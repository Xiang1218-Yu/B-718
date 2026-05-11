import { useState, useEffect } from 'react'

// 收藏城市数据接口
export interface FavoriteCity {
	id: string
	name: string
	latitude: number
	longitude: number
	addedAt: number
}

// 本地存储键名
const FAVORITES_STORAGE_KEY = 'favorite_cities'

export const useFavoriteCities = () => {
	// 收藏城市列表状态
	const [favorites, setFavorites] = useState<FavoriteCity[]>([])
	// 当前选中的城市
	const [activeCity, setActiveCity] = useState<string | null>(null)
	// 拖拽状态
	const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

	// 组件挂载时从本地存储加载收藏列表
	useEffect(() => {
		const saved = localStorage.getItem(FAVORITES_STORAGE_KEY)
		if (saved) {
			try {
				const parsed = JSON.parse(saved)
				setFavorites(parsed)
			} catch (e) {
				console.error('加载收藏城市失败:', e)
			}
		}
	}, [])

	// 保存收藏列表到本地存储
	const saveFavorites = (newFavorites: FavoriteCity[]) => {
		localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(newFavorites))
		setFavorites(newFavorites)
	}

	// 添加城市到收藏
	const addFavorite = (city: Omit<FavoriteCity, 'id' | 'addedAt'>) => {
		// 检查是否已收藏
		const exists = favorites.some(f => f.name === city.name)
		if (exists) {
			return false
		}

		const newFavorite: FavoriteCity = {
			...city,
			id: `${city.latitude}-${city.longitude}-${Date.now()}`,
			addedAt: Date.now(),
		}

		saveFavorites([...favorites, newFavorite])
		return true
	}

	// 从收藏中移除城市
	const removeFavorite = (cityId: string) => {
		const newFavorites = favorites.filter(f => f.id !== cityId)
		saveFavorites(newFavorites)
		// 如果删除的是当前选中的城市，清除选中状态
		if (activeCity === cityId) {
			setActiveCity(null)
		}
	}

	// 检查城市是否已收藏
	const isFavorite = (cityName: string) => {
		return favorites.some(f => f.name === cityName)
	}

	// 获取收藏城市信息
	const getFavoriteByName = (cityName: string) => {
		return favorites.find(f => f.name === cityName) || null
	}

	// 拖拽开始
	const handleDragStart = (index: number) => {
		setDraggedIndex(index)
	}

	// 拖拽经过
	const handleDragOver = (e: React.DragEvent, index: number) => {
		e.preventDefault()
		if (draggedIndex === null || draggedIndex === index) return

		const newFavorites = [...favorites]
		const draggedItem = newFavorites[draggedIndex]
		newFavorites.splice(draggedIndex, 1)
		newFavorites.splice(index, 0, draggedItem)

		saveFavorites(newFavorites)
		setDraggedIndex(index)
	}

	// 拖拽结束
	const handleDragEnd = () => {
		setDraggedIndex(null)
	}

	// 选择城市
	const selectCity = (cityId: string) => {
		setActiveCity(cityId)
	}

	return {
		favorites,
		activeCity,
		draggedIndex,
		addFavorite,
		removeFavorite,
		isFavorite,
		getFavoriteByName,
		selectCity,
		handleDragStart,
		handleDragOver,
		handleDragEnd,
	}
}
