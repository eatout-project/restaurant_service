export interface RestaurantLogin {
    email: string;
    password: string;
}

export interface RestaurantApiObject {
    email: string;
    name: string;
    description: string;
    address: AddressApiObject;
    image?: string;
    restaurantId?: number;
    menu?: MenuApiObject;
}

export interface LoginResponseApiObject {
    id: number;
    email: string;
    name: string;
    description: string;
    menu: MenuApiObject;
}

export interface RegistrationResponseApiObject {
    id: number;
    email: string;
    name: string;
    description: string;
    menuId: number;
}

export interface MenuApiObject {
    id: number;
    categories: CategoryApiObject[] | undefined;
}

export interface MenuDAO {
    id: number;
}

export interface CategoryApiObject {
    id: number;
    title: string;
    items: ItemApiObject[]
}

export interface CategoryDAO {
    id: number;
    menuId: number;
    title: string;
}

export interface CategoryRequestApiObject {
    menuId: number;
    title: string;
}

export interface ItemApiObject {
    id: number;
    categoryId: number;
    name: string;
    description: string;
    price: number;
    image?: string;
}

export interface ItemRequestApiObject {
    categoryId: number;
    name: string;
    description: string;
    price: number;
}

export interface ItemDAO {
    id: number;
    categoryId: number;
    name: string;
    description: string;
    price: number;
}

export interface AddressApiObject {
    restaurantId: number;
    streetName: string;
    houseNumber: number;
    zipCode: number;
    city: string;
    floor?: number;
}

export interface AddressResponseApiObject {
    id: number;
    restaurantId: number;
    streetName: string;
    houseNumber: number;
    zipCode: number;
    city: string;
    floor?: number;
}

export interface LoginApiObject {
    id: number;
    email: string;
    name: string;
    description: string;
}
