import { useState, useCallback, useEffect } from 'react'

export interface FavoriteCity {
	name: string
	addedAt: number
}

const STORAGE_KEY = 'favorite_cities'

const loadFavorites = (): FavoriteCity[] => {
	try {
		const raw = localStorage.getItem(STORAGE_KEY)
		return raw ? JSON.parse(raw) : []
	} catch {
		return []
	}
}

const saveFavorites = (list: FavoriteCity[]) => {
	localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
}

export const useFavorites = () => {
	const [favorites, setFavorites] = useState<FavoriteCity[]>(loadFavorites)

	useEffect(() => {
		saveFavorites(favorites)
	}, [favorites])

	/** 添加收藏城市 */
	const addFavorite = useCallback((cityName: string) => {
		setFavorites((prev) => {
			if (prev.some((f) => f.name === cityName)) return prev
			return [...prev, { name: cityName, addedAt: Date.now() }]
		})
	}, [])

	/** 删除收藏城市 */
	const removeFavorite = useCallback((cityName: string) => {
		setFavorites((prev) => prev.filter((f) => f.name !== cityName))
	}, [])

	/** 拖拽排序：将 fromIndex 项移动到 toIndex */
	const reorderFavorites = useCallback((fromIndex: number, toIndex: number) => {
		setFavorites((prev) => {
			const next = [...prev]
			const [moved] = next.splice(fromIndex, 1)
			next.splice(toIndex, 0, moved)
			return next
		})
	}, [])

	/** 判断城市是否已收藏 */
	const isFavorite = useCallback(
		(cityName: string) => favorites.some((f) => f.name === cityName),
		[favorites]
	)

	return { favorites, addFavorite, removeFavorite, reorderFavorites, isFavorite }
}
