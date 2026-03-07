export type AuthProvider = 'local' | 'google';
export type UserRole = 'Admin' | 'Seller' | 'Customer';
export interface UserAddress {
  id: string;
  city: string;
  street: string;
  state?: string;
  phone?: string;
  isDefault: boolean;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  password?: string;
  phone?: string;
  googleId?: string;
  authProvider: AuthProvider;
  role: UserRole;
  isVerified: boolean;
  storeName?: string;
  isApproved: boolean;
  isActive: boolean;
  isDeleted: boolean;
  addresses: UserAddress[];
  //wishlist?: Product
}
