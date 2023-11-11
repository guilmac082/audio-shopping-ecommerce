import {useReducer, useMemo, createContext, ReactElement} from "react"
import { CartItemType } from "@/types/cart";


type CartStateType = {cart: CartItemType[] }

const initCartState: CartStateType = {cart: []}

const REDUCER_ACTION_TYPE = {
    ADD: "ADD",
    REMOVE: "REMOVE",
    QUANTITY: "QUANTITY",
    INCREASE: "INCREASE",
    DECREASE: "DECREASE",
    SUBMIT: "SUBMIT"
}

export type ReducerActionType = typeof REDUCER_ACTION_TYPE

export type ReducerAction = {
    type: string
    payload?: CartItemType 
}

const reducer = (state: CartStateType, action: ReducerAction) : 
CartStateType => {
    switch (action.type){
        case REDUCER_ACTION_TYPE.ADD: {
            if (!action.payload) {
                throw new Error('action.payload missing in ADD action')
            }

            const { slug, name, price } = action.payload

            const filteredCart: CartItemType[] = state.cart.filter(item => item.slug !== slug)

            const itemExists: CartItemType | undefined = state.cart.find(item => item.slug === slug)

            const qty: number = itemExists ? itemExists.qty + 1 : 1

            console.log(action.payload, "payload")

            return { ...state, cart: [...filteredCart, { slug, name, price, qty }] }
        }
        case REDUCER_ACTION_TYPE.REMOVE: {
            if (!action.payload) {
                throw new Error('action.payload missing in REMOVE action')
            }

            const { slug } = action.payload

            const filteredCart: CartItemType[] = state.cart.filter(item => item.slug !== slug)

            return { ...state, cart: [...filteredCart] }

        }
        case REDUCER_ACTION_TYPE.QUANTITY: {
            if (!action.payload) {
                throw new Error('action.payload missing in QUANTITY action')
            }

            const { slug, qty } = action.payload

            const itemExists: CartItemType | undefined = state.cart.find(item => item.slug === slug)

            if (!itemExists) {
                throw new Error('Item must exist in order to update quantity')
            }

            const updatedItem: CartItemType = { ...itemExists, qty }

            const filteredCart: CartItemType[] = state.cart.filter(item => item.slug !== slug)

            return { ...state, cart: [...filteredCart, updatedItem] }
        }
        case REDUCER_ACTION_TYPE.SUBMIT: {
            return {...state, cart:[]}
        }
        default:
            throw new Error("Unindentified reducer action type")
    }
}

 const useCartContext = (initCartState: CartStateType) => {
    const [state, dispatch] = useReducer(reducer, initCartState)

    // Here we memoize the value of the object i.e REDUCER_ACTION_TYPE so that it always has the same referential equality
    // when it is passed to a component, this memoization will disable re-renders that would have been caused at every instance
    // of using the any of the REDUCER ACTION TYPES
    const REDUCER_ACTIONS = useMemo(()=>{
        return REDUCER_ACTION_TYPE
    },[])

    // totalItems represent the total quantity of each product ordered, where 0 is the default 
    const totalItems: number = state.cart.reduce((previousValue, cartItem)=>{
        return previousValue + cartItem.qty
    },0)

    const totalPrice: string = new Intl.NumberFormat('en-US', {style: 'currency', currency: 'USD'}).format(
        state.cart.reduce((previousValue, cartItem)=>{
            return previousValue + (cartItem.qty * cartItem.price)
        },0)
    )

    const cart = state.cart.sort((a,b)=>{

        // Sorting by the last four digits in the item object defined in products.json
        const itemA = Number(a.slug.slice(-4))
        const itemB = Number(b.slug.slice(-4))
        return itemA - itemB
    })

    return {dispatch, REDUCER_ACTIONS,totalItems, totalPrice, cart }
}

// this is a shortcut which gives us the return value from the useCartContext hook
export type useCartContextType = ReturnType<typeof useCartContext> 

const initCartContextState: useCartContextType = {
    dispatch: ()=>  {},
    REDUCER_ACTIONS: REDUCER_ACTION_TYPE,
    totalItems: 0,
    totalPrice:"",
    cart: []
}

const CartContext = createContext<useCartContextType>(initCartContextState)

type ChildrenType = {children?: ReactElement | ReactElement[]}

export const CartProvider = ({children}: ChildrenType): ReactElement =>{
    return (
        <CartContext.Provider value={useCartContext(initCartState)}>
            {children}
        </CartContext.Provider>
    )
}

export default CartContext