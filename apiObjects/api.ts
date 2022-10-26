export interface RestaurantApiObject {
    name: string;
    description: string;
    image?: string;
    restaurantId?: string;
    menu?: RestaurantMenuApiObject;
    address?: AddressApiObject;
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