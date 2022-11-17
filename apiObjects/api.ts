export interface RestaurantLogin {
    email: string;
    password: string;
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

export interface RestaurantLoginResponseApiObject {
    id: number;
    email: string;
    restaurantName: string;
    description: string;
    restaurantMenu: RestaurantMenuApiObject;
    menuCategories: RestaurantMenuCategoryApiObject[];
    categoryItems: RestaurantMenuCategoryItemApiObject[];
}

export interface RestaurantRegistrationResponseApiObject {
    id: number;
    email: string;
    restaurantName: string;
    description: string;
    menuId: number;
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

export interface CategoryDAO {
    id: number;
    menuId: number;
    title: string;
}

export interface CategoryRequestApiObject {
    menuId: number;
    categoryTitle: string;
}

export interface RestaurantMenuCategoryItemApiObject {
    name: string;
    description: string;
    price: number;
    image: string;
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
    restaurantName: string;
    description: string;
}
