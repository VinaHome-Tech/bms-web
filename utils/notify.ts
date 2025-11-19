import { ElNotification, ElMessage } from 'element-plus'
import { h } from 'vue'

export const notifySuccess = (message: string) => {
  ElMessage({
    message: message,
    type: 'success',
    plain: true,
  })
}

export const notifyError = (message: string) => {
  ElMessage({
    message: message,
    type: 'error',
    plain: true,
  })
}

export const notifyWarning = (message: string) => {
  ElMessage({
    message: message,
    type: 'warning',
    plain: true,
  })
}

export const notifyInfo = (message: string) => {
  ElMessage({
    message: message,
    type: 'info',
    plain: true,
  })
}
