import { ElNotification } from 'element-plus'
import { h } from 'vue'

export const notifySuccess = (message: string) => {
  ElNotification({
    message: h('p', { style: 'color: teal' }, message),
    type: 'success',
  })
}

export const notifyError = (message: string) => {
  ElNotification({
    message: h('p', { style: 'color: red' }, message),
    type: 'error',
  })
}

export const notifyWarning = (message: string) => {
  ElNotification({
    message: h('p', { style: 'color: orange' }, message),
    type: 'warning',
  })
}

export const notifyInfo = (message: string) => {
  ElNotification({
    message: h('p', { style: 'color: blue' }, message),
    type: 'info',
  })
}

