export interface Post {
  external_id: string;
  language: string;
  description: string;
  title: string;
  image_url: string;
  link: string;
  pub_date: string;
  categories: {
    [key: string]: {
      name: string;
      slug: string;
    };
  };
}

export interface NewsProps {
  ids?: number[];
}
