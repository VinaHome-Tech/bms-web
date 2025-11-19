import { valueSelectedRoute } from "./useRouteGlobal"

export const useRouteActions = () => {
    const handleChangeRoute = (value: number) => {
        valueSelectedRoute.value = value
        localStorage.setItem('selectedRoute', value.toString()) 
    }
    return {
        handleChangeRoute
    }
}