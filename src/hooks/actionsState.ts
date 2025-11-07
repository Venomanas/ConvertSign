import { create } from 'zustand';

//define the shape of the store state and action


interface ActionsState {
    showActions: boolean;
    displayActions: () => void; // call this to show banner 
    dismissActions: () => void; // call to hide banner
}

//create store 
export const useActionsStore = create<ActionsState>((set) =>({
    //initial state

    showActions : false,

    //action to update the store 

    displayActions: () => set({ showActions : true}),
    dismissActions: () => set({ showActions : false})
}))