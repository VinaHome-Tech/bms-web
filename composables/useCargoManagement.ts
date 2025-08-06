import type { CargoType } from "~/types/cargoType";

export const useCargoManagement = () => {
    const dialogFormCargo = ref(false);
    const loadingCargoTable = ref(false);
    const loadingCargoSubmit = ref(false);
    const cargoData = ref<CargoType[]>([]);
    const isEditCargo = ref(false);
    const handleOpenCargoDialog = () => {
        isEditCargo.value = false;
        dialogFormCargo.value = true;
    }
    const handleClosedDialogCargo = () => {
        dialogFormCargo.value = false;
        isEditCargo.value = false;
    }
    const handleSaveCargo = (cargo: CargoType) => {
        if (isEditCargo.value) {
            console.log("Updating cargo:", cargo);
        } else {
            console.log("Creating new cargo:", cargo);
        }
    }
    return {
        dialogFormCargo,
        loadingCargoTable,
        loadingCargoSubmit,
        cargoData,
        isEditCargo,
        handleSaveCargo,
        handleOpenCargoDialog,
        handleClosedDialogCargo
    }
}