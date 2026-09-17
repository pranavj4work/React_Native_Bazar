export type DummyUser = {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  gender: string;
  image: string;
};

export type LoginResponse = DummyUser & {
  accessToken: string;
  refreshToken: string;
};

export type DummyProduct = {
  id: number;
  title: string;
  description: string;
  category: string;
  price: number;
  discountPercentage: number;
  rating: number;
  stock: number;
  brand?: string;
  thumbnail: string;
  images: string[];
};

export type ProductPage = {
  products: DummyProduct[];
  total: number;
  skip: number;
  limit: number;
};

export type DummyCategory = {
  slug: string;
  name: string;
  url: string;
};
