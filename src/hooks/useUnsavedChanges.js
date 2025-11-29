import { useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

/**
 * Custom hook to track unsaved changes and prompt user before leaving
 * @param {boolean} hasUnsavedChanges - Whether there are unsaved changes
 * @param {Function} onSave - Function to call when user wants to save
 * @returns {Object} - { promptBeforeLeaving, resetUnsavedChanges }
 */
export const useUnsavedChanges = (hasUnsavedChanges, onSave) => {
    const navigate = useNavigate()

    // Prompt before browser close/refresh
    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (hasUnsavedChanges) {
                e.preventDefault()
                e.returnValue = 'You have unsaved changes. Do you want to save them?'
                return e.returnValue
            }
        }

        window.addEventListener('beforeunload', handleBeforeUnload)
        return () => window.removeEventListener('beforeunload', handleBeforeUnload)
    }, [hasUnsavedChanges])

    // Prompt before navigation within app
    const promptBeforeLeaving = useCallback(async (callback) => {
        if (hasUnsavedChanges) {
            const shouldSave = window.confirm(
                'You have unsaved changes. Do you want to save them?\n\n' +
                'Click OK to save, or Cancel to discard changes.'
            )

            if (shouldSave && onSave) {
                try {
                    await onSave()
                    callback?.()
                } catch (error) {
                    console.error('Error saving:', error)
                }
            } else {
                callback?.()
            }
        } else {
            callback?.()
        }
    }, [hasUnsavedChanges, onSave])

    return { promptBeforeLeaving }
}

/**
 * Hook to detect form changes
 * @param {Object} initialData - Initial form data
 * @param {Object} currentData - Current form data
 * @returns {boolean} - Whether data has changed
 */
export const useFormChanges = (initialData, currentData) => {
    return JSON.stringify(initialData) !== JSON.stringify(currentData)
}
