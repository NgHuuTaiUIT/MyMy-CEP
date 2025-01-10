export class SendService {
    static init<T>(payload: T) {
        return {
            action: 'INIT',
            payload
        }
    }

    static getSelectedItems() {
        return ({
            action: 'SELECTED_ITEMS'
        })
    }

    static clearSelectedItems() {
        return ({
            action: 'CLEAR_SELECTED_ITEMS',
        })
    }

    static uploadMedia<T>(payload: T) {
        return {
            action: 'UPLOAD_MEDIA',
            payload
        }
    }
}

export const ReceiveAction = {
    LOGINED: 'LOGINED',
    SELECTED_ITEMS: "SELECTED_ITEMS"
}