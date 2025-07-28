import type { OfficeStoreType } from "~/types/officeType";

const LOCAL_KEY = "office_store";
export const useOfficeStore = defineStore("office", {
  state: (): OfficeStoreType => ({
    id: null,
    name: null,
  }),
  actions: {
    setOfficeStore(office: OfficeStoreType) {
      this.id = office.id;
      this.name = office.name;
      if (import.meta.client) {
        localStorage.setItem(LOCAL_KEY, JSON.stringify(office))
      }
    },
    loadOfficeStore() {
      if (import.meta.client) {
        const saved = localStorage.getItem(LOCAL_KEY)
        if (saved) {
          const office = JSON.parse(saved)
          this.setOfficeStore(office)
        } else {
            navigateTo('/room-work')
        }
      }
    },
    resetOfficeStore() {
      this.id = 0;
      this.name = "";
      if (import.meta.client) {
        localStorage.removeItem(LOCAL_KEY)
      }
    },
  },
});
