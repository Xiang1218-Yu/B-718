import React from 'react'

// 确认对话框属性接口
interface ConfirmDialogProps {
	// 是否显示对话框
	isOpen: boolean
	// 对话框标题
	title: string
	// 对话框内容
	message: string
	// 确认按钮文字
	confirmText?: string
	// 取消按钮文字
	cancelText?: string
	// 确认回调
	onConfirm: () => void
	// 取消回调
	onCancel: () => void
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
	isOpen,
	title,
	message,
	confirmText = '确认',
	cancelText = '取消',
	onConfirm,
	onCancel,
}) => {
	if (!isOpen) {
		return null
	}

	return (
		<div className='confirm-overlay' onClick={onCancel}>
			<div className='confirm-dialog' onClick={e => e.stopPropagation()}>
				<h3 className='confirm-title'>{title}</h3>
				<p className='confirm-message'>{message}</p>
				<div className='confirm-actions'>
					<button
						className='confirm-btn cancel'
						onClick={onCancel}
					>
						{cancelText}
					</button>
					<button
						className='confirm-btn confirm'
						onClick={onConfirm}
					>
						{confirmText}
					</button>
				</div>
			</div>
		</div>
	)
}

export default ConfirmDialog
