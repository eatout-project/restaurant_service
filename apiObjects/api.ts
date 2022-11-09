export interface RestaurantLogin {
    email: string;
    password: string
}

export interface RestaurantApiObject {
    email: string;
    restaurantName: string;
    description: string;
    address: AddressApiObject;
    image?: string;
    restaurantId?: number;
    menu?: RestaurantMenuApiObject;
}

export interface RestaurantResponseApiObject {
    id: number;
    email: string;
    restaurantName: string;
    description: string;
    restaurantAddress: AddressResponseApiObject;
    image?: string;
    restaurantId?: number;
    restaurantMenu?: RestaurantMenuApiObject;
}

export interface RestaurantMenuApiObject {
    id: number;
    categories?: RestaurantMenuCategoryApiObject[];
}

export interface RestaurantMenuCategoryApiObject {
    id: number;
    title: string;
    items: RestaurantMenuCategoryItemApiObject[]
}

export interface RestaurantMenuCategoryItemApiObject {
    name: string,
    description: string,
    price: number,
    image: string
}

export interface AddressApiObject {
    restaurantId: number,
    streetName: string,
    houseNumber: number,
    zipCode: number,
    city: string
    floor?: number
}

export interface AddressResponseApiObject {
    id: number,
    restaurantId: number,
    streetName: string,
    houseNumber: number,
    zipCode: number,
    city: string
    floor?: number
}

export interface LoginApiObject {
    id: number,
    email: string,
    restaurantName: string,
    description: string
}
