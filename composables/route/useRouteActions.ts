import { valueSelectedRoute } from "./useRouteGlobal"

export const useRouteActions = () => {
    const handleChangeRoute = (value: string) => {
        valueSelectedRoute.value = value
        localStorage.setItem('selectedRoute', value.toString()) 
    }
    return {
        handleChangeRoute
    }
}